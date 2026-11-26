// =========================================================================
// ::BEFORE SOLUTIONS — CREATIVE TOOL STUDIO (Pure Vanilla JS)
// =========================================================================

const STORAGE_KEY = "before_creative_studio_v1";
const HOVER_SOUND_URL = "../../tap_01.wav";
const TZ = "Europe/Belgrade";

const TOOL_TITLES = {
  palette: "01 / COLOR PALETTE GENERATOR",
  glass: "02 / GRADIENT · NOISE · GLASSMORPHISM",
  layout: "03 / FLEX & GRID LAYOUT ENGINE",
  type: "04 / MODULAR TYPOGRAPHY SCALE",
  buttons: "05 / BUTTON LAB — FIGMA GLASS & STATES"
};

const AREA_PRESETS = {
  dashboard: [
    "\"header header header\"",
    "\"sidebar main main\"",
    "\"sidebar footer footer\""
  ].join("\n"),
  bento: [
    "\"hero hero side\"",
    "\"card1 card2 side\""
  ].join("\n"),
  editorial: [
    "\"title title meta\"",
    "\"body body aside\"",
    "\"footer footer footer\""
  ].join("\n"),
  holygrail: [
    "\"header header header\"",
    "\"nav main aside\"",
    "\"footer footer footer\""
  ].join("\n")
};

const GLASS_PRESETS = {
  before: {
    type: "linear",
    angle: 135,
    stops: [
      { color: "#380eaa", pos: 0 },
      { color: "#6d4aff", pos: 48 },
      { color: "#111858", pos: 100 }
    ]
  },
  cyber: {
    type: "linear",
    angle: 125,
    stops: [
      { color: "#091826", pos: 0 },
      { color: "#0ea5e9", pos: 52 },
      { color: "#2dd4bf", pos: 100 }
    ]
  },
  ember: {
    type: "radial",
    angle: 135,
    stops: [
      { color: "#f97316", pos: 0 },
      { color: "#e11d48", pos: 55 },
      { color: "#1b0b18", pos: 100 }
    ]
  },
  aurora: {
    type: "conic",
    angle: 210,
    stops: [
      { color: "#6d4aff", pos: 0 },
      { color: "#2dd4bf", pos: 35 },
      { color: "#38bdf8", pos: 68 },
      { color: "#6d4aff", pos: 100 }
    ]
  }
};

const RATIO_LABELS = {
  "1.067": "Minor Second",
  "1.125": "Major Second",
  "1.200": "Minor Third",
  "1.250": "Major Third",
  "1.333": "Perfect Fourth",
  "1.414": "Augmented Fourth",
  "1.500": "Perfect Fifth",
  "1.618": "Golden Ratio"
};

const BUTTON_PRESETS = {
  figmaGlass: {
    fillMode: "glass",
    color1: "#FFFFFF",
    color2: "#38BDF8",
    gradAngle: 135,
    textColor: "#FFFFFF",
    glassBlur: 16,
    glassOpacity: 14,
    glassSpecular: 52,
    glassSaturate: 170,
    font: "'DM Sans', sans-serif",
    transform: "none",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.04,
    padX: 28,
    padY: 14,
    radius: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#FFFFFF",
    borderOpacity: 32,
    shadowEnabled: true,
    shadowY: 12,
    shadowBlur: 32,
    shadowSpread: -4,
    shadowColor: "#000000",
    shadowOpacity: 42,
    glowEnabled: false,
    glowColor: "#6D4AFF",
    glowSize: 24,
    hoverEffect: "lift"
  },
  beforeSolid: {
    fillMode: "solid",
    color1: "#F2F2F2",
    color2: "#E9E9EA",
    gradAngle: 135,
    textColor: "#111111",
    glassBlur: 12,
    glassOpacity: 14,
    glassSpecular: 35,
    glassSaturate: 150,
    font: "'Roboto', sans-serif",
    transform: "uppercase",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.12,
    padX: 24,
    padY: 13,
    radius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#FFFFFF",
    borderOpacity: 100,
    shadowEnabled: false,
    shadowY: 8,
    shadowBlur: 20,
    shadowSpread: 0,
    shadowColor: "#000000",
    shadowOpacity: 35,
    glowEnabled: false,
    glowColor: "#FFFFFF",
    glowSize: 20,
    hoverEffect: "invert"
  },
  neonGradient: {
    fillMode: "gradient",
    color1: "#6D4AFF",
    color2: "#2DD4BF",
    gradAngle: 125,
    textColor: "#FFFFFF",
    glassBlur: 14,
    glassOpacity: 16,
    glassSpecular: 40,
    glassSaturate: 160,
    font: "'Space Grotesk', sans-serif",
    transform: "uppercase",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.08,
    padX: 30,
    padY: 14,
    radius: 40,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#FFFFFF",
    borderOpacity: 24,
    shadowEnabled: true,
    shadowY: 10,
    shadowBlur: 28,
    shadowSpread: -4,
    shadowColor: "#000000",
    shadowOpacity: 45,
    glowEnabled: true,
    glowColor: "#6D4AFF",
    glowSize: 28,
    hoverEffect: "shine"
  },
  ghostOutline: {
    fillMode: "outline",
    color1: "#E9E9EA",
    color2: "#38BDF8",
    gradAngle: 135,
    textColor: "#E9E9EA",
    glassBlur: 8,
    glassOpacity: 8,
    glassSpecular: 20,
    glassSaturate: 130,
    font: "'JetBrains Mono', monospace",
    transform: "uppercase",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.12,
    padX: 26,
    padY: 13,
    radius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#E9E9EA",
    borderOpacity: 40,
    shadowEnabled: false,
    shadowY: 8,
    shadowBlur: 20,
    shadowSpread: 0,
    shadowColor: "#000000",
    shadowOpacity: 30,
    glowEnabled: false,
    glowColor: "#38BDF8",
    glowSize: 22,
    hoverEffect: "invert"
  }
};

// === Color Math Utilities ===
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function normalizeHex(hex) {
  let clean = String(hex || "").trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#6D4AFF";
  return `#${clean.toUpperCase()}`;
}

function hexToRgb(hex) {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h *= 60;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0, g = 0, b = 0;
  if (hn < 60) { r = c; g = x; }
  else if (hn < 120) { r = x; g = c; }
  else if (hn < 180) { g = c; b = x; }
  else if (hn < 240) { g = x; b = c; }
  else if (hn < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function bestTextColor(bgHex) {
  return contrastRatio(bgHex, "#111111") >= contrastRatio(bgHex, "#FFFFFF") ? "#111111" : "#FFFFFF";
}

function hexToRgbaString(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// === Default State ===
function createDefaultState() {
  const seed = "#6D4AFF";
  const initialSwatches = generateHarmonyColors(seed, "analogous", 5).map((hex) => ({
    hex,
    locked: false
  }));

  return {
    activeTool: "palette",
    soundEnabled: true,
    studioThemeApplied: false,
    studioAccent: "#E9E9EA",
    studioAccent2: "#8B5CF6",
    palette: {
      harmony: "analogous",
      seed,
      count: 5,
      uiSurface: "dark",
      swatches: initialSwatches
    },
    glass: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#380eaa", pos: 0 },
        { color: "#6d4aff", pos: 48 },
        { color: "#111858", pos: 100 }
      ],
      noiseEnabled: true,
      noiseType: "fractalNoise",
      noiseIntensity: 22,
      noiseScale: 0.75,
      glassEnabled: true,
      blur: 18,
      opacity: 14,
      border: 26,
      saturate: 150
    },
    layout: {
      mode: "flex",
      direction: "row",
      wrap: "wrap",
      flexJustify: "space-between",
      flexAlign: "center",
      gridCols: 3,
      gridRows: 2,
      gridJustify: "stretch",
      gridAlign: "stretch",
      gap: 14,
      useAreas: false,
      areaPreset: "dashboard",
      templateAreas: AREA_PRESETS.dashboard,
      selectedIndex: 0,
      items: [
        { id: 1, label: "Header", grow: 1, colSpan: 1, rowSpan: 1 },
        { id: 2, label: "Sidebar", grow: 0, colSpan: 1, rowSpan: 1 },
        { id: 3, label: "Primary", grow: 2, colSpan: 1, rowSpan: 1 },
        { id: 4, label: "Metrics", grow: 1, colSpan: 1, rowSpan: 1 },
        { id: 5, label: "Feed", grow: 1, colSpan: 1, rowSpan: 1 },
        { id: 6, label: "Footer", grow: 1, colSpan: 1, rowSpan: 1 }
      ]
    },
    type: {
      view: "single",
      base: 16,
      ratio: 1.25,
      compareRatio: 1.333,
      font: "'DM Sans', sans-serif",
      weight: 700,
      lineHeight: 1.18,
      tracking: -0.02,
      sample: "Design systems built with precision."
    },
    buttons: {
      preset: "figmaGlass",
      stageBg: "mesh",
      text: "Explore Studio",
      icon: "→",
      iconPos: "right",
      ...BUTTON_PRESETS.figmaGlass
    }
  };
}

function generateHarmonyColors(seedHex, harmony, count, existing = []) {
  const { h, s, l } = hexToHsl(seedHex);
  const out = [];

  for (let i = 0; i < count; i++) {
    if (existing[i] && existing[i].locked) {
      out.push(existing[i].hex);
      continue;
    }

    if (harmony === "custom" && existing[i]) {
      out.push(existing[i].hex);
      continue;
    }

    const t = count > 1 ? i / (count - 1) : 0;
    let nh = h;
    let ns = s;
    let nl = l;

    switch (harmony) {
      case "complementary": {
        const half = Math.ceil(count / 2);
        if (i < half) {
          nh = h + (i * 8);
          nl = clamp(l - 12 + i * 11, 22, 82);
        } else {
          const j = i - half;
          nh = h + 180 + (j * 8);
          nl = clamp(l - 8 + j * 12, 24, 80);
        }
        ns = clamp(s - 4 + (i % 3) * 6, 35, 92);
        break;
      }
      case "triadic": {
        const triad = [0, 120, 240];
        nh = h + triad[i % 3] + Math.floor(i / 3) * 14;
        ns = clamp(s - 6 + (i % 2) * 10, 40, 92);
        nl = clamp(42 + (i * 7) % 34, 30, 78);
        break;
      }
      case "monochromatic": {
        nh = h;
        ns = clamp(s - 18 + Math.round(t * 24), 18, 95);
        nl = clamp(Math.round(20 + t * 62), 16, 86);
        break;
      }
      case "analogous":
      default: {
        const spread = 96;
        nh = h - spread / 2 + t * spread;
        ns = clamp(s - 8 + Math.sin(t * Math.PI) * 16, 38, 94);
        nl = clamp(l - 10 + t * 20, 28, 78);
        break;
      }
    }

    out.push(hslToHex(nh, ns, nl));
  }

  return out;
}

// === Load Saved State ===
function loadState() {
  const def = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    const saved = JSON.parse(raw);
    return {
      ...def,
      ...saved,
      palette: { ...def.palette, ...(saved.palette || {}) },
      glass: { ...def.glass, ...(saved.glass || {}) },
      layout: { ...def.layout, ...(saved.layout || {}) },
      type: { ...def.type, ...(saved.type || {}) },
      buttons: { ...def.buttons, ...(saved.buttons || {}) }
    };
  } catch {
    return def;
  }
}

let state = loadState();

function persistState(silent = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!silent) showToast("STUDIO STATE SAVED TO LOCALSTORAGE");
  } catch {
    if (!silent) showToast("COULD NOT SAVE STATE");
  }
}

// === Clock ===
function updateClock() {
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

  const clockEl = document.getElementById("clock");
  const dayEl = document.getElementById("day");
  if (clockEl) clockEl.textContent = `${hour}:${minute}`;
  if (dayEl) dayEl.textContent = day;
}
updateClock();
setInterval(updateClock, 10000);

// === Audio Feedback (reuses main site's tap_01.wav + subtle micro-click) ===
let audioUnlocked = false;
const audioBase = new Audio();
audioBase.src = HOVER_SOUND_URL;
audioBase.preload = "auto";
audioBase.volume = 0.55;

async function unlockAudio() {
  if (audioUnlocked) return;
  try {
    const prev = audioBase.volume;
    audioBase.volume = 0;
    await audioBase.play();
    audioBase.pause();
    audioBase.currentTime = 0;
    audioBase.volume = prev;
    audioUnlocked = true;
  } catch {
    audioUnlocked = false;
  }
}
window.addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
window.addEventListener("keydown", unlockAudio, { capture: true });

let lastSoundAt = 0;
function playHoverSound() {
  if (!state.soundEnabled || !audioUnlocked) return;
  const now = performance.now();
  if (now - lastSoundAt < 85) return;
  lastSoundAt = now;
  const clone = audioBase.cloneNode(true);
  clone.volume = audioBase.volume;
  clone.play().catch(() => {});
}

let audioCtx = null;
function playClickTick(freq = 540) {
  if (!state.soundEnabled) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.045);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch {
    // Audio optional
  }
}

document.addEventListener("mouseover", (e) => {
  const target = e.target.closest(".hover-sound");
  if (!target || target.disabled) return;
  if (e.relatedTarget && target.contains(e.relatedTarget)) return;
  playHoverSound();
});

// === Toast & Clipboard ===
const toastEl = document.getElementById("toast");
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-visible");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2100);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    playClickTick(720);
    showToast(`COPIED ${label}`);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(`COPIED ${label}`);
  }
}

// === Global Studio Theme Hook ("Apply to Studio") ===
const resetThemeBtn = document.getElementById("resetThemeBtn");

function applyStudioThemeVars() {
  const root = document.documentElement;
  if (state.studioThemeApplied) {
    const accent = state.studioAccent;
    const accent2 = state.studioAccent2 || accent;
    root.style.setProperty("--studio-accent", accent);
    root.style.setProperty("--studio-accent-2", accent2);
    root.style.setProperty("--studio-accent-fg", bestTextColor(accent));
    root.style.setProperty("--studio-glow", hexToRgbaString(accent, 0.22));
    root.style.setProperty("--studio-accent-soft", hexToRgbaString(accent, 0.14));
    resetThemeBtn.classList.remove("is-hidden");
  } else {
    root.style.setProperty("--studio-accent", "#e9e9ea");
    root.style.setProperty("--studio-accent-2", "#8b5cf6");
    root.style.setProperty("--studio-accent-fg", "#111111");
    root.style.setProperty("--studio-glow", "rgba(139,92,246,.16)");
    root.style.setProperty("--studio-accent-soft", "rgba(233,233,234,.08)");
    resetThemeBtn.classList.add("is-hidden");
  }
}

// === Tool Navigation ===
const railBtns = Array.from(document.querySelectorAll("[data-tool]"));
const inspectorPanes = Array.from(document.querySelectorAll("[data-pane]"));
const stagePanes = Array.from(document.querySelectorAll("[data-stage]"));
const activeToolBanner = document.getElementById("activeToolBanner");

function setActiveTool(toolName) {
  state.activeTool = toolName;
  railBtns.forEach((btn) => {
    const active = btn.dataset.tool === toolName;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  inspectorPanes.forEach((p) => p.classList.toggle("is-active", p.dataset.pane === toolName));
  stagePanes.forEach((s) => s.classList.toggle("is-active", s.dataset.stage === toolName));
  if (activeToolBanner) activeToolBanner.textContent = TOOL_TITLES[toolName] || "";
  playClickTick(520);
  persistState(true);
}

railBtns.forEach((btn) => {
  btn.addEventListener("click", () => setActiveTool(btn.dataset.tool));
});

// =========================================================================
// MODULE 01: COLOR PALETTE GENERATOR
// =========================================================================
const paletteSeedInput = document.getElementById("paletteSeed");
const paletteSeedHexInput = document.getElementById("paletteSeedHex");
const paletteSeedVal = document.getElementById("paletteSeedVal");
const paletteCountInput = document.getElementById("paletteCount");
const paletteCountVal = document.getElementById("paletteCountVal");
const paletteSwatchesEl = document.getElementById("paletteSwatches");
const paletteMetaLabel = document.getElementById("paletteMetaLabel");
const paletteCssOutput = document.getElementById("paletteCssOutput");
const uiPreviewShell = document.getElementById("uiPreviewShell");

function getPaletteCssText() {
  const lines = [":root {"];
  state.palette.swatches.forEach((sw, idx) => {
    lines.push(`  --palette-${idx + 1}: ${sw.hex};`);
  });
  lines.push("}");
  return lines.join("\n");
}

function regeneratePalette(newSeed = null) {
  if (newSeed) {
    state.palette.seed = normalizeHex(newSeed);
  }
  const colors = generateHarmonyColors(
    state.palette.seed,
    state.palette.harmony,
    state.palette.count,
    state.palette.swatches
  );
  state.palette.swatches = colors.map((hex, i) => ({
    hex,
    locked: Boolean(state.palette.swatches[i]?.locked)
  }));
  renderPalette();
  persistState(true);
}

function renderPalette() {
  const { harmony, seed, count, swatches, uiSurface } = state.palette;

  paletteSeedInput.value = seed.toLowerCase();
  paletteSeedHexInput.value = seed;
  paletteSeedVal.textContent = seed;
  paletteCountInput.value = count;
  paletteCountVal.textContent = `${count} COLORS`;

  document.querySelectorAll("[data-harmony]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.harmony === harmony);
  });

  document.querySelectorAll("[data-ui-surface]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.uiSurface === uiSurface);
  });
  uiPreviewShell.classList.toggle("is-light", uiSurface === "light");

  paletteMetaLabel.textContent = `${harmony.toUpperCase()} · ${count} SWATCHES · CLICK ANY FORMAT TO COPY`;

  // Apply to live UI component preview
  const root = document.documentElement;
  for (let i = 0; i < 5; i++) {
    const col = swatches[i % swatches.length].hex;
    root.style.setProperty(`--p${i + 1}`, col);
  }
  root.style.setProperty("--p1-fg", bestTextColor(swatches[0].hex));
  root.style.setProperty("--p2-fg", bestTextColor(swatches[1 % swatches.length].hex));

  // Render swatches
  paletteSwatchesEl.innerHTML = swatches.map((sw, idx) => {
    const rgb = hexToRgb(sw.hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    const crDark = contrastRatio(sw.hex, "#0B0B0C");
    const crLabel = crDark >= 7 ? "AAA" : crDark >= 4.5 ? "AA" : "UI";

    return `
      <article class="swatch-card" data-swatch-idx="${idx}">
        <div class="swatch-card__color" style="background:${sw.hex};">
          <div class="swatch-card__top">
            <span class="swatch-chip">0${idx + 1} · ${crLabel}</span>
            <button class="swatch-lock hover-sound ${sw.locked ? "is-locked" : ""}" type="button" data-lock-idx="${idx}" aria-pressed="${sw.locked}">
              ${sw.locked ? "LOCKED" : "UNLOCK"}
            </button>
          </div>
          <div class="swatch-card__picker-wrap">
            <span class="swatch-chip">${sw.hex}</span>
            <input class="swatch-native-picker" type="color" value="${sw.hex.toLowerCase()}" data-pick-idx="${idx}" aria-label="Edit color ${idx + 1}" />
          </div>
        </div>
        <div class="swatch-card__meta">
          <button class="copy-fmt hover-sound" type="button" data-copy-val="${sw.hex}" data-copy-lbl="HEX ${sw.hex}">
            <span>HEX</span><span>${sw.hex}</span>
          </button>
          <button class="copy-fmt hover-sound" type="button" data-copy-val="${rgbStr}" data-copy-lbl="RGB">
            <span>RGB</span><span>${rgb.r},${rgb.g},${rgb.b}</span>
          </button>
          <button class="copy-fmt hover-sound" type="button" data-copy-val="${hslStr}" data-copy-lbl="HSL">
            <span>HSL</span><span>${hsl.h}° ${hsl.s}% ${hsl.l}%</span>
          </button>
        </div>
      </article>
    `;
  }).join("");

  paletteCssOutput.textContent = getPaletteCssText();
}

document.getElementById("harmonyBtns").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-harmony]");
  if (!btn) return;
  state.palette.harmony = btn.dataset.harmony;
  playClickTick(560);
  regeneratePalette();
});

paletteSeedInput.addEventListener("input", () => {
  regeneratePalette(paletteSeedInput.value);
});

paletteSeedHexInput.addEventListener("change", () => {
  regeneratePalette(paletteSeedHexInput.value);
});

paletteCountInput.addEventListener("input", () => {
  state.palette.count = Number(paletteCountInput.value);
  regeneratePalette();
});

document.querySelectorAll("[data-ui-surface]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.palette.uiSurface = btn.dataset.uiSurface;
    playClickTick(500);
    renderPalette();
    persistState(true);
  });
});

paletteSwatchesEl.addEventListener("click", (e) => {
  const lockBtn = e.target.closest("[data-lock-idx]");
  if (lockBtn) {
    const idx = Number(lockBtn.dataset.lockIdx);
    state.palette.swatches[idx].locked = !state.palette.swatches[idx].locked;
    playClickTick(state.palette.swatches[idx].locked ? 680 : 440);
    renderPalette();
    persistState(true);
    return;
  }

  const copyBtn = e.target.closest("[data-copy-val]");
  if (copyBtn) {
    copyText(copyBtn.dataset.copyVal, copyBtn.dataset.copyLbl);
  }
});

paletteSwatchesEl.addEventListener("input", (e) => {
  const picker = e.target.closest("[data-pick-idx]");
  if (!picker) return;
  const idx = Number(picker.dataset.pickIdx);
  state.palette.harmony = "custom";
  state.palette.swatches[idx].hex = normalizeHex(picker.value);
  if (idx === 0) state.palette.seed = state.palette.swatches[0].hex;
  renderPalette();
  persistState(true);
});

document.getElementById("regenPaletteBtn").addEventListener("click", () => {
  const randomSeed = hslToHex(Math.floor(Math.random() * 360), 62 + Math.floor(Math.random() * 28), 46 + Math.floor(Math.random() * 16));
  if (state.palette.harmony === "custom") state.palette.harmony = "analogous";
  playClickTick(620);
  regeneratePalette(randomSeed);
  showToast("NEW HARMONY GENERATED");
});

document.getElementById("applyStudioThemeBtn").addEventListener("click", () => {
  state.studioThemeApplied = true;
  state.studioAccent = state.palette.swatches[0].hex;
  state.studioAccent2 = state.palette.swatches[1]?.hex || state.studioAccent;
  applyStudioThemeVars();
  playClickTick(760);
  persistState(true);
  showToast(`STUDIO THEME APPLIED (${state.studioAccent})`);
});

resetThemeBtn.addEventListener("click", () => {
  state.studioThemeApplied = false;
  applyStudioThemeVars();
  playClickTick(420);
  persistState(true);
  showToast("DEFAULT ::BEFORE THEME RESTORED");
});

document.getElementById("copyPaletteCssBtn").addEventListener("click", () => {
  copyText(getPaletteCssText(), "PALETTE CSS VARIABLES");
});
document.getElementById("copyPaletteCodeBtn").addEventListener("click", () => {
  copyText(getPaletteCssText(), "PALETTE CSS VARIABLES");
});

// =========================================================================
// MODULE 02: GRADIENT / NOISE / GLASSMORPHISM PLAYGROUND
// =========================================================================
const gradAngleGroup = document.getElementById("gradAngleGroup");
const gradAngleInput = document.getElementById("gradAngle");
const gradAngleVal = document.getElementById("gradAngleVal");
const stopsListEl = document.getElementById("stopsList");
const noiseEnabledInput = document.getElementById("noiseEnabled");
const noiseIntensityInput = document.getElementById("noiseIntensity");
const noiseIntensityVal = document.getElementById("noiseIntensityVal");
const noiseScaleInput = document.getElementById("noiseScale");
const noiseScaleVal = document.getElementById("noiseScaleVal");
const glassEnabledInput = document.getElementById("glassEnabled");
const glassBlurInput = document.getElementById("glassBlur");
const glassBlurVal = document.getElementById("glassBlurVal");
const glassOpacityInput = document.getElementById("glassOpacity");
const glassOpacityVal = document.getElementById("glassOpacityVal");
const glassBorderInput = document.getElementById("glassBorder");
const glassBorderVal = document.getElementById("glassBorderVal");
const glassSaturateInput = document.getElementById("glassSaturate");
const glassSaturateVal = document.getElementById("glassSaturateVal");

const glassBgLayer = document.getElementById("glassBgLayer");
const glassNoiseLayer = document.getElementById("glassNoiseLayer");
const glassCard = document.getElementById("glassCard");
const glassHtmlOutput = document.getElementById("glassHtmlOutput");
const glassCssOutput = document.getElementById("glassCssOutput");
const glassMetaLabel = document.getElementById("glassMetaLabel");

function buildGradientCss() {
  const { type, angle, stops } = state.glass;
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopStr = sorted.map((s) => `${s.color} ${s.pos}%`).join(", ");

  if (type === "radial") return `radial-gradient(circle at 50% 45%, ${stopStr})`;
  if (type === "conic") return `conic-gradient(from ${angle}deg at 50% 50%, ${stopStr})`;
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

function buildNoiseSvgDataUri() {
  const { noiseType, noiseScale } = state.glass;
  const svgType = noiseType === "turbulence" ? "turbulence" : "fractalNoise";
  const freq = noiseType === "grain" ? (noiseScale * 1.9).toFixed(2) : Number(noiseScale).toFixed(2);
  const octaves = noiseType === "grain" ? 2 : 4;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='${svgType}' baseFrequency='${freq}' numOctaves='${octaves}' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function buildGlassHtmlSnippet() {
  const g = state.glass;
  const shaderLbl = g.type === "radial" ? "RADIAL / CENTER" : `${g.type.toUpperCase()} / ${g.angle}°`;
  const filterLbl = `${g.blur}PX · ${g.saturate}%`;
  const noiseLbl = g.noiseEnabled ? `${g.noiseIntensity}% ${g.noiseType.replace("Noise", "").toUpperCase()}` : "OFF";

  if (!g.glassEnabled) {
    return [
      "<div class=\"surface-backdrop\">",
      "  <!-- Gradient & noise surface container -->",
      "</div>"
    ].join("\n");
  }

  return [
    "<div class=\"surface-backdrop\">",
    "  <article class=\"glass-panel\">",
    "    <div class=\"glass-panel__head\">",
    "      <span class=\"glass-panel__brand\">::BEFORE STUDIO</span>",
    "      <span class=\"glass-panel__chip\">GLASS / FX</span>",
    "    </div>",
    "    <div class=\"glass-panel__body\">",
    "      <h2 class=\"glass-panel__title\">Refractive Surface Pass</h2>",
    "      <p class=\"glass-panel__desc\">",
    "        Combine multi-stop gradients, procedural SVG noise, and calibrated backdrop blur into production-ready CSS.",
    "      </p>",
    "    </div>",
    "    <div class=\"glass-panel__foot\">",
    "      <div>",
    "        <span>SHADER</span>",
    `        <strong>${shaderLbl}</strong>`,
    "      </div>",
    "      <div>",
    "        <span>FILTER</span>",
    `        <strong>${filterLbl}</strong>`,
    "      </div>",
    "      <div>",
    "        <span>NOISE</span>",
    `        <strong>${noiseLbl}</strong>`,
    "      </div>",
    "    </div>",
    "  </article>",
    "</div>"
  ].join("\n");
}

function buildGlassCssSnippet() {
  const g = state.glass;
  const grad = buildGradientCss();
  const lines = [
    ".surface-backdrop {",
    `  background: ${grad};`,
    "  position: relative;",
    "  display: grid;",
    "  place-items: center;",
    "  padding: 32px;",
    "  overflow: hidden;",
    "}"
  ];

  if (g.noiseEnabled && g.noiseIntensity > 0) {
    lines.push(
      "",
      ".surface-backdrop::after {",
      "  content: '';",
      "  position: absolute;",
      "  inset: 0;",
      `  background-image: ${buildNoiseSvgDataUri()};`,
      `  opacity: ${(g.noiseIntensity / 100).toFixed(2)};`,
      "  mix-blend-mode: overlay;",
      "  pointer-events: none;",
      "}"
    );
  }

  if (g.glassEnabled) {
    lines.push(
      "",
      ".glass-panel {",
      "  position: relative;",
      "  z-index: 1;",
      "  width: 100%;",
      "  max-width: 480px;",
      "  padding: 26px;",
      "  color: #ffffff;",
      `  background: rgba(255, 255, 255, ${(g.opacity / 100).toFixed(2)});`,
      `  backdrop-filter: blur(${g.blur}px) saturate(${g.saturate}%);`,
      `  -webkit-backdrop-filter: blur(${g.blur}px) saturate(${g.saturate}%);`,
      `  border: 1px solid rgba(255, 255, 255, ${(g.border / 100).toFixed(2)});`,
      "  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);",
      "  border-radius: 12px;",
      "}"
    );
  }

  return lines.join("\n");
}

function renderStopsList() {
  stopsListEl.innerHTML = state.glass.stops.map((stop, idx) => `
    <div class="stop-row" data-stop-idx="${idx}">
      <input class="stop-row__color" type="color" value="${normalizeHex(stop.color).toLowerCase()}" data-stop-color="${idx}" aria-label="Stop ${idx + 1} color" />
      <input class="range-input" type="range" min="0" max="100" step="1" value="${stop.pos}" data-stop-pos="${idx}" aria-label="Stop ${idx + 1} position" />
      <span class="stop-row__pct">${stop.pos}%</span>
      <button class="stop-row__del hover-sound" type="button" data-stop-del="${idx}" ${state.glass.stops.length <= 2 ? "disabled" : ""} aria-label="Remove stop">×</button>
    </div>
  `).join("");
}

function renderGlass(rebuildStops = true) {
  const g = state.glass;

  document.querySelectorAll("[data-grad-type]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.gradType === g.type);
  });
  gradAngleGroup.classList.toggle("is-hidden", g.type === "radial");
  gradAngleInput.value = g.angle;
  gradAngleVal.textContent = `${g.angle}°`;

  document.querySelectorAll("[data-noise-type]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.noiseType === g.noiseType);
  });

  noiseEnabledInput.checked = g.noiseEnabled;
  noiseIntensityInput.value = g.noiseIntensity;
  noiseIntensityVal.textContent = `${g.noiseIntensity}%`;
  noiseScaleInput.value = g.noiseScale;
  noiseScaleVal.textContent = Number(g.noiseScale).toFixed(2);

  glassEnabledInput.checked = g.glassEnabled;
  glassBlurInput.value = g.blur;
  glassBlurVal.textContent = `${g.blur}px`;
  glassOpacityInput.value = g.opacity;
  glassOpacityVal.textContent = `${g.opacity}%`;
  glassBorderInput.value = g.border;
  glassBorderVal.textContent = `${g.border}%`;
  glassSaturateInput.value = g.saturate;
  glassSaturateVal.textContent = `${g.saturate}%`;

  if (rebuildStops) renderStopsList();

  // Apply live styles to viewport
  const grad = buildGradientCss();
  glassBgLayer.style.background = grad;

  if (g.noiseEnabled && g.noiseIntensity > 0) {
    glassNoiseLayer.style.backgroundImage = buildNoiseSvgDataUri();
    glassNoiseLayer.style.opacity = String(g.noiseIntensity / 100);
  } else {
    glassNoiseLayer.style.backgroundImage = "none";
    glassNoiseLayer.style.opacity = "0";
  }

  glassCard.classList.toggle("is-hidden", !g.glassEnabled);
  glassCard.style.background = `rgba(255, 255, 255, ${(g.opacity / 100).toFixed(2)})`;
  glassCard.style.backdropFilter = `blur(${g.blur}px) saturate(${g.saturate}%)`;
  glassCard.style.webkitBackdropFilter = `blur(${g.blur}px) saturate(${g.saturate}%)`;
  glassCard.style.border = `1px solid rgba(255, 255, 255, ${(g.border / 100).toFixed(2)})`;

  const noiseLbl = g.noiseEnabled ? `${g.noiseIntensity}% ${g.noiseType.replace("Noise", "").toUpperCase()}` : "OFF";
  document.getElementById("glassCardShader").textContent = g.type === "radial" ? "RADIAL / CENTER" : `${g.type.toUpperCase()} / ${g.angle}°`;
  document.getElementById("glassCardFilter").textContent = `${g.blur}PX · ${g.saturate}%`;
  document.getElementById("glassCardNoise").textContent = noiseLbl;

  glassMetaLabel.textContent = `${g.type.toUpperCase()} ${g.type === "radial" ? "" : `${g.angle}° `}· NOISE ${noiseLbl} · BLUR ${g.blur}PX`;
  glassHtmlOutput.textContent = buildGlassHtmlSnippet();
  glassCssOutput.textContent = buildGlassCssSnippet();
}

document.querySelectorAll("[data-glass-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const p = GLASS_PRESETS[btn.dataset.glassPreset];
    if (!p) return;
    state.glass.type = p.type;
    state.glass.angle = p.angle;
    state.glass.stops = p.stops.map((s) => ({ ...s }));
    playClickTick(580);
    renderGlass(true);
    persistState(true);
  });
});

document.getElementById("syncPaletteToGlassBtn").addEventListener("click", () => {
  const sw = state.palette.swatches;
  const pick = sw.slice(0, Math.min(4, sw.length));
  state.glass.stops = pick.map((item, i) => ({
    color: item.hex,
    pos: Math.round((i / (pick.length - 1)) * 100)
  }));
  playClickTick(660);
  renderGlass(true);
  persistState(true);
  showToast("GRADIENT SYNCED FROM PALETTE");
});

document.querySelectorAll("[data-grad-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.glass.type = btn.dataset.gradType;
    playClickTick(520);
    renderGlass(false);
    persistState(true);
  });
});

gradAngleInput.addEventListener("input", () => {
  state.glass.angle = Number(gradAngleInput.value);
  renderGlass(false);
  persistState(true);
});

document.getElementById("addStopBtn").addEventListener("click", () => {
  if (state.glass.stops.length >= 6) {
    showToast("MAX 6 COLOR STOPS");
    return;
  }
  const randomCol = hslToHex(Math.floor(Math.random() * 360), 74, 54);
  state.glass.stops.push({ color: randomCol, pos: 50 });
  playClickTick(620);
  renderGlass(true);
  persistState(true);
});

stopsListEl.addEventListener("input", (e) => {
  if (e.target.dataset.stopColor !== undefined) {
    const idx = Number(e.target.dataset.stopColor);
    state.glass.stops[idx].color = e.target.value;
    renderGlass(false);
    persistState(true);
  } else if (e.target.dataset.stopPos !== undefined) {
    const idx = Number(e.target.dataset.stopPos);
    state.glass.stops[idx].pos = Number(e.target.value);
    const pctEl = e.target.closest(".stop-row").querySelector(".stop-row__pct");
    if (pctEl) pctEl.textContent = `${state.glass.stops[idx].pos}%`;
    renderGlass(false);
    persistState(true);
  }
});

stopsListEl.addEventListener("click", (e) => {
  const del = e.target.closest("[data-stop-del]");
  if (!del || state.glass.stops.length <= 2) return;
  const idx = Number(del.dataset.stopDel);
  state.glass.stops.splice(idx, 1);
  playClickTick(420);
  renderGlass(true);
  persistState(true);
});

document.querySelectorAll("[data-noise-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.glass.noiseType = btn.dataset.noiseType;
    playClickTick(520);
    renderGlass(false);
    persistState(true);
  });
});

[
  [noiseEnabledInput, "noiseEnabled", "checked"],
  [noiseIntensityInput, "noiseIntensity", "number"],
  [noiseScaleInput, "noiseScale", "number"],
  [glassEnabledInput, "glassEnabled", "checked"],
  [glassBlurInput, "blur", "number"],
  [glassOpacityInput, "opacity", "number"],
  [glassBorderInput, "border", "number"],
  [glassSaturateInput, "saturate", "number"]
].forEach(([el, key, kind]) => {
  el.addEventListener("input", () => {
    state.glass[key] = kind === "checked" ? el.checked : Number(el.value);
    renderGlass(false);
    persistState(true);
  });
});

document.getElementById("copyGlassCssBtn").addEventListener("click", () => {
  copyText(buildGlassCssSnippet(), "GLASS + GRADIENT CSS");
});
document.getElementById("copyGlassHtmlBtn").addEventListener("click", () => {
  copyText(buildGlassHtmlSnippet(), "GLASS CARD HTML");
});
document.getElementById("copyGlassCodeBtn").addEventListener("click", () => {
  copyText(buildGlassCssSnippet(), "GLASS + GRADIENT CSS");
});

// =========================================================================
// MODULE 03: LAYOUT GENERATOR (FLEXBOX & CSS GRID)
// =========================================================================
const layoutCanvas = document.getElementById("layoutCanvas");
const layoutCssOutput = document.getElementById("layoutCssOutput");
const layoutMetaLabel = document.getElementById("layoutMetaLabel");
const layoutItemCount = document.getElementById("layoutItemCount");
const flexControls = document.getElementById("flexControls");
const gridControls = document.getElementById("gridControls");
const flexJustifySelect = document.getElementById("flexJustify");
const flexAlignSelect = document.getElementById("flexAlign");
const gridColsInput = document.getElementById("gridCols");
const gridColsVal = document.getElementById("gridColsVal");
const gridRowsInput = document.getElementById("gridRows");
const gridRowsVal = document.getElementById("gridRowsVal");
const gridJustifySelect = document.getElementById("gridJustify");
const gridAlignSelect = document.getElementById("gridAlign");
const useAreasToggle = document.getElementById("useAreasToggle");
const areasConfig = document.getElementById("areasConfig");
const templateAreasInput = document.getElementById("templateAreasInput");
const layoutGapInput = document.getElementById("layoutGap");
const layoutGapVal = document.getElementById("layoutGapVal");
const selectedItemTitle = document.getElementById("selectedItemTitle");
const selectedFlexProps = document.getElementById("selectedFlexProps");
const selectedGridProps = document.getElementById("selectedGridProps");
const itemFlexGrowInput = document.getElementById("itemFlexGrow");
const itemFlexGrowVal = document.getElementById("itemFlexGrowVal");
const itemColSpanInput = document.getElementById("itemColSpan");
const itemColSpanVal = document.getElementById("itemColSpanVal");
const itemRowSpanInput = document.getElementById("itemRowSpan");
const itemRowSpanVal = document.getElementById("itemRowSpanVal");

let draggedItemIndex = null;

function parseAreaNames(areasText) {
  const rows = areasText
    .split("\n")
    .map((r) => r.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
  const unique = [];
  let maxCols = 0;

  rows.forEach((row) => {
    const tokens = row.split(/\s+/).filter(Boolean);
    maxCols = Math.max(maxCols, tokens.length);
    tokens.forEach((tok) => {
      if (tok !== "." && !unique.includes(tok)) unique.push(tok);
    });
  });

  const formatted = rows.map((r) => `"${r}"`).join("\n    ");
  return { unique, rowCount: rows.length, colCount: maxCols, formatted };
}

function buildLayoutCss() {
  const l = state.layout;
  if (l.mode === "flex") {
    const lines = [
      ".layout-container {",
      "  display: flex;",
      `  flex-direction: ${l.direction};`,
      `  flex-wrap: ${l.wrap};`,
      `  justify-content: ${l.flexJustify};`,
      `  align-items: ${l.flexAlign};`,
      `  gap: ${l.gap}px;`,
      "}"
    ];
    l.items.forEach((item, idx) => {
      if (item.grow > 0) {
        lines.push("", `.item-${idx + 1} { flex-grow: ${item.grow}; }`);
      }
    });
    return lines.join("\n");
  }

  if (l.useAreas) {
    const parsed = parseAreaNames(l.templateAreas);
    const lines = [
      ".layout-container {",
      "  display: grid;",
      `  grid-template-columns: repeat(${parsed.colCount || l.gridCols}, minmax(0, 1fr));`,
      `  grid-template-rows: repeat(${parsed.rowCount || l.gridRows}, minmax(96px, 1fr));`,
      "  grid-template-areas:",
      `    ${parsed.formatted};`,
      `  gap: ${l.gap}px;`,
      "}"
    ];
    parsed.unique.forEach((name) => {
      lines.push(`.area-${name} { grid-area: ${name}; }`);
    });
    return lines.join("\n");
  }

  const lines = [
    ".layout-container {",
    "  display: grid;",
    `  grid-template-columns: repeat(${l.gridCols}, minmax(0, 1fr));`,
    `  grid-template-rows: repeat(${l.gridRows}, minmax(96px, auto));`,
    `  justify-items: ${l.gridJustify};`,
    `  align-items: ${l.gridAlign};`,
    `  gap: ${l.gap}px;`,
    "}"
  ];

  l.items.forEach((item, idx) => {
    if (item.colSpan > 1 || item.rowSpan > 1) {
      const rules = [];
      if (item.colSpan > 1) rules.push(`grid-column: span ${item.colSpan};`);
      if (item.rowSpan > 1) rules.push(`grid-row: span ${item.rowSpan};`);
      lines.push("", `.item-${idx + 1} { ${rules.join(" ")} }`);
    }
  });
  return lines.join("\n");
}

function renderLayout() {
  const l = state.layout;
  if (l.selectedIndex >= l.items.length) l.selectedIndex = Math.max(0, l.items.length - 1);

  document.querySelectorAll("[data-layout-mode]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.layoutMode === l.mode);
  });

  flexControls.classList.toggle("is-hidden", l.mode !== "flex");
  gridControls.classList.toggle("is-hidden", l.mode !== "grid");
  selectedFlexProps.classList.toggle("is-hidden", l.mode !== "flex");
  selectedGridProps.classList.toggle("is-hidden", l.mode !== "grid" || l.useAreas);

  document.querySelectorAll("[data-flex-prop='direction']").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.val === l.direction);
  });
  document.querySelectorAll("[data-flex-prop='wrap']").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.val === l.wrap);
  });

  flexJustifySelect.value = l.flexJustify;
  flexAlignSelect.value = l.flexAlign;
  gridColsInput.value = l.gridCols;
  gridColsVal.textContent = `${l.gridCols} COLS`;
  gridRowsInput.value = l.gridRows;
  gridRowsVal.textContent = `${l.gridRows} ROWS`;
  gridJustifySelect.value = l.gridJustify;
  gridAlignSelect.value = l.gridAlign;
  useAreasToggle.checked = l.useAreas;
  areasConfig.classList.toggle("is-hidden", !l.useAreas);
  templateAreasInput.value = l.templateAreas;
  layoutGapInput.value = l.gap;
  layoutGapVal.textContent = `${l.gap}px`;

  document.querySelectorAll("[data-area-preset]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.areaPreset === l.areaPreset);
  });

  // Reset inline styles on canvas cleanly
  layoutCanvas.style.cssText = "";
  layoutCanvas.style.gap = `${l.gap}px`;

  if (l.mode === "flex") {
    layoutCanvas.style.display = "flex";
    layoutCanvas.style.flexDirection = l.direction;
    layoutCanvas.style.flexWrap = l.wrap;
    layoutCanvas.style.justifyContent = l.flexJustify;
    layoutCanvas.style.alignItems = l.flexAlign;
    layoutItemCount.textContent = String(l.items.length);
    layoutMetaLabel.textContent = `DISPLAY: FLEX · ${l.direction.toUpperCase()} · GAP ${l.gap}PX`;
  } else if (l.useAreas) {
    const parsed = parseAreaNames(l.templateAreas);
    layoutCanvas.style.display = "grid";
    layoutCanvas.style.gridTemplateColumns = `repeat(${parsed.colCount || 3}, minmax(0, 1fr))`;
    layoutCanvas.style.gridTemplateRows = `repeat(${parsed.rowCount || 2}, minmax(96px, 1fr))`;
    layoutCanvas.style.gridTemplateAreas = parsed.formatted;
    layoutItemCount.textContent = String(parsed.unique.length);
    layoutMetaLabel.textContent = `DISPLAY: GRID · TEMPLATE AREAS (${parsed.unique.length}) · GAP ${l.gap}PX`;
  } else {
    layoutCanvas.style.display = "grid";
    layoutCanvas.style.gridTemplateColumns = `repeat(${l.gridCols}, minmax(0, 1fr))`;
    layoutCanvas.style.gridTemplateRows = `repeat(${l.gridRows}, minmax(96px, auto))`;
    layoutCanvas.style.justifyItems = l.gridJustify;
    layoutCanvas.style.alignItems = l.gridAlign;
    layoutItemCount.textContent = String(l.items.length);
    layoutMetaLabel.textContent = `DISPLAY: GRID · ${l.gridCols}×${l.gridRows} · GAP ${l.gap}PX`;
  }

  // Render canvas items
  if (l.mode === "grid" && l.useAreas) {
    const parsed = parseAreaNames(l.templateAreas);
    layoutCanvas.innerHTML = parsed.unique.map((areaName, idx) => `
      <div class="layout-item" style="grid-area:${areaName};">
        <div class="layout-item__top">
          <span class="layout-item__num">0${idx + 1}</span>
          <span class="layout-item__meta">GRID-AREA</span>
        </div>
        <div>
          <div class="layout-item__label">${areaName.toUpperCase()}</div>
          <div class="layout-item__meta">grid-area: ${areaName}</div>
        </div>
      </div>
    `).join("");
    selectedItemTitle.textContent = "TEMPLATE AREAS ACTIVE";
  } else {
    layoutCanvas.innerHTML = l.items.map((item, idx) => {
      const styleParts = [];
      let metaTxt = "";
      if (l.mode === "flex") {
        styleParts.push(`flex-grow:${item.grow};`);
        metaTxt = `flex-grow: ${item.grow}`;
      } else {
        if (item.colSpan > 1) styleParts.push(`grid-column:span ${item.colSpan};`);
        if (item.rowSpan > 1) styleParts.push(`grid-row:span ${item.rowSpan};`);
        metaTxt = `span ${item.colSpan}×${item.rowSpan}`;
      }

      const selected = idx === l.selectedIndex;
      return `
        <div class="layout-item ${selected ? "is-selected" : ""}" draggable="true" data-item-idx="${idx}" style="${styleParts.join(" ")}">
          <div class="layout-item__top">
            <span class="layout-item__num">${String(idx + 1).padStart(2, "0")}</span>
            <button class="layout-item__del hover-sound" type="button" data-del-item="${idx}" title="Remove item" aria-label="Remove item ${idx + 1}">×</button>
          </div>
          <div>
            <div class="layout-item__label">${item.label}</div>
            <div class="layout-item__meta">${metaTxt}</div>
          </div>
        </div>
      `;
    }).join("");

    const sel = l.items[l.selectedIndex];
    if (sel) {
      selectedItemTitle.textContent = `ITEM ${String(l.selectedIndex + 1).padStart(2, "0")} (${sel.label.toUpperCase()})`;
      itemFlexGrowInput.value = sel.grow;
      itemFlexGrowVal.textContent = String(sel.grow);
      itemColSpanInput.value = sel.colSpan;
      itemColSpanVal.textContent = String(sel.colSpan);
      itemRowSpanInput.value = sel.rowSpan;
      itemRowSpanVal.textContent = String(sel.rowSpan);
    }
  }

  layoutCssOutput.textContent = buildLayoutCss();
}

document.querySelectorAll("[data-layout-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.layout.mode = btn.dataset.layoutMode;
    playClickTick(560);
    renderLayout();
    persistState(true);
  });
});

document.querySelectorAll("[data-flex-prop]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.layout[btn.dataset.flexProp] = btn.dataset.val;
    playClickTick(500);
    renderLayout();
    persistState(true);
  });
});

flexJustifySelect.addEventListener("change", () => {
  state.layout.flexJustify = flexJustifySelect.value;
  renderLayout();
  persistState(true);
});

flexAlignSelect.addEventListener("change", () => {
  state.layout.flexAlign = flexAlignSelect.value;
  renderLayout();
  persistState(true);
});

gridColsInput.addEventListener("input", () => {
  state.layout.gridCols = Number(gridColsInput.value);
  renderLayout();
  persistState(true);
});

gridRowsInput.addEventListener("input", () => {
  state.layout.gridRows = Number(gridRowsInput.value);
  renderLayout();
  persistState(true);
});

gridJustifySelect.addEventListener("change", () => {
  state.layout.gridJustify = gridJustifySelect.value;
  renderLayout();
  persistState(true);
});

gridAlignSelect.addEventListener("change", () => {
  state.layout.gridAlign = gridAlignSelect.value;
  renderLayout();
  persistState(true);
});

useAreasToggle.addEventListener("change", () => {
  state.layout.useAreas = useAreasToggle.checked;
  playClickTick(540);
  renderLayout();
  persistState(true);
});

document.querySelectorAll("[data-area-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.areaPreset;
    state.layout.areaPreset = key;
    state.layout.templateAreas = AREA_PRESETS[key];
    playClickTick(580);
    renderLayout();
    persistState(true);
  });
});

templateAreasInput.addEventListener("input", () => {
  state.layout.templateAreas = templateAreasInput.value;
  renderLayout();
  persistState(true);
});

layoutGapInput.addEventListener("input", () => {
  state.layout.gap = Number(layoutGapInput.value);
  renderLayout();
  persistState(true);
});

document.getElementById("addLayoutItemBtn").addEventListener("click", () => {
  if (state.layout.items.length >= 12) {
    showToast("MAX 12 ITEMS REACHED");
    return;
  }
  const n = state.layout.items.length + 1;
  state.layout.items.push({ id: Date.now(), label: `Block ${n}`, grow: 0, colSpan: 1, rowSpan: 1 });
  state.layout.selectedIndex = state.layout.items.length - 1;
  playClickTick(640);
  renderLayout();
  persistState(true);
});

document.getElementById("removeLayoutItemBtn").addEventListener("click", () => {
  if (state.layout.items.length <= 2) {
    showToast("KEEP AT LEAST 2 ITEMS");
    return;
  }
  state.layout.items.pop();
  playClickTick(420);
  renderLayout();
  persistState(true);
});

itemFlexGrowInput.addEventListener("input", () => {
  const item = state.layout.items[state.layout.selectedIndex];
  if (!item) return;
  item.grow = Number(itemFlexGrowInput.value);
  renderLayout();
  persistState(true);
});

itemColSpanInput.addEventListener("input", () => {
  const item = state.layout.items[state.layout.selectedIndex];
  if (!item) return;
  item.colSpan = Number(itemColSpanInput.value);
  renderLayout();
  persistState(true);
});

itemRowSpanInput.addEventListener("input", () => {
  const item = state.layout.items[state.layout.selectedIndex];
  if (!item) return;
  item.rowSpan = Number(itemRowSpanInput.value);
  renderLayout();
  persistState(true);
});

document.getElementById("resetSpansBtn").addEventListener("click", () => {
  state.layout.items.forEach((it) => {
    it.grow = 0;
    it.colSpan = 1;
    it.rowSpan = 1;
  });
  playClickTick(440);
  renderLayout();
  persistState(true);
});

// Click selection, removal & Drag-and-Drop reordering inside layout canvas
layoutCanvas.addEventListener("click", (e) => {
  const delBtn = e.target.closest("[data-del-item]");
  if (delBtn) {
    if (state.layout.items.length <= 2) {
      showToast("KEEP AT LEAST 2 ITEMS");
      return;
    }
    const idx = Number(delBtn.dataset.delItem);
    state.layout.items.splice(idx, 1);
    playClickTick(420);
    renderLayout();
    persistState(true);
    return;
  }

  const card = e.target.closest("[data-item-idx]");
  if (card) {
    state.layout.selectedIndex = Number(card.dataset.itemIdx);
    playClickTick(560);
    renderLayout();
  }
});

layoutCanvas.addEventListener("dragstart", (e) => {
  const card = e.target.closest("[data-item-idx]");
  if (!card) return;
  draggedItemIndex = Number(card.dataset.itemIdx);
  card.classList.add("is-dragging");
  e.dataTransfer.effectAllowed = "move";
});

layoutCanvas.addEventListener("dragover", (e) => {
  const card = e.target.closest("[data-item-idx]");
  if (!card || draggedItemIndex === null) return;
  e.preventDefault();
  layoutCanvas.querySelectorAll(".is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
  if (Number(card.dataset.itemIdx) !== draggedItemIndex) {
    card.classList.add("is-drop-target");
  }
});

layoutCanvas.addEventListener("drop", (e) => {
  const card = e.target.closest("[data-item-idx]");
  if (!card || draggedItemIndex === null) return;
  e.preventDefault();
  const targetIndex = Number(card.dataset.itemIdx);
  if (targetIndex !== draggedItemIndex) {
    const [moved] = state.layout.items.splice(draggedItemIndex, 1);
    state.layout.items.splice(targetIndex, 0, moved);
    state.layout.selectedIndex = targetIndex;
    playClickTick(680);
    renderLayout();
    persistState(true);
  }
  draggedItemIndex = null;
});

layoutCanvas.addEventListener("dragend", () => {
  draggedItemIndex = null;
  layoutCanvas.querySelectorAll(".is-dragging, .is-drop-target").forEach((el) => {
    el.classList.remove("is-dragging", "is-drop-target");
  });
});

document.getElementById("copyLayoutCssBtn").addEventListener("click", () => {
  copyText(buildLayoutCss(), "LAYOUT CSS");
});
document.getElementById("copyLayoutCodeBtn").addEventListener("click", () => {
  copyText(buildLayoutCss(), "LAYOUT CSS");
});

// =========================================================================
// MODULE 04: TYPOGRAPHY SCALE PLAYGROUND
// =========================================================================
const typeBaseInput = document.getElementById("typeBase");
const typeBaseVal = document.getElementById("typeBaseVal");
const typeRatioSelect = document.getElementById("typeRatio");
const typeCompareRatioSelect = document.getElementById("typeCompareRatio");
const compareRatioGroup = document.getElementById("compareRatioGroup");
const typeFontSelect = document.getElementById("typeFont");
const typeLineHeightInput = document.getElementById("typeLineHeight");
const typeLineHeightVal = document.getElementById("typeLineHeightVal");
const typeTrackingInput = document.getElementById("typeTracking");
const typeTrackingVal = document.getElementById("typeTrackingVal");
const typeSampleInput = document.getElementById("typeSampleInput");

const typeStage = document.getElementById("typeStage");
const typePrimaryCol = document.getElementById("typePrimaryCol");
const typeCompareCol = document.getElementById("typeCompareCol");
const typeMetaLabel = document.getElementById("typeMetaLabel");
const typeCssOutput = document.getElementById("typeCssOutput");

const TYPE_STEPS = [
  { tag: "H1", varName: "--text-h1", power: 5, isHeading: true },
  { tag: "H2", varName: "--text-h2", power: 4, isHeading: true },
  { tag: "H3", varName: "--text-h3", power: 3, isHeading: true },
  { tag: "H4", varName: "--text-h4", power: 2, isHeading: true },
  { tag: "H5", varName: "--text-h5", power: 1, isHeading: true },
  { tag: "H6", varName: "--text-h6", power: 0.5, isHeading: true },
  { tag: "BODY", varName: "--text-base", power: 0, isHeading: false },
  { tag: "SMALL", varName: "--text-sm", power: -1, isHeading: false }
];

function computeScale(base, ratio) {
  return TYPE_STEPS.map((step) => {
    const px = Number((base * Math.pow(ratio, step.power)).toFixed(1));
    const rem = Number((px / 16).toFixed(3));
    return { ...step, px, rem };
  });
}

function buildTypeCssVars() {
  const t = state.type;
  const rows = computeScale(t.base, t.ratio);
  const lines = [
    ":root {",
    `  --font-primary: ${t.font};`,
    `  --font-weight-heading: ${t.weight};`,
    `  --leading-heading: ${t.lineHeight};`,
    `  --tracking-heading: ${t.tracking}em;`,
    `  --type-base: ${t.base}px;`,
    `  --type-ratio: ${t.ratio};`,
    ""
  ];
  rows.forEach((r) => {
    lines.push(`  ${r.varName}: ${r.rem}rem; /* ${r.px}px */`);
  });
  lines.push("}");
  return lines.join("\n");
}

function renderScaleColumn(container, title, ratioVal, referenceRows = null) {
  const t = state.type;
  const rows = computeScale(t.base, ratioVal);
  const ratioStr = Number(ratioVal).toFixed(3);
  const ratioName = RATIO_LABELS[ratioStr] || "Modular";
  const sampleText = t.sample.trim() || "Design systems built with precision.";

  container.innerHTML = `
    <div class="type-column__head">
      <span>${title}</span>
      <span>${ratioStr} · ${ratioName}</span>
    </div>
    ${rows.map((r, i) => {
      let deltaHtml = "";
      if (referenceRows) {
        const diff = Number((r.px - referenceRows[i].px).toFixed(1));
        const sign = diff > 0 ? "+" : "";
        deltaHtml = `<span class="type-row__delta">${diff === 0 ? "MATCH" : `${sign}${diff}px`}</span>`;
      }
      const weight = r.isHeading ? t.weight : 400;
      const lh = r.isHeading ? t.lineHeight : Math.max(1.45, t.lineHeight);
      const ls = r.isHeading ? `${t.tracking}em` : "0em";
      return `
        <div class="type-row">
          <div class="type-row__meta">
            <span class="type-row__tag">${r.tag}</span>
            <span class="type-row__size">${r.px}px / ${r.rem}rem</span>
            ${deltaHtml}
          </div>
          <p class="type-row__sample" style="font-family:${t.font}; font-size:${r.px}px; font-weight:${weight}; line-height:${lh}; letter-spacing:${ls};">
            ${escapeHtml(sampleText)}
          </p>
        </div>
      `;
    }).join("")}
  `;
}

function renderType() {
  const t = state.type;
  const isCompare = t.view === "compare";

  document.querySelectorAll("[data-type-view]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.typeView === t.view);
  });
  document.querySelectorAll("[data-type-weight]").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.typeWeight) === Number(t.weight));
  });

  compareRatioGroup.classList.toggle("is-hidden", !isCompare);
  typeStage.classList.toggle("is-compare", isCompare);
  typeCompareCol.classList.toggle("is-hidden", !isCompare);

  typeBaseInput.value = t.base;
  typeBaseVal.textContent = `${t.base}px`;
  typeRatioSelect.value = Number(t.ratio).toFixed(3);
  typeCompareRatioSelect.value = Number(t.compareRatio).toFixed(3);
  typeFontSelect.value = t.font;
  typeLineHeightInput.value = t.lineHeight;
  typeLineHeightVal.textContent = Number(t.lineHeight).toFixed(2);
  typeTrackingInput.value = t.tracking;
  typeTrackingVal.textContent = `${Number(t.tracking).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}em`;
  typeSampleInput.value = t.sample;

  const primaryRows = computeScale(t.base, t.ratio);
  renderScaleColumn(typePrimaryCol, "SCALE A — PRIMARY", t.ratio);
  if (isCompare) {
    renderScaleColumn(typeCompareCol, "SCALE B — COMPARISON", t.compareRatio, primaryRows);
  }

  const rStr = Number(t.ratio).toFixed(3);
  typeMetaLabel.textContent = isCompare
    ? `COMPARE ${rStr} VS ${Number(t.compareRatio).toFixed(3)} · BASE ${t.base}PX`
    : `BASE ${t.base}PX · ${rStr} ${(RATIO_LABELS[rStr] || "").toUpperCase()}`;

  typeCssOutput.textContent = buildTypeCssVars();
}

document.querySelectorAll("[data-type-view]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.type.view = btn.dataset.typeView;
    playClickTick(540);
    renderType();
    persistState(true);
  });
});

document.querySelectorAll("[data-type-weight]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.type.weight = Number(btn.dataset.typeWeight);
    playClickTick(520);
    renderType();
    persistState(true);
  });
});

typeBaseInput.addEventListener("input", () => {
  state.type.base = Number(typeBaseInput.value);
  renderType();
  persistState(true);
});
typeRatioSelect.addEventListener("change", () => {
  state.type.ratio = Number(typeRatioSelect.value);
  renderType();
  persistState(true);
});
typeCompareRatioSelect.addEventListener("change", () => {
  state.type.compareRatio = Number(typeCompareRatioSelect.value);
  renderType();
  persistState(true);
});
typeFontSelect.addEventListener("change", () => {
  state.type.font = typeFontSelect.value;
  renderType();
  persistState(true);
});
typeLineHeightInput.addEventListener("input", () => {
  state.type.lineHeight = Number(typeLineHeightInput.value);
  renderType();
  persistState(true);
});
typeTrackingInput.addEventListener("input", () => {
  state.type.tracking = Number(typeTrackingInput.value);
  renderType();
  persistState(true);
});
typeSampleInput.addEventListener("input", () => {
  state.type.sample = typeSampleInput.value;
  renderType();
  persistState(true);
});

document.getElementById("copyTypeCssBtn").addEventListener("click", () => {
  copyText(buildTypeCssVars(), "TYPOGRAPHY CSS VARIABLES");
});
document.getElementById("copyTypeCodeBtn").addEventListener("click", () => {
  copyText(buildTypeCssVars(), "TYPOGRAPHY CSS VARIABLES");
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

// =========================================================================
// MODULE 05: BUTTON LAB (FIGMA GLASS, SHADOWS, GRADIENTS, OUTLINE, STATES)
// =========================================================================
const btnTextInput = document.getElementById("btnTextInput");
const btnIconSelect = document.getElementById("btnIconSelect");
const btnIconPos = document.getElementById("btnIconPos");
const btnColor1Label = document.getElementById("btnColor1Label");
const btnColor1Val = document.getElementById("btnColor1Val");
const btnColor1 = document.getElementById("btnColor1");
const btnColor1Hex = document.getElementById("btnColor1Hex");
const btnGradientExtras = document.getElementById("btnGradientExtras");
const btnColor2 = document.getElementById("btnColor2");
const btnColor2Hex = document.getElementById("btnColor2Hex");
const btnColor2Val = document.getElementById("btnColor2Val");
const btnGradAngle = document.getElementById("btnGradAngle");
const btnGradAngleVal = document.getElementById("btnGradAngleVal");
const btnTextColor = document.getElementById("btnTextColor");
const btnTextColorHex = document.getElementById("btnTextColorHex");
const btnTextColorVal = document.getElementById("btnTextColorVal");

const btnGlassControls = document.getElementById("btnGlassControls");
const btnGlassBlur = document.getElementById("btnGlassBlur");
const btnGlassBlurVal = document.getElementById("btnGlassBlurVal");
const btnGlassOpacity = document.getElementById("btnGlassOpacity");
const btnGlassOpacityVal = document.getElementById("btnGlassOpacityVal");
const btnGlassSpecular = document.getElementById("btnGlassSpecular");
const btnGlassSpecularVal = document.getElementById("btnGlassSpecularVal");
const btnGlassSaturate = document.getElementById("btnGlassSaturate");
const btnGlassSaturateVal = document.getElementById("btnGlassSaturateVal");

const btnFont = document.getElementById("btnFont");
const btnFontSize = document.getElementById("btnFontSize");
const btnFontSizeVal = document.getElementById("btnFontSizeVal");
const btnFontWeight = document.getElementById("btnFontWeight");
const btnFontWeightVal = document.getElementById("btnFontWeightVal");
const btnLetterSpacing = document.getElementById("btnLetterSpacing");
const btnLetterSpacingVal = document.getElementById("btnLetterSpacingVal");
const btnPadX = document.getElementById("btnPadX");
const btnPadXVal = document.getElementById("btnPadXVal");
const btnPadY = document.getElementById("btnPadY");
const btnPadYVal = document.getElementById("btnPadYVal");
const btnRadius = document.getElementById("btnRadius");
const btnRadiusVal = document.getElementById("btnRadiusVal");

const btnBorderWidth = document.getElementById("btnBorderWidth");
const btnBorderWidthVal = document.getElementById("btnBorderWidthVal");
const btnBorderColor = document.getElementById("btnBorderColor");
const btnBorderOpacity = document.getElementById("btnBorderOpacity");
const btnBorderOpacityVal = document.getElementById("btnBorderOpacityVal");

const btnShadowEnabled = document.getElementById("btnShadowEnabled");
const btnShadowY = document.getElementById("btnShadowY");
const btnShadowYVal = document.getElementById("btnShadowYVal");
const btnShadowBlur = document.getElementById("btnShadowBlur");
const btnShadowBlurVal = document.getElementById("btnShadowBlurVal");
const btnShadowSpread = document.getElementById("btnShadowSpread");
const btnShadowSpreadVal = document.getElementById("btnShadowSpreadVal");
const btnShadowColor = document.getElementById("btnShadowColor");
const btnShadowOpacity = document.getElementById("btnShadowOpacity");
const btnShadowOpacityVal = document.getElementById("btnShadowOpacityVal");

const btnGlowEnabled = document.getElementById("btnGlowEnabled");
const btnGlowColorRow = document.getElementById("btnGlowColorRow");
const btnGlowColor = document.getElementById("btnGlowColor");
const btnGlowSize = document.getElementById("btnGlowSize");

const btnViewport = document.getElementById("btnViewport");
const livePreviewBtn = document.getElementById("livePreviewBtn");
const stateDefaultBtn = document.getElementById("stateDefaultBtn");
const stateHoverBtn = document.getElementById("stateHoverBtn");
const stateDisabledBtn = document.getElementById("stateDisabledBtn");
const btnHtmlOutput = document.getElementById("btnHtmlOutput");
const btnCssOutput = document.getElementById("btnCssOutput");

let btnStyleTag = document.getElementById("btnDynamicStyle");
if (!btnStyleTag) {
  btnStyleTag = document.createElement("style");
  btnStyleTag.id = "btnDynamicStyle";
  document.head.appendChild(btnStyleTag);
}

function buildButtonInnerMarkup() {
  const b = state.buttons;
  const label = escapeHtml(b.text.trim() || "Button");
  if (!b.icon) return `<span>${label}</span>`;
  const iconHtml = `<span class="studio-btn__icon" aria-hidden="true">${escapeHtml(b.icon)}</span>`;
  return b.iconPos === "left"
    ? `${iconHtml}<span>${label}</span>`
    : `<span>${label}</span>${iconHtml}`;
}

function buildButtonHtmlSnippet() {
  const b = state.buttons;
  const label = b.text.trim() || "Button";
  if (!b.icon) {
    return `<button class="studio-btn" type="button">\n  ${escapeHtml(label)}\n</button>`;
  }
  const iconLine = `  <span class="studio-btn__icon" aria-hidden="true">${escapeHtml(b.icon)}</span>`;
  const textLine = `  <span>${escapeHtml(label)}</span>`;
  const inner = b.iconPos === "left" ? `${iconLine}\n${textLine}` : `${textLine}\n${iconLine}`;
  return `<button class="studio-btn" type="button">\n${inner}\n</button>`;
}

function buildButtonRuleSet(selector, includeForcedHover = false) {
  const b = state.buttons;
  const borderRgba = hexToRgbaString(b.borderColor, (b.borderOpacity / 100).toFixed(2));
  const shadows = [];

  if (b.shadowEnabled && b.shadowOpacity > 0) {
    shadows.push(`0 ${b.shadowY}px ${b.shadowBlur}px ${b.shadowSpread}px ${hexToRgbaString(b.shadowColor, (b.shadowOpacity / 100).toFixed(2))}`);
  }
  if (b.glowEnabled) {
    shadows.push(`0 0 ${b.glowSize}px ${hexToRgbaString(b.glowColor, 0.52)}`);
  }
  if (b.fillMode === "glass" && b.glassSpecular > 0) {
    const spec = (b.glassSpecular / 100).toFixed(2);
    const soft = ((b.glassSpecular * 0.28) / 100).toFixed(2);
    const inner = ((b.glassSpecular * 0.18) / 100).toFixed(2);
    shadows.push(`inset 0 1px 0 rgba(255, 255, 255, ${spec})`);
    shadows.push(`inset 0 -1px 0 rgba(255, 255, 255, ${soft})`);
    shadows.push(`inset 0 0 18px rgba(255, 255, 255, ${inner})`);
  }

  let backgroundRule = `  background: ${b.color1};`;
  if (b.fillMode === "gradient") {
    backgroundRule = `  background: linear-gradient(${b.gradAngle}deg, ${b.color1}, ${b.color2});`;
  } else if (b.fillMode === "outline") {
    backgroundRule = "  background: transparent;";
  } else if (b.fillMode === "glass") {
    const sheen = ((b.glassSpecular * 0.35) / 100).toFixed(2);
    const baseFill = hexToRgbaString(b.color1, (b.glassOpacity / 100).toFixed(2));
    backgroundRule = `  background: linear-gradient(180deg, rgba(255, 255, 255, ${sheen}) 0%, rgba(255, 255, 255, 0) 58%), ${baseFill};`;
  }

  const baseLines = [
    `${selector} {`,
    "  position: relative;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 10px;",
    "  overflow: hidden;",
    `  padding: ${b.padY}px ${b.padX}px;`,
    `  font-family: ${b.font};`,
    `  font-size: ${b.fontSize}px;`,
    `  font-weight: ${b.fontWeight};`,
    `  letter-spacing: ${b.letterSpacing}em;`,
    `  text-transform: ${b.transform};`,
    "  line-height: 1;",
    `  color: ${b.textColor};`,
    backgroundRule,
    `  border: ${b.borderWidth}px ${b.borderStyle} ${borderRgba};`,
    `  border-radius: ${b.radius}px;`,
    "  cursor: pointer;",
    "  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease, filter 0.2s ease;"
  ];

  if (b.fillMode === "glass") {
    baseLines.push(`  backdrop-filter: blur(${b.glassBlur}px) saturate(${b.glassSaturate}%);`);
    baseLines.push(`  -webkit-backdrop-filter: blur(${b.glassBlur}px) saturate(${b.glassSaturate}%);`);
  }

  if (shadows.length) {
    baseLines.push(`  box-shadow: ${shadows.join(", ")};`);
  } else {
    baseLines.push("  box-shadow: none;");
  }
  baseLines.push("}");

  // Hover block
  const hoverSel = includeForcedHover
    ? `${selector}:hover:not(:disabled), ${selector}.is-forced-hover`
    : `${selector}:hover:not(:disabled)`;

  const hoverRules = [];
  if (b.hoverEffect === "lift") {
    hoverRules.push("  transform: translateY(-2px);");
    hoverRules.push("  filter: brightness(1.08);");
  } else if (b.hoverEffect === "glow") {
    const glowCol = b.glowEnabled ? b.glowColor : (b.fillMode === "glass" ? "#FFFFFF" : b.color1);
    const extraGlow = `0 0 ${Math.max(24, b.glowSize)}px ${hexToRgbaString(glowCol, 0.65)}`;
    const combined = [...shadows, extraGlow].join(", ");
    hoverRules.push(`  box-shadow: ${combined};`);
    hoverRules.push("  transform: translateY(-1px);");
  } else if (b.hoverEffect === "invert") {
    const invBg = b.fillMode === "outline" ? b.borderColor : b.textColor;
    const invFg = bestTextColor(invBg);
    hoverRules.push(`  background: ${invBg};`);
    hoverRules.push(`  color: ${invFg};`);
    hoverRules.push(`  border-color: ${invBg};`);
  } else if (b.hoverEffect === "scale") {
    hoverRules.push("  transform: scale(1.04);");
  } else if (b.hoverEffect === "shine") {
    hoverRules.push("  transform: translateY(-1px);");
  }

  const blocks = [baseLines.join("\n")];

  if (b.hoverEffect === "shine") {
    blocks.push(
      [
        `${selector}::before {`,
        "  content: '';",
        "  position: absolute;",
        "  top: 0;",
        "  left: -120%;",
        "  width: 65%;",
        "  height: 100%;",
        "  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.42), transparent);",
        "  transform: skewX(-20deg);",
        "  transition: left 0.55s ease;",
        "  pointer-events: none;",
        "}",
        `${hoverSel}::before {`,
        "  left: 145%;",
        "}"
      ].join("\n")
    );
  }

  if (hoverRules.length) {
    blocks.push(`${hoverSel} {\n${hoverRules.join("\n")}\n}`);
  }

  blocks.push(
    [
      `${selector}:active:not(:disabled) {`,
      "  transform: translateY(0) scale(0.98);",
      "}",
      `${selector}:disabled {`,
      "  opacity: 0.42;",
      "  cursor: not-allowed;",
      "}"
    ].join("\n")
  );

  return blocks.join("\n\n");
}

function buildButtonCssSnippet() {
  return buildButtonRuleSet(".studio-btn", false);
}

function renderButtons() {
  const b = state.buttons;

  // Sync preset buttons
  document.querySelectorAll("[data-btn-preset]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.btnPreset === b.preset);
  });
  document.querySelectorAll("[data-btn-fill]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.btnFill === b.fillMode);
  });
  document.querySelectorAll("[data-btn-transform]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.btnTransform === b.transform);
  });
  document.querySelectorAll("[data-btn-bstyle]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.btnBstyle === b.borderStyle);
  });
  document.querySelectorAll("[data-btn-hover]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.btnHover === b.hoverEffect);
  });
  document.querySelectorAll("[data-btn-bg]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.btnBg === b.stageBg);
  });

  // Conditional inspector panels
  btnGlassControls.classList.toggle("is-hidden", b.fillMode !== "glass");
  btnGradientExtras.classList.toggle("is-hidden", b.fillMode !== "gradient");
  btnGlowColorRow.classList.toggle("is-hidden", !b.glowEnabled);

  btnColor1Label.textContent =
    b.fillMode === "glass" ? "GLASS TINT" :
    b.fillMode === "gradient" ? "GRADIENT START" :
    b.fillMode === "outline" ? "ACCENT / HOVER FILL" : "FILL COLOR";

  // Sync input values & labels
  btnTextInput.value = b.text;
  btnIconSelect.value = b.icon;
  btnIconPos.value = b.iconPos;

  btnColor1.value = normalizeHex(b.color1).toLowerCase();
  btnColor1Hex.value = normalizeHex(b.color1);
  btnColor1Val.textContent = normalizeHex(b.color1);

  btnColor2.value = normalizeHex(b.color2).toLowerCase();
  btnColor2Hex.value = normalizeHex(b.color2);
  btnColor2Val.textContent = normalizeHex(b.color2);
  btnGradAngle.value = b.gradAngle;
  btnGradAngleVal.textContent = `${b.gradAngle}°`;

  btnTextColor.value = normalizeHex(b.textColor).toLowerCase();
  btnTextColorHex.value = normalizeHex(b.textColor);
  btnTextColorVal.textContent = normalizeHex(b.textColor);

  btnGlassBlur.value = b.glassBlur;
  btnGlassBlurVal.textContent = `${b.glassBlur}px`;
  btnGlassOpacity.value = b.glassOpacity;
  btnGlassOpacityVal.textContent = `${b.glassOpacity}%`;
  btnGlassSpecular.value = b.glassSpecular;
  btnGlassSpecularVal.textContent = `${b.glassSpecular}%`;
  btnGlassSaturate.value = b.glassSaturate;
  btnGlassSaturateVal.textContent = `${b.glassSaturate}%`;

  btnFont.value = b.font;
  btnFontSize.value = b.fontSize;
  btnFontSizeVal.textContent = `${b.fontSize}px`;
  btnFontWeight.value = b.fontWeight;
  btnFontWeightVal.textContent = String(b.fontWeight);
  btnLetterSpacing.value = b.letterSpacing;
  btnLetterSpacingVal.textContent = `${Number(b.letterSpacing).toFixed(2)}em`;
  btnPadX.value = b.padX;
  btnPadXVal.textContent = `${b.padX}px`;
  btnPadY.value = b.padY;
  btnPadYVal.textContent = `${b.padY}px`;
  btnRadius.value = b.radius;
  btnRadiusVal.textContent = b.radius >= 48 ? "PILL" : `${b.radius}px`;

  btnBorderWidth.value = b.borderWidth;
  btnBorderWidthVal.textContent = `${b.borderWidth}px`;
  btnBorderColor.value = normalizeHex(b.borderColor).toLowerCase();
  btnBorderOpacity.value = b.borderOpacity;
  btnBorderOpacityVal.textContent = `${b.borderOpacity}%`;

  btnShadowEnabled.checked = b.shadowEnabled;
  btnShadowY.value = b.shadowY;
  btnShadowYVal.textContent = `${b.shadowY}px`;
  btnShadowBlur.value = b.shadowBlur;
  btnShadowBlurVal.textContent = `${b.shadowBlur}px`;
  btnShadowSpread.value = b.shadowSpread;
  btnShadowSpreadVal.textContent = `${b.shadowSpread}px`;
  btnShadowColor.value = normalizeHex(b.shadowColor).toLowerCase();
  btnShadowOpacity.value = b.shadowOpacity;
  btnShadowOpacityVal.textContent = `${b.shadowOpacity}%`;

  btnGlowEnabled.checked = b.glowEnabled;
  btnGlowColor.value = normalizeHex(b.glowColor).toLowerCase();
  btnGlowSize.value = b.glowSize;

  // Stage backdrop
  btnViewport.className = `btn-viewport btn-viewport--${b.stageBg}`;

  // Inject real live CSS for interactive & state preview buttons
  btnStyleTag.textContent = buildButtonRuleSet(".studio-btn-live", true);

  // Update button inner text/icons
  const markup = buildButtonInnerMarkup();
  livePreviewBtn.innerHTML = markup;
  stateDefaultBtn.innerHTML = markup;
  stateHoverBtn.innerHTML = markup;
  stateDisabledBtn.innerHTML = markup;

  // Update code blocks
  btnHtmlOutput.textContent = buildButtonHtmlSnippet();
  btnCssOutput.textContent = buildButtonCssSnippet();
}

// Presets & Sync Palette
document.querySelectorAll("[data-btn-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.btnPreset;
    const p = BUTTON_PRESETS[key];
    if (!p) return;
    state.buttons = { ...state.buttons, ...p, preset: key };
    playClickTick(600);
    renderButtons();
    persistState(true);
  });
});

document.getElementById("syncPaletteToBtn").addEventListener("click", () => {
  const sw = state.palette.swatches;
  const c1 = sw[0]?.hex || "#6D4AFF";
  const c2 = sw[1]?.hex || "#38BDF8";
  state.buttons.preset = "";
  state.buttons.color1 = c1;
  state.buttons.color2 = c2;
  state.buttons.glowColor = c1;
  if (state.buttons.fillMode === "solid" || state.buttons.fillMode === "gradient") {
    state.buttons.textColor = bestTextColor(c1);
  } else if (state.buttons.fillMode === "outline") {
    state.buttons.borderColor = c1;
    state.buttons.textColor = c1;
  } else {
    state.buttons.borderColor = c1;
  }
  playClickTick(660);
  renderButtons();
  persistState(true);
  showToast("BUTTON COLORS SYNCED FROM PALETTE");
});

document.querySelectorAll("[data-btn-fill]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.buttons.preset = "";
    state.buttons.fillMode = btn.dataset.btnFill;
    if (state.buttons.fillMode === "glass" && state.buttons.borderWidth === 0) {
      state.buttons.borderWidth = 1;
    }
    if (state.buttons.fillMode === "outline" && state.buttons.borderWidth === 0) {
      state.buttons.borderWidth = 1;
    }
    playClickTick(540);
    renderButtons();
    persistState(true);
  });
});

document.querySelectorAll("[data-btn-transform]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.buttons.transform = btn.dataset.btnTransform;
    playClickTick(500);
    renderButtons();
    persistState(true);
  });
});

document.querySelectorAll("[data-btn-bstyle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.buttons.borderStyle = btn.dataset.btnBstyle;
    playClickTick(500);
    renderButtons();
    persistState(true);
  });
});

document.querySelectorAll("[data-btn-hover]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.buttons.hoverEffect = btn.dataset.btnHover;
    playClickTick(560);
    renderButtons();
    persistState(true);
  });
});

document.querySelectorAll("[data-btn-bg]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.buttons.stageBg = btn.dataset.btnBg;
    playClickTick(500);
    renderButtons();
    persistState(true);
  });
});

// Wire text, selects, color pickers, hex inputs, sliders & switches
[
  [btnTextInput, "text", "string"],
  [btnIconSelect, "icon", "string"],
  [btnIconPos, "iconPos", "string"],
  [btnColor1, "color1", "hex"],
  [btnColor1Hex, "color1", "hex-change"],
  [btnColor2, "color2", "hex"],
  [btnColor2Hex, "color2", "hex-change"],
  [btnGradAngle, "gradAngle", "number"],
  [btnTextColor, "textColor", "hex"],
  [btnTextColorHex, "textColor", "hex-change"],
  [btnGlassBlur, "glassBlur", "number"],
  [btnGlassOpacity, "glassOpacity", "number"],
  [btnGlassSpecular, "glassSpecular", "number"],
  [btnGlassSaturate, "glassSaturate", "number"],
  [btnFont, "font", "string"],
  [btnFontSize, "fontSize", "number"],
  [btnFontWeight, "fontWeight", "number"],
  [btnLetterSpacing, "letterSpacing", "number"],
  [btnPadX, "padX", "number"],
  [btnPadY, "padY", "number"],
  [btnRadius, "radius", "number"],
  [btnBorderWidth, "borderWidth", "number"],
  [btnBorderColor, "borderColor", "hex"],
  [btnBorderOpacity, "borderOpacity", "number"],
  [btnShadowEnabled, "shadowEnabled", "checked"],
  [btnShadowY, "shadowY", "number"],
  [btnShadowBlur, "shadowBlur", "number"],
  [btnShadowSpread, "shadowSpread", "number"],
  [btnShadowColor, "shadowColor", "hex"],
  [btnShadowOpacity, "shadowOpacity", "number"],
  [btnGlowEnabled, "glowEnabled", "checked"],
  [btnGlowColor, "glowColor", "hex"],
  [btnGlowSize, "glowSize", "number"]
].forEach(([el, key, kind]) => {
  const evt = kind === "hex-change" ? "change" : "input";
  el.addEventListener(evt, () => {
    if (key !== "text" && key !== "icon" && key !== "iconPos") state.buttons.preset = "";
    if (kind === "checked") state.buttons[key] = el.checked;
    else if (kind === "number") state.buttons[key] = Number(el.value);
    else if (kind === "hex" || kind === "hex-change") state.buttons[key] = normalizeHex(el.value);
    else state.buttons[key] = el.value;
    renderButtons();
    persistState(true);
  });
});

livePreviewBtn.addEventListener("click", () => {
  playClickTick(700);
  showToast(`CLICKED "${(state.buttons.text || "BUTTON").toUpperCase()}"`);
});

document.getElementById("copyBtnHtmlAction").addEventListener("click", () => {
  copyText(buildButtonHtmlSnippet(), "BUTTON HTML");
});
document.getElementById("copyBtnHtmlCode").addEventListener("click", () => {
  copyText(buildButtonHtmlSnippet(), "BUTTON HTML");
});
document.getElementById("copyBtnCssAction").addEventListener("click", () => {
  copyText(buildButtonCssSnippet(), "BUTTON CSS");
});
document.getElementById("copyBtnCssCode").addEventListener("click", () => {
  copyText(buildButtonCssSnippet(), "BUTTON CSS");
});

// =========================================================================
// GLOBAL ACTIONS: RANDOMIZE ALL, SAVE, SOUND, RESET, KEYBOARD SHORTCUTS
// =========================================================================
function randomizeCoherentAll() {
  const harmonies = ["analogous", "complementary", "triadic", "monochromatic"];
  const seed = hslToHex(Math.floor(Math.random() * 360), 66 + Math.floor(Math.random() * 24), 48 + Math.floor(Math.random() * 14));
  state.palette.harmony = harmonies[Math.floor(Math.random() * harmonies.length)];
  state.palette.seed = seed;
  state.palette.swatches = generateHarmonyColors(seed, state.palette.harmony, state.palette.count, state.palette.swatches).map((hex, i) => ({
    hex,
    locked: Boolean(state.palette.swatches[i]?.locked)
  }));

  // Coherently sync palette into Glass & FX
  const gradTypes = ["linear", "radial", "conic"];
  state.glass.type = gradTypes[Math.floor(Math.random() * gradTypes.length)];
  state.glass.angle = Math.floor(Math.random() * 12) * 30;
  const pick = state.palette.swatches.slice(0, 3);
  state.glass.stops = [
    { color: pick[0].hex, pos: 0 },
    { color: pick[1]?.hex || pick[0].hex, pos: 52 },
    { color: "#0b0b12", pos: 100 }
  ];
  state.glass.blur = 10 + Math.floor(Math.random() * 20);
  state.glass.noiseIntensity = 12 + Math.floor(Math.random() * 24);

  // Coherent Layout shuffle
  const modes = ["flex", "grid"];
  state.layout.mode = modes[Math.floor(Math.random() * modes.length)];
  state.layout.gap = [8, 12, 16, 20, 24][Math.floor(Math.random() * 5)];
  state.layout.gridCols = [2, 3, 4][Math.floor(Math.random() * 3)];

  // Coherent Typography pairing
  const ratios = [1.2, 1.25, 1.333, 1.414, 1.5];
  const fonts = [
    "'DM Sans', sans-serif",
    "'Inter', sans-serif",
    "'Space Grotesk', sans-serif",
    "'Playfair Display', serif"
  ];
  state.type.ratio = ratios[Math.floor(Math.random() * ratios.length)];
  state.type.font = fonts[Math.floor(Math.random() * fonts.length)];

  // Coherent Button Lab update
  const btnModes = ["glass", "gradient", "solid", "outline"];
  const chosenMode = btnModes[Math.floor(Math.random() * btnModes.length)];
  state.buttons.preset = "";
  state.buttons.fillMode = chosenMode;
  state.buttons.color1 = chosenMode === "glass" ? "#FFFFFF" : pick[0].hex;
  state.buttons.color2 = pick[1]?.hex || pick[0].hex;
  state.buttons.glowColor = pick[0].hex;
  state.buttons.glowEnabled = chosenMode === "gradient" || chosenMode === "glass";
  state.buttons.textColor = chosenMode === "solid" || chosenMode === "gradient" ? bestTextColor(pick[0].hex) : "#FFFFFF";
  state.buttons.borderColor = chosenMode === "glass" ? "#FFFFFF" : pick[0].hex;
  state.buttons.radius = [4, 8, 14, 24, 48][Math.floor(Math.random() * 5)];

  renderAll();
  playClickTick(740);
  persistState(true);
  showToast("RANDOMIZED ALL 5 MODULES COHERENTLY");
}

document.getElementById("randomizeAllBtn").addEventListener("click", randomizeCoherentAll);
document.getElementById("saveStateBtn").addEventListener("click", () => {
  playClickTick(680);
  persistState(false);
});

const soundToggleBtn = document.getElementById("soundToggleBtn");
function updateSoundButton() {
  soundToggleBtn.textContent = state.soundEnabled ? "SFX: ON" : "SFX: OFF";
  soundToggleBtn.setAttribute("aria-pressed", String(state.soundEnabled));
}
soundToggleBtn.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  updateSoundButton();
  if (state.soundEnabled) playClickTick(620);
  persistState(true);
});

document.getElementById("resetStudioBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  applyStudioThemeVars();
  renderAll();
  setActiveTool("palette");
  showToast("STUDIO RESET TO DEFAULTS");
});

// Keyboard shortcuts (1-5 switch modules, R randomizes active module, S saves)
window.addEventListener("keydown", (e) => {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key === "1") setActiveTool("palette");
  else if (e.key === "2") setActiveTool("glass");
  else if (e.key === "3") setActiveTool("layout");
  else if (e.key === "4") setActiveTool("type");
  else if (e.key === "5") setActiveTool("buttons");
  else if (e.key.toLowerCase() === "r") {
    if (state.activeTool === "palette") {
      document.getElementById("regenPaletteBtn").click();
    } else {
      randomizeCoherentAll();
    }
  } else if (e.key.toLowerCase() === "s") {
    e.preventDefault();
    persistState(false);
  }
});

// === Initial Render ===
function renderAll() {
  applyStudioThemeVars();
  updateSoundButton();
  renderPalette();
  renderGlass(true);
  renderLayout();
  renderType();
  renderButtons();
}

renderAll();
setActiveTool(state.activeTool || "palette");
