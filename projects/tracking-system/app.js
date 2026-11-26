// === Settings ===
const HOVER_SOUND_URL = "../../tap_01.wav";
const TZ = "Europe/Belgrade";
const CONFIRM_DURATION_MS = 2000;

// === Live Clock (matches main website) ===
function updateClocks() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);

  const hour = parts.find((p) => p.type === "hour")?.value ?? "--";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "--";
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short"
  }).format(now).toUpperCase();

  document.querySelectorAll("[data-clock]").forEach((el) => {
    el.textContent = `${hour}:${minute}`;
  });
  document.querySelectorAll("[data-day]").forEach((el) => {
    el.textContent = day;
  });
}

updateClocks();
setInterval(updateClocks, 10000);

// === Hover Sound (delegated so dynamically rendered buttons work too) ===
let unlocked = false;
const audioBase = new Audio();
audioBase.src = HOVER_SOUND_URL;
audioBase.preload = "auto";
audioBase.volume = 0.7;

async function unlockAudioOnce() {
  if (unlocked) return;
  try {
    const prevVol = audioBase.volume;
    audioBase.volume = 0;
    audioBase.currentTime = 0;
    await audioBase.play();
    audioBase.pause();
    audioBase.currentTime = 0;
    audioBase.volume = prevVol;
    unlocked = true;
  } catch {
    unlocked = false;
  }
}

window.addEventListener("pointerdown", unlockAudioOnce, { capture: true, passive: true });
window.addEventListener("click", unlockAudioOnce, { capture: true, passive: true });
window.addEventListener("keydown", unlockAudioOnce, { capture: true });

let lastPlay = 0;
const COOLDOWN_MS = 80;

function playHoverSound() {
  const now = performance.now();
  if (now - lastPlay < COOLDOWN_MS) return;
  lastPlay = now;
  if (!unlocked) return;

  const clone = audioBase.cloneNode(true);
  clone.volume = audioBase.volume;
  clone.currentTime = 0;
  clone.play().catch(() => {});
}

document.addEventListener("mouseover", (e) => {
  const target = e.target.closest(".hover-sound");
  if (!target || target.disabled) return;
  if (e.relatedTarget && target.contains(e.relatedTarget)) return;
  playHoverSound();
});

// === Sample Warehouse Dataset ===
const INITIAL_PRODUCTS = [
  {
    id: 1,
    sku: "BF-1042",
    orderCode: "ORD-2026-084",
    name: "Modular Acoustic Wall Panels",
    client: "Nordic Audio Group",
    bay: "BAY A-04",
    orderTarget: 240,
    production: 60,
    warehouse: 90,
    packed: 50,
    sent: 40
  },
  {
    id: 2,
    sku: "BF-1088",
    orderCode: "ORD-2026-091",
    name: "Anodized Aluminum Display Frames",
    client: "Kova Retail Studio",
    bay: "BAY B-12",
    orderTarget: 180,
    production: 45,
    warehouse: 55,
    packed: 30,
    sent: 20
  },
  {
    id: 3,
    sku: "BF-2015",
    orderCode: "ORD-2026-097",
    name: "Custom Packaging Rigid Boxes",
    client: "Vela Cosmetics EU",
    bay: "BAY C-02",
    orderTarget: 500,
    production: 0,
    warehouse: 190,
    packed: 160,
    sent: 150
  },
  {
    id: 4,
    sku: "BF-2049",
    orderCode: "ORD-2026-103",
    name: "Precision LED Track Fixtures",
    client: "Atrium Architecture",
    bay: "BAY A-11",
    orderTarget: 150,
    production: 40,
    warehouse: 35,
    packed: 15,
    sent: 10
  },
  {
    id: 5,
    sku: "BF-3007",
    orderCode: "ORD-2026-108",
    name: "Matte Steel Signage Kits",
    client: "Monolith Hospitality",
    bay: "BAY D-07",
    orderTarget: 120,
    production: 0,
    warehouse: 0,
    packed: 45,
    sent: 75
  },
  {
    id: 6,
    sku: "BF-3094",
    orderCode: "ORD-2026-112",
    name: "Branded Exhibition Counter Units",
    client: "FormLab Belgrade",
    bay: "BAY B-03",
    orderTarget: 90,
    production: 0,
    warehouse: 0,
    packed: 0,
    sent: 90
  }
];

let products = INITIAL_PRODUCTS.map((item) => ({ ...item }));
let activeFilter = "all";
let searchQuery = "";
let authTimerId = null;
let countdownIntervalId = null;

// === DOM References ===
const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMsg = document.getElementById("confirmMsg");
const confirmProgressFill = document.getElementById("confirmProgressFill");
const confirmTimer = document.getElementById("confirmTimer");
const operatorPill = document.getElementById("operatorPill");

const authTabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authHeading = document.getElementById("authHeading");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");

const statusGrid = document.getElementById("statusGrid");
const gridStatus = document.getElementById("gridStatus");
const searchInput = document.getElementById("searchInput");
const resetDemoBtn = document.getElementById("resetDemoBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusFilterBtns = Array.from(document.querySelectorAll("[data-status-filter]"));

// === Helpers ===
const pad2 = (n) => String(n).padStart(2, "0");

function getDerived(item) {
  const inStock = item.warehouse + item.packed;
  const completedForOrder = item.warehouse + item.packed + item.sent;
  const neededToFinish = Math.max(0, item.orderTarget - completedForOrder);
  const fulfillmentPct = item.orderTarget > 0
    ? Math.min(100, Math.round((completedForOrder / item.orderTarget) * 100))
    : 100;
  const totalUnits = item.production + item.warehouse + item.packed + item.sent;

  let primaryStatus = { key: "sent", label: "ORDER SENT" };
  if (neededToFinish > 0 && item.production < neededToFinish) {
    primaryStatus = { key: "needed", label: "NEEDS PRODUCTION" };
  } else if (item.production > 0) {
    primaryStatus = { key: "production", label: "IN PRODUCTION" };
  } else if (item.warehouse > 0) {
    primaryStatus = { key: "warehouse", label: "IN WAREHOUSE" };
  } else if (item.packed > 0) {
    primaryStatus = { key: "packed", label: "PACKED / READY" };
  }

  return {
    inStock,
    completedForOrder,
    neededToFinish,
    fulfillmentPct,
    totalUnits,
    primaryStatus
  };
}

// === Auth Mode Switching ===
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.authTab;
    const isLogin = mode === "login";

    authTabs.forEach((btn) => {
      const selected = btn === tab;
      btn.classList.toggle("is-active", selected);
      btn.setAttribute("aria-selected", String(selected));
    });

    loginForm.classList.toggle("is-hidden", !isLogin);
    registerForm.classList.toggle("is-hidden", isLogin);
    loginError.textContent = "";
    registerError.textContent = "";

    if (authHeading) {
      authHeading.textContent = isLogin
        ? "SIGN IN TO WAREHOUSE TRACKER"
        : "CREATE SAMPLE OPERATOR ACCOUNT";
    }
  });
});

// Password visibility toggles
document.querySelectorAll("[data-toggle-pass]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.togglePass);
    if (!input) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? "HIDE" : "SHOW";
  });
});

// === 2-Second Confirmation Flow -> Enter App ===
function triggerAuthSuccess({ title, message, operatorLabel }) {
  if (authTimerId) clearTimeout(authTimerId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);

  if (confirmTitle) confirmTitle.textContent = title;
  if (confirmMsg) confirmMsg.innerHTML = message;
  if (operatorPill) operatorPill.textContent = `USER: ${operatorLabel.toUpperCase()}`;

  // Restart progress bar animation cleanly
  confirmProgressFill.classList.remove("is-running");
  void confirmProgressFill.offsetWidth;
  confirmProgressFill.classList.add("is-running");

  confirmOverlay.classList.add("is-active");
  confirmOverlay.setAttribute("aria-hidden", "false");

  const start = performance.now();
  confirmTimer.textContent = "ENTERING SYSTEM IN 2.0S";

  countdownIntervalId = setInterval(() => {
    const remaining = Math.max(0, (CONFIRM_DURATION_MS - (performance.now() - start)) / 1000);
    confirmTimer.textContent = `ENTERING SYSTEM IN ${remaining.toFixed(1)}S`;
  }, 100);

  authTimerId = setTimeout(() => {
    clearInterval(countdownIntervalId);
    confirmOverlay.classList.remove("is-active");
    confirmOverlay.setAttribute("aria-hidden", "true");
    confirmProgressFill.classList.remove("is-running");

    authView.classList.add("is-hidden");
    appView.classList.remove("is-hidden");
    window.scrollTo(0, 0);
    renderDashboard();
  }, CONFIRM_DURATION_MS);
}

// Login submit (accepts admin/admin or any non-empty demo input, hints if blank)
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("loginUsername").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();

  if (!user || !pass) {
    loginError.textContent = "Please enter username and password (demo: admin / admin).";
    return;
  }

  loginError.textContent = "";
  triggerAuthSuccess({
    title: "LOGIN SUCCESSFUL",
    message: `Authenticated as <strong>${escapeHtml(user)}</strong>. Loading ::BEFORE SOLUTIONS Tracking System...`,
    operatorLabel: user
  });
});

// Register submit (demo)
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const user = document.getElementById("regUsername").value.trim();
  const pass = document.getElementById("regPassword").value.trim();

  if (!name || !user || !pass) {
    registerError.textContent = "Please complete name, username, and password.";
    return;
  }

  registerError.textContent = "";
  triggerAuthSuccess({
    title: "REGISTRATION COMPLETE",
    message: `Demo account created for <strong>${escapeHtml(name)}</strong>. Entering warehouse tracker...`,
    operatorLabel: user
  });
});

// Sample Google / Apple sign-in (enters app directly without real OAuth)
document.querySelectorAll("[data-oauth]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.oauth;
    triggerAuthSuccess({
      title: `${provider.toUpperCase()} ACCESS GRANTED`,
      message: `Sample sign-in via <strong>${escapeHtml(provider)}</strong> confirmed. Launching warehouse tracker...`,
      operatorLabel: `${provider} DEMO`
    });
  });
});

// Logout back to auth screen
logoutBtn.addEventListener("click", () => {
  appView.classList.add("is-hidden");
  authView.classList.remove("is-hidden");
  window.scrollTo(0, 0);
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

// === Dashboard Filtering & Rendering ===
function matchesStatusFilter(item, filter) {
  const d = getDerived(item);
  switch (filter) {
    case "all":
      return true;
    case "needs-work":
      return d.neededToFinish > 0;
    case "production":
      return item.production > 0;
    case "warehouse":
      return item.warehouse > 0;
    case "packed":
      return item.packed > 0;
    case "sent":
      return item.sent > 0;
    default:
      return true;
  }
}

function matchesSearch(item, q) {
  if (!q) return true;
  const hay = `${item.sku} ${item.orderCode} ${item.name} ${item.client} ${item.bay}`.toLowerCase();
  return hay.includes(q);
}

function updateKPIs() {
  let totalStock = 0;
  let totalNeeded = 0;
  let totalOrderTarget = 0;
  let totalProduction = 0;
  let totalWarehouse = 0;
  let totalPacked = 0;
  let totalSent = 0;

  products.forEach((item) => {
    const d = getDerived(item);
    totalStock += d.inStock;
    totalNeeded += d.neededToFinish;
    totalOrderTarget += item.orderTarget;
    totalProduction += item.production;
    totalWarehouse += item.warehouse;
    totalPacked += item.packed;
    totalSent += item.sent;
  });

  const totalPipeline = totalProduction + totalWarehouse + totalPacked + totalSent;
  const pctOfPipeline = (val) => (totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0);
  const stockCoveragePct = totalOrderTarget > 0 ? Math.min(100, Math.round((totalStock / totalOrderTarget) * 100)) : 0;
  const neededPct = totalOrderTarget > 0 ? Math.min(100, Math.round((totalNeeded / totalOrderTarget) * 100)) : 0;

  document.getElementById("kpiStock").textContent = totalStock.toLocaleString();
  document.getElementById("kpiStockSub").textContent = `${stockCoveragePct}% OF ${totalOrderTarget.toLocaleString()} ORDERED`;
  document.getElementById("kpiStockBar").style.width = `${stockCoveragePct}%`;

  document.getElementById("kpiNeeded").textContent = totalNeeded.toLocaleString();
  document.getElementById("kpiNeededSub").textContent = totalNeeded === 0
    ? "ALL CLIENT ORDERS COVERED"
    : `${neededPct}% REMAINING TO PRODUCE`;
  document.getElementById("kpiNeededBar").style.width = `${neededPct}%`;

  document.getElementById("kpiProduction").textContent = totalProduction.toLocaleString();
  document.getElementById("kpiProductionSub").textContent = `${pctOfPipeline(totalProduction)}% OF PIPELINE`;
  document.getElementById("kpiProductionBar").style.width = `${pctOfPipeline(totalProduction)}%`;

  document.getElementById("kpiWarehouse").textContent = totalWarehouse.toLocaleString();
  document.getElementById("kpiWarehouseSub").textContent = `${pctOfPipeline(totalWarehouse)}% OF PIPELINE`;
  document.getElementById("kpiWarehouseBar").style.width = `${pctOfPipeline(totalWarehouse)}%`;

  document.getElementById("kpiPacked").textContent = totalPacked.toLocaleString();
  document.getElementById("kpiPackedSub").textContent = `${pctOfPipeline(totalPacked)}% OF PIPELINE`;
  document.getElementById("kpiPackedBar").style.width = `${pctOfPipeline(totalPacked)}%`;

  document.getElementById("kpiSent").textContent = totalSent.toLocaleString();
  document.getElementById("kpiSentSub").textContent = `${pctOfPipeline(totalSent)}% OF PIPELINE`;
  document.getElementById("kpiSentBar").style.width = `${pctOfPipeline(totalSent)}%`;

  // Pipeline distribution bar
  document.getElementById("pipelineTotal").textContent = `${totalPipeline.toLocaleString()} TOTAL UNITS`;
  document.getElementById("segProduction").style.width = `${pctOfPipeline(totalProduction)}%`;
  document.getElementById("segWarehouse").style.width = `${pctOfPipeline(totalWarehouse)}%`;
  document.getElementById("segPacked").style.width = `${pctOfPipeline(totalPacked)}%`;
  document.getElementById("segSent").style.width = `${pctOfPipeline(totalSent)}%`;

  document.getElementById("pipelineLegend").innerHTML = `
    <span class="pipeline-legend__item"><span class="dot dot--production"></span>PRODUCTION ${pctOfPipeline(totalProduction)}%</span>
    <span class="pipeline-legend__item"><span class="dot dot--warehouse"></span>WAREHOUSE ${pctOfPipeline(totalWarehouse)}%</span>
    <span class="pipeline-legend__item"><span class="dot dot--packed"></span>PACKED ${pctOfPipeline(totalPacked)}%</span>
    <span class="pipeline-legend__item"><span class="dot dot--sent"></span>SENT ${pctOfPipeline(totalSent)}%</span>
  `;
}

function updateFilterCounts() {
  document.querySelectorAll("[data-status-count]").forEach((el) => {
    const key = el.dataset.statusCount;
    const count = products.filter((item) => matchesStatusFilter(item, key)).length;
    el.textContent = pad2(count);
  });
}

function renderDashboard() {
  updateKPIs();
  updateFilterCounts();

  const visible = products.filter(
    (item) => matchesStatusFilter(item, activeFilter) && matchesSearch(item, searchQuery)
  );

  const label = visible.length === 1 ? "PRODUCT" : "PRODUCTS";
  gridStatus.textContent = `SHOWING ${pad2(visible.length)} ${label}`;

  if (visible.length === 0) {
    statusGrid.innerHTML = `<div class="empty-state">NO PRODUCTS MATCH THIS FILTER OR SEARCH QUERY</div>`;
    return;
  }

  statusGrid.innerHTML = visible.map((item, idx) => {
    const d = getDerived(item);
    const maxStage = Math.max(item.orderTarget, d.totalUnits, 1);
    const canAdvance = item.production > 0 || item.warehouse > 0 || item.packed > 0;
    const fillColor = d.neededToFinish === 0 ? "var(--c-stock)" : "var(--c-needed)";

    const produceBtnLabel = item.production > 0
      ? "FINISH +10 TO WAREHOUSE"
      : d.neededToFinish > 0
        ? "START +10 PRODUCTION"
        : "ADD +10 BUFFER STOCK";

    return `
      <article class="status-card" data-id="${item.id}">
        <div class="status-card__head">
          <div class="status-card__ids">
            <span class="status-card__index">${pad2(idx + 1)}</span>
            <span>${escapeHtml(item.sku)}</span>
            <span>/</span>
            <span>${escapeHtml(item.orderCode)}</span>
          </div>
          <span class="status-badge status-badge--${d.primaryStatus.key}">
            <span class="dot dot--${d.primaryStatus.key}"></span>
            ${d.primaryStatus.label}
          </span>
        </div>

        <div class="status-card__body">
          <div>
            <h2 class="status-card__title">${escapeHtml(item.name)}</h2>
            <p class="status-card__client">CLIENT: ${escapeHtml(item.client)} — ${escapeHtml(item.bay)}</p>
          </div>

          <div class="order-meter">
            <div class="order-meter__stats">
              <div>
                <span class="mini-stat__label">IN STOCK</span>
                <span class="mini-stat__val mini-stat__val--stock">${d.inStock}</span>
              </div>
              <div>
                <span class="mini-stat__label">CLIENT ORDER</span>
                <span class="mini-stat__val">${item.orderTarget}</span>
              </div>
              <div>
                <span class="mini-stat__label">NEEDED TO FINISH</span>
                <span class="mini-stat__val ${d.neededToFinish > 0 ? "mini-stat__val--needed" : "mini-stat__val--done"}">
                  ${d.neededToFinish > 0 ? d.neededToFinish : "0 ✓"}
                </span>
              </div>
            </div>

            <div class="order-meter__bar-head">
              <span>ORDER READINESS</span>
              <span>${d.fulfillmentPct}% (${d.completedForOrder}/${item.orderTarget})</span>
            </div>
            <div class="order-meter__track">
              <div class="order-meter__fill" style="width:${d.fulfillmentPct}%; background:${fillColor};"></div>
            </div>
          </div>

          <div class="stage-grid" aria-label="Unit breakdown by warehouse stage">
            <div class="stage-cell ${item.production > 0 ? "is-nonzero" : ""}">
              <span class="stage-cell__head"><span class="dot dot--production"></span>PRODUCTION</span>
              <span class="stage-cell__val">${item.production}</span>
              <div class="stage-cell__bar">
                <span style="width:${Math.round((item.production / maxStage) * 100)}%; background:var(--c-production);"></span>
              </div>
            </div>

            <div class="stage-cell ${item.warehouse > 0 ? "is-nonzero" : ""}">
              <span class="stage-cell__head"><span class="dot dot--warehouse"></span>WAREHOUSE</span>
              <span class="stage-cell__val">${item.warehouse}</span>
              <div class="stage-cell__bar">
                <span style="width:${Math.round((item.warehouse / maxStage) * 100)}%; background:var(--c-warehouse);"></span>
              </div>
            </div>

            <div class="stage-cell ${item.packed > 0 ? "is-nonzero" : ""}">
              <span class="stage-cell__head"><span class="dot dot--packed"></span>PACKED</span>
              <span class="stage-cell__val">${item.packed}</span>
              <div class="stage-cell__bar">
                <span style="width:${Math.round((item.packed / maxStage) * 100)}%; background:var(--c-packed);"></span>
              </div>
            </div>

            <div class="stage-cell ${item.sent > 0 ? "is-nonzero" : ""}">
              <span class="stage-cell__head"><span class="dot dot--sent"></span>SENT</span>
              <span class="stage-cell__val">${item.sent}</span>
              <div class="stage-cell__bar">
                <span style="width:${Math.round((item.sent / maxStage) * 100)}%; background:var(--c-sent);"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="project-card__foot">
          <button class="project-link hover-sound" type="button" data-action="produce" data-id="${item.id}">
            <span>${produceBtnLabel}</span>
            <span>+</span>
          </button>
          <button class="project-link hover-sound" type="button" data-action="advance" data-id="${item.id}" ${canAdvance ? "" : "disabled"}>
            <span>${canAdvance ? "ADVANCE BATCH" : "ALL UNITS SENT"}</span>
            <span>${canAdvance ? "→" : "✓"}</span>
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// === Interactive Actions on Cards ===
statusGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const item = products.find((p) => p.id === id);
  if (!item) return;

  const d = getDerived(item);

  if (action === "produce") {
    if (item.production > 0) {
      const moved = Math.min(10, item.production);
      item.production -= moved;
      item.warehouse += moved;
    } else if (d.neededToFinish > 0) {
      item.production += Math.min(10, d.neededToFinish);
    } else {
      item.warehouse += 10;
    }
    renderDashboard();
  } else if (action === "advance") {
    if (item.production > 0) {
      const moved = Math.min(15, item.production);
      item.production -= moved;
      item.warehouse += moved;
    } else if (item.warehouse > 0) {
      const moved = Math.min(15, item.warehouse);
      item.warehouse -= moved;
      item.packed += moved;
    } else if (item.packed > 0) {
      const moved = Math.min(15, item.packed);
      item.packed -= moved;
      item.sent += moved;
    }
    renderDashboard();
  }
});

// === Filter & Search Controls ===
statusFilterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.statusFilter || "all";
    statusFilterBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    renderDashboard();
  });
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderDashboard();
});

resetDemoBtn.addEventListener("click", () => {
  products = INITIAL_PRODUCTS.map((item) => ({ ...item }));
  activeFilter = "all";
  searchQuery = "";
  searchInput.value = "";
  statusFilterBtns.forEach((b) => {
    const active = b.dataset.statusFilter === "all";
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  renderDashboard();
});
