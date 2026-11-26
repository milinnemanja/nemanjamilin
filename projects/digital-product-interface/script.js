/* =========================================================
   ::BEFORE SOLUTIONS — DIGITAL PRODUCT INTERFACE (CHECKOUT)
   Pure Vanilla JS: Stepper, Validation, State Machine, Audio
========================================================= */

(() => {
  "use strict";

  // === Settings & Constants ===
  const HOVER_SOUND_URL = "../../tap_01.wav";
  const TZ = "Europe/Belgrade";
  const TAX_RATE = 0.10;
  const FREE_SHIPPING_THRESHOLD = 150;
  const EXPRESS_FEE = 18;

  const PROMO_CODES = {
    BEFORE10: { rate: 0.10, label: "10% OFF STUDIO" },
    STUDIO20: { rate: 0.20, label: "20% OFF PRO" }
  };

  const CARD_PRESETS = {
    success: { number: "4242 4242 4242 4242", holder: "Nemanja Milin", expiry: "08/28", cvc: "842", outcome: "success" },
    decline: { number: "4000 0000 0000 0002", holder: "Nemanja Milin", expiry: "09/27", cvc: "104", outcome: "declined" },
    network: { number: "5555 5555 5555 4444", holder: "Nemanja Milin", expiry: "11/29", cvc: "512", outcome: "network" }
  };

  // === Catalog & Initial Data ===
  const PRODUCT_ART = {
    kit: `<svg viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="2" stroke="currentColor" stroke-width="1.4"/>
      <path d="M8 18H40M18 18V40" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="29" cy="29" r="5" stroke="#8b5cf6" stroke-width="1.4"/>
    </svg>`,
    mat: `<svg viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true">
      <rect x="6" y="14" width="36" height="20" rx="2" stroke="currentColor" stroke-width="1.4"/>
      <line x1="12" y1="28" x2="24" y2="28" stroke="#34d399" stroke-width="1.4"/>
      <circle cx="34" cy="21" r="2" fill="currentColor"/>
    </svg>`,
    poster: `<svg viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true">
      <rect x="12" y="6" width="24" height="36" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M18 16H30M18 22H26M18 32H30" stroke="currentColor" stroke-width="1.4"/>
    </svg>`,
    tokens: `<svg viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true">
      <polygon points="24,8 40,17 40,31 24,40 8,31 8,17" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="24" cy="24" r="4" stroke="#38bdf8" stroke-width="1.4"/>
    </svg>`,
    sleeve: `<svg viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true">
      <rect x="10" y="10" width="28" height="28" rx="3" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2"/>
      <path d="M18 24H30" stroke="currentColor" stroke-width="1.4"/>
    </svg>`
  };

  function getDefaultCart() {
    return [
      {
        id: "bf-kit",
        sku: "BF-101",
        name: "Brand Identity Architecture Kit",
        variant: "Edition: Digital + Hardcover Spec",
        tag: "STUDIO",
        price: 120.00,
        qty: 1,
        art: "kit"
      },
      {
        id: "bf-mat",
        sku: "BF-204",
        name: "Modular Acoustic Desk Mat",
        variant: "Finish: Matte Obsidian · 900×400mm",
        tag: "HARDWARE",
        price: 54.00,
        qty: 1,
        art: "mat"
      },
      {
        id: "bf-poster",
        sku: "BF-309",
        name: "::BEFORE Type Specimen Poster",
        variant: "Format: A1 Archival 240gsm",
        tag: "PRINT",
        price: 38.00,
        qty: 1,
        art: "poster"
      }
    ];
  }

  const ADDONS = [
    {
      id: "bf-tokens",
      sku: "BF-412",
      name: "Figma Design Tokens Pack",
      variant: "License: Single Commercial Seat",
      tag: "DIGITAL",
      price: 29.00,
      art: "tokens"
    },
    {
      id: "bf-sleeve",
      sku: "BF-518",
      name: "Carbon Felt Transit Sleeve",
      variant: "Size: 16-inch Workstation",
      tag: "ACCESSORY",
      price: 42.00,
      art: "sleeve"
    }
  ];

  // === Application State ===
  const state = {
    step: "cart",
    maxStepIndex: 0,
    cart: getDefaultCart(),
    promo: null,
    soundEnabled: true,
    qaOpen: true,
    simOutcome: "success",
    disabledPreview: false,
    processingTimers: [],
    lastRemoved: null,
    lastOrder: null,
    shipping: {
      fullName: "",
      email: "",
      phone: "",
      deliveryMethod: "standard",
      street: "",
      apartment: "",
      city: "",
      postalCode: "",
      country: "RS"
    },
    payment: {
      method: "card",
      cardNumber: "",
      cardHolder: "",
      cardExpiry: "",
      cardCvc: "",
      sameAsShipping: true,
      billingStreet: "",
      billingCity: "",
      billingPostal: ""
    }
  };

  const STEP_ORDER = ["cart", "shipping", "payment", "review"];

  // === DOM Cache ===
  const el = {
    stepperWrap: document.getElementById("stepperWrap"),
    stepperFill: document.getElementById("stepperFill"),
    stepNodes: Array.from(document.querySelectorAll(".step-node")),
    stepViews: Array.from(document.querySelectorAll(".step-view")),
    checkoutGrid: document.getElementById("checkoutGrid"),
    checkoutSidebar: document.getElementById("checkoutSidebar"),

    // Topbar & QA
    soundToggleBtn: document.getElementById("soundToggleBtn"),
    qaToggleBtn: document.getElementById("qaToggleBtn"),
    qaBar: document.getElementById("qaBar"),
    simOutcomeBtns: Array.from(document.querySelectorAll("[data-sim-outcome]")),
    qaEmptyCartBtn: document.getElementById("qaEmptyCartBtn"),
    qaFillDemoBtn: document.getElementById("qaFillDemoBtn"),
    qaValidationBtn: document.getElementById("qaValidationBtn"),
    qaDisabledBtn: document.getElementById("qaDisabledBtn"),
    qaResetBtn: document.getElementById("qaResetBtn"),

    // Cart
    cartItemsList: document.getElementById("cartItemsList"),
    cartEmptyState: document.getElementById("cartEmptyState"),
    cartCountBadge: document.getElementById("cartCountBadge"),
    clearCartBtn: document.getElementById("clearCartBtn"),
    restoreBagBtn: document.getElementById("restoreBagBtn"),
    addonsGrid: document.getElementById("addonsGrid"),
    cartFootNote: document.getElementById("cartFootNote"),
    toShippingBtn: document.getElementById("toShippingBtn"),

    // Shipping
    shippingForm: document.getElementById("shippingForm"),
    shippingErrorBanner: document.getElementById("shippingErrorBanner"),
    fillDemoShippingBtn: document.getElementById("fillDemoShippingBtn"),
    stdShippingPriceLabel: document.getElementById("stdShippingPriceLabel"),
    addressFieldsSection: document.getElementById("addressFieldsSection"),
    addressDisabledChip: document.getElementById("addressDisabledChip"),
    backToCartBtn: document.getElementById("backToCartBtn"),
    toPaymentBtn: document.getElementById("toPaymentBtn"),

    // Payment
    paymentForm: document.getElementById("paymentForm"),
    paymentErrorBanner: document.getElementById("paymentErrorBanner"),
    methodTabs: Array.from(document.querySelectorAll("[data-pay-method]")),
    payPanelCard: document.getElementById("payPanelCard"),
    payPanelWallet: document.getElementById("payPanelWallet"),
    payPanelBank: document.getElementById("payPanelBank"),
    virtualCard: document.getElementById("virtualCard"),
    cardNetworkBadge: document.getElementById("cardNetworkBadge"),
    cardPreviewNumber: document.getElementById("cardPreviewNumber"),
    cardPreviewHolder: document.getElementById("cardPreviewHolder"),
    cardPreviewExpiry: document.getElementById("cardPreviewExpiry"),
    cardPreviewCvc: document.getElementById("cardPreviewCvc"),
    cardNumber: document.getElementById("cardNumber"),
    cardHolder: document.getElementById("cardHolder"),
    cardExpiry: document.getElementById("cardExpiry"),
    cardCvc: document.getElementById("cardCvc"),
    sameAsShippingCheck: document.getElementById("sameAsShippingCheck"),
    billingExtraFields: document.getElementById("billingExtraFields"),
    backToShippingBtn: document.getElementById("backToShippingBtn"),
    toReviewBtn: document.getElementById("toReviewBtn"),

    // Review
    reviewShippingBody: document.getElementById("reviewShippingBody"),
    reviewPaymentBody: document.getElementById("reviewPaymentBody"),
    reviewItemsList: document.getElementById("reviewItemsList"),
    agreeTermsCheck: document.getElementById("agreeTermsCheck"),
    termsHint: document.getElementById("termsHint"),
    backToPaymentBtn: document.getElementById("backToPaymentBtn"),
    placeOrderBtn: document.getElementById("placeOrderBtn"),
    placeOrderBtnLabel: document.getElementById("placeOrderBtnLabel"),

    // Processing / Success / Error
    processBarFill: document.getElementById("processBarFill"),
    processLogItems: Array.from(document.querySelectorAll(".process-log__item")),
    receiptCard: document.getElementById("receiptCard"),
    successSubtitle: document.getElementById("successSubtitle"),
    downloadReceiptBtn: document.getElementById("downloadReceiptBtn"),
    newCheckoutBtn: document.getElementById("newCheckoutBtn"),
    errorCodeBadge: document.getElementById("errorCodeBadge"),
    errorHeading: document.getElementById("errorHeading"),
    errorMessage: document.getElementById("errorMessage"),
    errorDiagnostics: document.getElementById("errorDiagnostics"),
    retryOrderBtn: document.getElementById("retryOrderBtn"),
    editPaymentFromErrBtn: document.getElementById("editPaymentFromErrBtn"),
    switchToBankBtn: document.getElementById("switchToBankBtn"),

    // Sidebar Summary
    summaryCard: document.querySelector(".summary-card"),
    summaryMobileToggle: document.getElementById("summaryMobileToggle"),
    summaryItemCount: document.getElementById("summaryItemCount"),
    summaryMobileTotal: document.getElementById("summaryMobileTotal"),
    summaryItems: document.getElementById("summaryItems"),
    promoForm: document.getElementById("promoForm"),
    promoInput: document.getElementById("promoInput"),
    applyPromoBtn: document.getElementById("applyPromoBtn"),
    promoMsg: document.getElementById("promoMsg"),
    promoActiveChip: document.getElementById("promoActiveChip"),
    promoActiveText: document.getElementById("promoActiveText"),
    removePromoBtn: document.getElementById("removePromoBtn"),
    sumSubtotal: document.getElementById("sumSubtotal"),
    sumDiscountRow: document.getElementById("sumDiscountRow"),
    sumDiscount: document.getElementById("sumDiscount"),
    sumShipping: document.getElementById("sumShipping"),
    sumTax: document.getElementById("sumTax"),
    sumTotal: document.getElementById("sumTotal"),

    toastStack: document.getElementById("toastStack")
  };

  // === Live Clock (Zrenjanin, RS) ===
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

    document.querySelectorAll("[data-clock]").forEach((node) => {
      node.textContent = `${hour}:${minute}`;
    });
    document.querySelectorAll("[data-day]").forEach((node) => {
      node.textContent = day;
    });
  }
  updateClocks();
  setInterval(updateClocks, 10000);

  // === Micro-Audio (tap_01.wav) ===
  let audioUnlocked = false;
  const audioBase = new Audio(HOVER_SOUND_URL);
  audioBase.preload = "auto";
  audioBase.volume = 0.65;

  async function unlockAudioOnce() {
    if (audioUnlocked) return;
    try {
      const prev = audioBase.volume;
      audioBase.volume = 0;
      audioBase.currentTime = 0;
      await audioBase.play();
      audioBase.pause();
      audioBase.currentTime = 0;
      audioBase.volume = prev;
      audioUnlocked = true;
    } catch {
      audioUnlocked = false;
    }
  }

  window.addEventListener("pointerdown", unlockAudioOnce, { capture: true, passive: true });
  window.addEventListener("keydown", unlockAudioOnce, { capture: true });

  let lastPlay = 0;
  function playHoverSound() {
    if (!state.soundEnabled || !audioUnlocked) return;
    const now = performance.now();
    if (now - lastPlay < 85) return;
    lastPlay = now;
    const clone = audioBase.cloneNode(true);
    clone.volume = audioBase.volume;
    clone.play().catch(() => {});
  }

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".hover-sound");
    if (!target || target.disabled) return;
    if (e.relatedTarget && target.contains(e.relatedTarget)) return;
    playHoverSound();
  });

  // === Helpers ===
  const formatMoney = (val) => `$${Number(val).toFixed(2)}`;
  const pad2 = (n) => String(n).padStart(2, "0");

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showToast(message, variant = "default", actionLabel = null, onAction = null) {
    const toast = document.createElement("div");
    toast.className = `toast ${variant === "ok" ? "toast--ok" : variant === "err" ? "toast--err" : ""}`;

    const text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(text);

    if (actionLabel && onAction) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-link hover-sound";
      btn.textContent = actionLabel;
      btn.addEventListener("click", () => {
        onAction();
        toast.remove();
      });
      toast.appendChild(btn);
    }

    el.toastStack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(6px)";
      toast.style.transition = "opacity .18s ease, transform .18s ease";
      setTimeout(() => toast.remove(), 200);
    }, 3400);
  }

  // === Pricing Calculation ===
  function calculateTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = state.promo ? subtotal * state.promo.rate : 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);

    let shippingCost = 0;
    if (state.cart.length > 0) {
      if (state.shipping.deliveryMethod === "express") {
        shippingCost = EXPRESS_FEE;
      } else if (state.shipping.deliveryMethod === "standard") {
        shippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 12;
      } else {
        shippingCost = 0;
      }
    }

    const tax = discountedSubtotal * TAX_RATE;
    const total = state.cart.length > 0 ? discountedSubtotal + shippingCost + tax : 0;
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);

    return { subtotal, discount, shippingCost, tax, total, totalItems };
  }

  // === Render Cart & Add-ons ===
  function renderCart() {
    const { totalItems, subtotal } = calculateTotals();
    el.cartCountBadge.textContent = `${pad2(totalItems)} ${totalItems === 1 ? "ITEM" : "ITEMS"}`;

    if (state.cart.length === 0) {
      el.cartItemsList.innerHTML = "";
      el.cartItemsList.classList.add("is-hidden");
      el.cartEmptyState.classList.remove("is-hidden");
      el.clearCartBtn.disabled = true;
      el.toShippingBtn.disabled = true;
      el.cartFootNote.innerHTML = `<span class="status-dot status-dot--err" aria-hidden="true"></span><span>BAG IS EMPTY · ADD AT LEAST ONE ITEM TO CONTINUE</span>`;
    } else {
      el.cartItemsList.classList.remove("is-hidden");
      el.cartEmptyState.classList.add("is-hidden");
      el.clearCartBtn.disabled = state.disabledPreview;
      el.toShippingBtn.disabled = state.disabledPreview;

      const remainingFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      el.cartFootNote.innerHTML = remainingFree === 0
        ? `<span class="status-dot status-dot--ok" aria-hidden="true"></span><span>QUALIFIES FOR FREE STANDARD TRACKED SHIPPING</span>`
        : `<span class="status-dot status-dot--ok" aria-hidden="true"></span><span>ADD ${formatMoney(remainingFree)} MORE FOR FREE STANDARD SHIPPING</span>`;

      el.cartItemsList.innerHTML = state.cart.map((item) => `
        <article class="cart-item" data-item-id="${escapeHtml(item.id)}" role="listitem">
          <div class="cart-item__thumb">${PRODUCT_ART[item.art] || PRODUCT_ART.kit}</div>
          <div class="cart-item__info">
            <div class="cart-item__meta">
              <span class="cart-item__sku">${escapeHtml(item.sku)}</span>
              <span class="cart-item__tag">${escapeHtml(item.tag)}</span>
            </div>
            <h2 class="cart-item__title">${escapeHtml(item.name)}</h2>
            <span class="cart-item__variant">${escapeHtml(item.variant)}</span>
          </div>
          <div class="cart-item__controls">
            <span class="cart-item__price">${formatMoney(item.price * item.qty)}</span>
            <div class="cart-item__actions">
              <div class="stepper-qty" aria-label="Quantity for ${escapeHtml(item.name)}">
                <button
                  class="stepper-qty__btn hover-sound"
                  type="button"
                  data-qty-action="dec"
                  data-id="${escapeHtml(item.id)}"
                  aria-label="Decrease quantity"
                  ${item.qty <= 1 || state.disabledPreview ? "disabled" : ""}
                >−</button>
                <span class="stepper-qty__val">${item.qty}</span>
                <button
                  class="stepper-qty__btn hover-sound"
                  type="button"
                  data-qty-action="inc"
                  data-id="${escapeHtml(item.id)}"
                  aria-label="Increase quantity"
                  ${item.qty >= 10 || state.disabledPreview ? "disabled" : ""}
                >+</button>
              </div>
              <button
                class="remove-btn hover-sound"
                type="button"
                data-remove-id="${escapeHtml(item.id)}"
                ${state.disabledPreview ? "disabled" : ""}
              >REMOVE</button>
            </div>
          </div>
        </article>
      `).join("");
    }

    renderAddons();
    renderSummary();
  }

  function renderAddons() {
    el.addonsGrid.innerHTML = ADDONS.map((addon) => {
      const inCart = state.cart.some((i) => i.id === addon.id);
      return `
        <div class="addon-card">
          <div>
            <span class="addon-card__title">${escapeHtml(addon.name)}</span>
            <span class="addon-card__meta">${escapeHtml(addon.sku)} · ${formatMoney(addon.price)}</span>
          </div>
          <button
            class="btn-ghost btn-ghost--xs hover-sound"
            type="button"
            data-add-addon="${escapeHtml(addon.id)}"
            ${inCart || state.disabledPreview ? "disabled" : ""}
          >${inCart ? "ADDED ✓" : "+ ADD"}</button>
        </div>
      `;
    }).join("");
  }

  // === Render Sidebar Summary ===
  function renderSummary(flashTotal = false) {
    const { subtotal, discount, shippingCost, tax, total, totalItems } = calculateTotals();

    el.summaryItemCount.textContent = `${pad2(totalItems)} ${totalItems === 1 ? "ITEM" : "ITEMS"}`;
    el.summaryMobileTotal.textContent = formatMoney(total);

    if (state.cart.length === 0) {
      el.summaryItems.innerHTML = `<div class="summary-empty">NO ITEMS IN BAG</div>`;
    } else {
      el.summaryItems.innerHTML = state.cart.map((item) => `
        <div class="summary-item">
          <div>
            <span class="summary-item__name">${escapeHtml(item.name)}</span>
            <span class="summary-item__sub">QTY ${item.qty} × ${formatMoney(item.price)}</span>
          </div>
          <span class="mono">${formatMoney(item.price * item.qty)}</span>
        </div>
      `).join("");
    }

    el.sumSubtotal.textContent = formatMoney(subtotal);

    if (state.promo && discount > 0) {
      el.sumDiscountRow.classList.remove("is-hidden");
      el.sumDiscount.textContent = `-${formatMoney(discount)}`;
    } else {
      el.sumDiscountRow.classList.add("is-hidden");
    }

    el.sumShipping.textContent = state.cart.length === 0
      ? "$0.00"
      : shippingCost === 0 ? "FREE" : formatMoney(shippingCost);

    el.sumTax.textContent = formatMoney(tax);
    el.sumTotal.textContent = formatMoney(total);
    el.placeOrderBtnLabel.textContent = `PLACE ORDER · ${formatMoney(total)}`;

    // Update dynamic standard shipping label on step 2
    const discounted = Math.max(0, subtotal - discount);
    el.stdShippingPriceLabel.textContent = discounted >= FREE_SHIPPING_THRESHOLD || state.cart.length === 0 ? "FREE" : "$12.00";

    if (flashTotal) {
      el.sumTotal.classList.remove("is-flashing");
      void el.sumTotal.offsetWidth;
      el.sumTotal.classList.add("is-flashing");
    }
  }

  // === Step Navigation ===
  function goToStep(targetStep) {
    clearProcessingTimers();
    state.step = targetStep;

    const idx = STEP_ORDER.indexOf(targetStep);
    if (idx !== -1 && idx > state.maxStepIndex) {
      state.maxStepIndex = idx;
    }

    const isTerminal = ["processing", "success", "error"].includes(targetStep);
    el.checkoutSidebar.classList.toggle("is-hidden", isTerminal);
    el.checkoutGrid.classList.toggle("checkout-grid--terminal", isTerminal);
    el.stepperWrap.classList.toggle("is-hidden", isTerminal);

    // Update Stepper Nodes
    if (!isTerminal) {
      const progressPct = ((idx + 1) / STEP_ORDER.length) * 100;
      el.stepperFill.style.width = `${progressPct}%`;

      el.stepNodes.forEach((node, i) => {
        const isActive = i === idx;
        const isDone = i < idx || (i <= state.maxStepIndex && i !== idx);
        node.classList.toggle("is-active", isActive);
        node.classList.toggle("is-done", isDone && i < idx);
        node.setAttribute("aria-current", isActive ? "step" : "false");
        node.disabled = i > state.maxStepIndex || state.cart.length === 0 && i > 0;
      });
    }

    // Switch active section
    const viewId = isTerminal ? `view-${targetStep}` : `step-${targetStep}`;
    el.stepViews.forEach((view) => {
      const match = view.id === viewId;
      view.hidden = !match;
      view.classList.toggle("is-active", match);
    });

    if (targetStep === "review") {
      renderReview();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // === Validation Engine ===
  const VALIDATORS = {
    fullName: (v) => v.trim().length >= 2 || "Enter your full name (at least 2 characters).",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email address.",
    phone: (v) => v.replace(/\D/g, "").length >= 7 || "Enter a valid phone number (7+ digits).",
    street: (v) => v.trim().length >= 4 || "Enter your street address and house number.",
    apartment: () => true,
    city: (v) => v.trim().length >= 2 || "Enter your city.",
    postalCode: (v) => v.trim().length >= 3 || "Enter a valid postal code.",
    country: (v) => v.trim().length > 0 || "Select a country.",
    cardNumber: (v) => {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 13 || digits.length > 19) return "Card number must be 13–19 digits.";
      return luhnCheck(digits) || "Card number failed checksum verification.";
    },
    cardHolder: (v) => v.trim().length >= 2 || "Enter the cardholder name.",
    cardExpiry: (v) => {
      const match = /^(\d{2})\/(\d{2})$/.exec(v.trim());
      if (!match) return "Use MM/YY format.";
      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);
      if (month < 1 || month > 12) return "Invalid month (01–12).";
      const now = new Date();
      const expDate = new Date(year, month, 0, 23, 59, 59);
      return expDate >= now || "Card has expired.";
    },
    cardCvc: (v) => /^\d{3,4}$/.test(v.trim()) || "Enter 3 or 4 digit security code.",
    billingStreet: (v) => v.trim().length >= 4 || "Enter billing street address.",
    billingCity: (v) => v.trim().length >= 2 || "Enter billing city.",
    billingPostal: (v) => v.trim().length >= 3 || "Enter billing postal code."
  };

  function luhnCheck(numStr) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = numStr.length - 1; i >= 0; i--) {
      let digit = parseInt(numStr.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function validateField(fieldName, forceShow = true) {
    const fieldEl = document.querySelector(`.field[data-field="${fieldName}"]`);
    if (!fieldEl) return true;
    const input = fieldEl.querySelector("input, select");
    const errEl = document.getElementById(`err-${fieldName}`);
    if (!input || input.disabled) {
      fieldEl.classList.remove("is-error", "is-valid");
      if (errEl) errEl.textContent = "";
      return true;
    }

    const validator = VALIDATORS[fieldName];
    const result = validator ? validator(input.value) : true;
    const isOptionalEmpty = fieldName === "apartment" && input.value.trim() === "";

    if (result === true) {
      fieldEl.classList.remove("is-error");
      fieldEl.classList.toggle("is-valid", !isOptionalEmpty && input.value.trim().length > 0);
      if (errEl) errEl.textContent = "";
      input.setAttribute("aria-invalid", "false");
      return true;
    }

    if (forceShow) {
      fieldEl.classList.remove("is-valid", "is-shaking");
      void fieldEl.offsetWidth;
      fieldEl.classList.add("is-error", "is-shaking");
      if (errEl) errEl.textContent = result;
      input.setAttribute("aria-invalid", "true");
    }
    return false;
  }

  function validateFieldList(fieldNames) {
    let firstInvalid = null;
    let allValid = true;
    fieldNames.forEach((name) => {
      const ok = validateField(name, true);
      if (!ok) {
        allValid = false;
        if (!firstInvalid) {
          firstInvalid = document.querySelector(`.field[data-field="${name}"] input, .field[data-field="${name}"] select`);
        }
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return allValid;
  }

  // Attach blur + live recovery listeners
  document.querySelectorAll(".field").forEach((fieldEl) => {
    const fieldName = fieldEl.dataset.field;
    const input = fieldEl.querySelector("input, select");
    if (!input || !fieldName) return;

    input.addEventListener("blur", () => {
      if (input.value.trim() !== "" || fieldEl.classList.contains("is-error")) {
        validateField(fieldName, true);
      }
    });

    input.addEventListener("input", () => {
      if (fieldEl.classList.contains("is-error") || fieldEl.classList.contains("is-valid")) {
        validateField(fieldName, true);
      }
    });
  });

  // === Shipping Step Logic ===
  function syncDeliveryUI() {
    const method = state.shipping.deliveryMethod;
    const isPickup = method === "pickup";

    document.querySelectorAll(".choice-card").forEach((card) => {
      const radio = card.querySelector("input[type='radio']");
      card.classList.toggle("is-selected", radio.value === method);
    });

    el.addressDisabledChip.classList.toggle("is-hidden", !isPickup);
    const addrInputs = el.addressFieldsSection.querySelectorAll("input, select");
    addrInputs.forEach((input) => {
      input.disabled = isPickup || state.disabledPreview;
      if (isPickup) {
        const f = input.closest(".field");
        if (f) f.classList.remove("is-error", "is-valid");
        const err = document.getElementById(`err-${input.name}`);
        if (err) err.textContent = "";
      }
    });

    renderSummary(true);
  }

  document.querySelectorAll('input[name="deliveryMethod"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.shipping.deliveryMethod = e.target.value;
      syncDeliveryUI();
    });
  });

  function fillDemoShipping(silent = false) {
    const demo = {
      shipFullName: "Nemanja Milin",
      shipEmail: "nemanja@before.solutions",
      shipPhone: "+381 60 482 9104",
      shipStreet: "Kralja Aleksandra I Karadjordjevica 24",
      shipApartment: "Studio 4B",
      shipCity: "Zrenjanin",
      shipPostal: "23000",
      shipCountry: "RS"
    };
    Object.entries(demo).forEach(([id, val]) => {
      const node = document.getElementById(id);
      if (node && !node.disabled) {
        node.value = val;
        const fieldName = node.closest(".field")?.dataset.field;
        if (fieldName) validateField(fieldName, true);
      }
    });
    el.shippingErrorBanner.classList.add("is-hidden");
    if (!silent) showToast("DEMO SHIPPING DETAILS LOADED", "ok");
  }

  function saveShippingFromInputs() {
    state.shipping.fullName = document.getElementById("shipFullName").value.trim();
    state.shipping.email = document.getElementById("shipEmail").value.trim();
    state.shipping.phone = document.getElementById("shipPhone").value.trim();
    state.shipping.street = document.getElementById("shipStreet").value.trim();
    state.shipping.apartment = document.getElementById("shipApartment").value.trim();
    state.shipping.city = document.getElementById("shipCity").value.trim();
    state.shipping.postalCode = document.getElementById("shipPostal").value.trim();
    state.shipping.country = document.getElementById("shipCountry").value;
  }

  el.shippingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["fullName", "email", "phone"];
    if (state.shipping.deliveryMethod !== "pickup") {
      fields.push("street", "city", "postalCode", "country");
    }
    const ok = validateFieldList(fields);
    el.shippingErrorBanner.classList.toggle("is-hidden", ok);
    if (!ok) {
      showToast("CHECK HIGHLIGHTED SHIPPING FIELDS", "err");
      return;
    }
    saveShippingFromInputs();
    goToStep("payment");
  });

  // === Payment Step & Virtual Card Logic ===
  function detectCardNetwork(digits) {
    if (digits.startsWith("4")) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTERCARD";
    if (/^3[47]/.test(digits)) return "AMEX";
    return "CARD";
  }

  function updateVirtualCardPreview() {
    const raw = el.cardNumber.value.replace(/\D/g, "");
    const groups = raw.match(/.{1,4}/g) || [];
    el.cardPreviewNumber.textContent = groups.length ? groups.join(" ").padEnd(19, "•") : "•••• •••• •••• ••••";
    el.cardNetworkBadge.textContent = detectCardNetwork(raw);
    el.cardPreviewHolder.textContent = el.cardHolder.value.trim().toUpperCase() || "CARDHOLDER NAME";
    el.cardPreviewExpiry.textContent = el.cardExpiry.value.trim() || "MM/YY";
    el.cardPreviewCvc.textContent = el.cardCvc.value.trim() ? el.cardCvc.value.replace(/./g, "•") : "•••";
  }

  el.cardNumber.addEventListener("input", (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    updateVirtualCardPreview();
  });

  el.cardHolder.addEventListener("input", updateVirtualCardPreview);

  el.cardExpiry.addEventListener("input", (e) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    e.target.value = digits;
    updateVirtualCardPreview();
  });

  el.cardCvc.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    updateVirtualCardPreview();
  });

  el.cardCvc.addEventListener("focus", () => el.virtualCard.classList.add("is-flipped"));
  el.cardCvc.addEventListener("blur", () => el.virtualCard.classList.remove("is-flipped"));

  function applyCardPreset(key, showNotice = true) {
    const preset = CARD_PRESETS[key];
    if (!preset) return;
    el.cardNumber.value = preset.number;
    el.cardHolder.value = preset.holder;
    el.cardExpiry.value = preset.expiry;
    el.cardCvc.value = preset.cvc;
    updateVirtualCardPreview();
    ["cardNumber", "cardHolder", "cardExpiry", "cardCvc"].forEach((f) => validateField(f, true));
    setSimOutcome(preset.outcome, false);
    if (showNotice) showToast(`PRESET APPLIED · SIMULATES ${preset.outcome.toUpperCase()}`, "ok");
  }

  document.querySelectorAll("[data-card-preset]").forEach((btn) => {
    btn.addEventListener("click", () => applyCardPreset(btn.dataset.cardPreset));
  });

  function switchPaymentMethod(method) {
    state.payment.method = method;
    el.methodTabs.forEach((tab) => {
      const active = tab.dataset.payMethod === method;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    el.payPanelCard.classList.toggle("is-hidden", method !== "card");
    el.payPanelWallet.classList.toggle("is-hidden", method !== "wallet");
    el.payPanelBank.classList.toggle("is-hidden", method !== "bank");
    el.paymentErrorBanner.classList.add("is-hidden");
  }

  el.methodTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchPaymentMethod(tab.dataset.payMethod));
  });

  // Copy IBAN / Reference micro-interaction
  document.querySelectorAll("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
      } catch {
        // Fallback ignored in sandboxed file:// context
      }
      const orig = btn.textContent;
      btn.textContent = "COPIED ✓";
      showToast("COPIED TO CLIPBOARD", "ok");
      setTimeout(() => { btn.textContent = orig; }, 1600);
    });
  });

  el.sameAsShippingCheck.addEventListener("change", (e) => {
    state.payment.sameAsShipping = e.target.checked;
    el.billingExtraFields.classList.toggle("is-hidden", e.target.checked);
  });

  function savePaymentFromInputs() {
    state.payment.cardNumber = el.cardNumber.value.trim();
    state.payment.cardHolder = el.cardHolder.value.trim();
    state.payment.cardExpiry = el.cardExpiry.value.trim();
    state.payment.cardCvc = el.cardCvc.value.trim();
    state.payment.billingStreet = document.getElementById("billStreet").value.trim();
    state.payment.billingCity = document.getElementById("billCity").value.trim();
    state.payment.billingPostal = document.getElementById("billPostal").value.trim();
  }

  el.paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [];
    if (state.payment.method === "card") {
      fields.push("cardNumber", "cardHolder", "cardExpiry", "cardCvc");
    }
    if (!state.payment.sameAsShipping) {
      fields.push("billingStreet", "billingCity", "billingPostal");
    }
    const ok = validateFieldList(fields);
    el.paymentErrorBanner.classList.toggle("is-hidden", ok);
    if (!ok) {
      showToast("COMPLETE VALID PAYMENT DETAILS", "err");
      return;
    }
    savePaymentFromInputs();
    goToStep("review");
  });

  // === Order Review ===
  function renderReview() {
    const s = state.shipping;
    const deliveryLabels = {
      standard: "Standard Tracked Courier (3–5 days)",
      express: "Express Air Priority (1–2 days)",
      pickup: "Studio Pickup — Zrenjanin, RS (24h)"
    };

    const addressHtml = s.deliveryMethod === "pickup"
      ? `<span class="muted">Pickup at ::BEFORE Studio, Zrenjanin, RS</span>`
      : `${escapeHtml(s.street)}${s.apartment ? `, ${escapeHtml(s.apartment)}` : ""}<br>${escapeHtml(s.postalCode)} ${escapeHtml(s.city)}, ${escapeHtml(s.country)}`;

    el.reviewShippingBody.innerHTML = `
      <strong>${escapeHtml(s.fullName)}</strong><br>
      <span class="muted">${escapeHtml(s.email)} · ${escapeHtml(s.phone)}</span><br>
      ${addressHtml}<br>
      <span class="muted">${deliveryLabels[s.deliveryMethod]}</span>
    `;

    let payHtml = "";
    if (state.payment.method === "card") {
      const digits = state.payment.cardNumber.replace(/\D/g, "");
      const last4 = digits.slice(-4) || "4242";
      const net = detectCardNetwork(digits);
      payHtml = `<strong>${net} •••• ${escapeHtml(last4)}</strong><br>
        <span class="muted">${escapeHtml(state.payment.cardHolder)} · Exp ${escapeHtml(state.payment.cardExpiry)}</span>`;
    } else if (state.payment.method === "wallet") {
      payHtml = `<strong>Express Wallet (Touch ID)</strong><br><span class="muted">Instant passkey settlement</span>`;
    } else {
      payHtml = `<strong>SEPA / Wire Invoice</strong><br><span class="muted">Ref: BF-INV-2026-8841</span>`;
    }
    el.reviewPaymentBody.innerHTML = payHtml;

    el.reviewItemsList.innerHTML = state.cart.map((item) => `
      <div class="review-item-row">
        <div class="review-item-row__left">
          <span class="review-item-row__qty">${item.qty}×</span>
          <span>${escapeHtml(item.name)}</span>
        </div>
        <span class="mono">${formatMoney(item.price * item.qty)}</span>
      </div>
    `).join("");

    syncTermsState();
  }

  function syncTermsState() {
    const agreed = el.agreeTermsCheck.checked;
    el.placeOrderBtn.disabled = !agreed || state.disabledPreview || state.cart.length === 0;
    el.termsHint.classList.toggle("is-ready", agreed);
    el.termsHint.textContent = agreed
      ? "READY TO AUTHORIZE ORDER."
      : "Accept the studio agreement above to enable order placement.";
  }

  el.agreeTermsCheck.addEventListener("change", syncTermsState);

  document.querySelectorAll("[data-jump-step]").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(btn.dataset.jumpStep));
  });

  // === Processing, Success & Error Pipeline ===
  function clearProcessingTimers() {
    state.processingTimers.forEach((id) => clearTimeout(id));
    state.processingTimers = [];
  }

  function runOrderAuthorization() {
    goToStep("processing");
    el.processBarFill.style.width = "10%";
    el.processLogItems.forEach((li) => li.classList.remove("is-running", "is-done"));

    const setPhase = (phase, status) => {
      const node = el.processLogItems[phase - 1];
      if (!node) return;
      node.classList.remove("is-running", "is-done");
      if (status) node.classList.add(status);
    };

    setPhase(1, "is-running");
    state.processingTimers.push(setTimeout(() => {
      setPhase(1, "is-done");
      setPhase(2, "is-running");
      el.processBarFill.style.width = "55%";
    }, 650));

    state.processingTimers.push(setTimeout(() => {
      setPhase(2, "is-done");
      setPhase(3, "is-running");
      el.processBarFill.style.width = "88%";
    }, 1350));

    state.processingTimers.push(setTimeout(() => {
      el.processBarFill.style.width = "100%";
      if (state.simOutcome === "success") {
        setPhase(3, "is-done");
        finalizeSuccessOrder();
      } else {
        finalizeErrorState(state.simOutcome);
      }
    }, 2050));
  }

  function finalizeSuccessOrder() {
    const totals = calculateTotals();
    const orderId = `BF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: TZ });

    state.lastOrder = {
      orderId,
      timestamp,
      totals,
      customer: { ...state.shipping },
      paymentMethod: state.payment.method,
      items: state.cart.map((i) => ({ ...i }))
    };

    el.successSubtitle.textContent = `Confirmation dispatched to ${state.shipping.email || "your inbox"}. Your studio order is queued.`;

    el.receiptCard.innerHTML = `
      <div class="receipt-row"><span>ORDER REFERENCE</span><strong class="mono">${orderId}</strong></div>
      <div class="receipt-row"><span>TIMESTAMP</span><span class="mono">${escapeHtml(timestamp)}</span></div>
      <div class="receipt-row"><span>RECIPIENT</span><span>${escapeHtml(state.shipping.fullName || "Guest")}</span></div>
      <div class="receipt-row"><span>ITEMS</span><span class="mono">${pad2(totals.totalItems)} UNITS</span></div>
      <div class="receipt-row"><span>TOTAL CHARGED</span><strong class="mono">${formatMoney(totals.total)}</strong></div>
    `;

    goToStep("success");
    showToast(`ORDER ${orderId} CONFIRMED`, "ok");
  }

  function finalizeErrorState(kind) {
    const isNetwork = kind === "network";
    el.errorCodeBadge.textContent = isNetwork ? "ERR_NETWORK_TIMEOUT" : "ERR_PAYMENT_DECLINED";
    el.errorHeading.textContent = isNetwork ? "GATEWAY CONNECTION TIMEOUT" : "AUTHORIZATION DECLINED";
    el.errorMessage.textContent = isNetwork
      ? "The payment gateway did not respond within 8,000ms. Your form data and bag are preserved — please retry."
      : "The issuing bank declined this card authorization (code: 05 / Do Not Honor). No funds were captured.";

    const totals = calculateTotals();
    el.errorDiagnostics.innerHTML = `
      <div class="receipt-row"><span>STATUS</span><strong style="color:var(--c-error)">${isNetwork ? "504 GATEWAY TIMEOUT" : "402 CARD DECLINED"}</strong></div>
      <div class="receipt-row"><span>AMOUNT ATTEMPTED</span><span class="mono">${formatMoney(totals.total)}</span></div>
      <div class="receipt-row"><span>METHOD</span><span class="mono">${state.payment.method.toUpperCase()}</span></div>
      <div class="receipt-row"><span>RECOVERY</span><span>Form inputs &amp; bag preserved</span></div>
    `;

    goToStep("error");
    showToast(isNetwork ? "NETWORK TIMEOUT OCCURRED" : "PAYMENT AUTHORIZATION FAILED", "err");
  }

  el.placeOrderBtn.addEventListener("click", runOrderAuthorization);
  el.retryOrderBtn.addEventListener("click", runOrderAuthorization);
  el.editPaymentFromErrBtn.addEventListener("click", () => goToStep("payment"));
  el.switchToBankBtn.addEventListener("click", () => {
    switchPaymentMethod("bank");
    setSimOutcome("success", false);
    goToStep("payment");
    showToast("SWITCHED TO BANK TRANSFER", "ok");
  });

  el.downloadReceiptBtn.addEventListener("click", () => {
    if (!state.lastOrder) return;
    const o = state.lastOrder;
    const lines = [
      "::BEFORE SOLUTIONS — OFFICIAL STUDIO RECEIPT",
      "============================================",
      `ORDER ID:   ${o.orderId}`,
      `TIMESTAMP:  ${o.timestamp}`,
      `CUSTOMER:   ${o.customer.fullName} (${o.customer.email})`,
      `METHOD:     ${o.paymentMethod.toUpperCase()}`,
      "--------------------------------------------",
      ...o.items.map((i) => `${i.qty}x ${i.name} (${i.sku}) - ${formatMoney(i.price * i.qty)}`),
      "--------------------------------------------",
      `SUBTOTAL:   ${formatMoney(o.totals.subtotal)}`,
      `DISCOUNT:   -${formatMoney(o.totals.discount)}`,
      `SHIPPING:   ${o.totals.shippingCost === 0 ? "FREE" : formatMoney(o.totals.shippingCost)}`,
      `TAX (10%):  ${formatMoney(o.totals.tax)}`,
      `TOTAL PAID: ${formatMoney(o.totals.total)}`,
      "============================================"
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${o.orderId}-receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("RECEIPT DOWNLOADED", "ok");
  });

  // === Cart Events ===
  el.cartItemsList.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-qty-action]");
    if (qtyBtn) {
      const id = qtyBtn.dataset.id;
      const item = state.cart.find((i) => i.id === id);
      if (!item) return;
      if (qtyBtn.dataset.qtyAction === "inc" && item.qty < 10) item.qty += 1;
      if (qtyBtn.dataset.qtyAction === "dec" && item.qty > 1) item.qty -= 1;
      renderCart();
      renderSummary(true);
      return;
    }

    const remBtn = e.target.closest("[data-remove-id]");
    if (remBtn) {
      const id = remBtn.dataset.removeId;
      const idx = state.cart.findIndex((i) => i.id === id);
      if (idx === -1) return;
      const row = remBtn.closest(".cart-item");
      const removedItem = state.cart[idx];
      state.lastRemoved = { item: removedItem, index: idx };

      if (row) row.classList.add("is-removing");
      setTimeout(() => {
        state.cart = state.cart.filter((i) => i.id !== id);
        renderCart();
        renderSummary(true);
        showToast(`REMOVED ${removedItem.sku}`, "default", "UNDO", () => {
          if (!state.lastRemoved) return;
          state.cart.splice(state.lastRemoved.index, 0, state.lastRemoved.item);
          state.lastRemoved = null;
          renderCart();
          renderSummary(true);
        });
      }, 210);
    }
  });

  el.addonsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-addon]");
    if (!btn) return;
    const addon = ADDONS.find((a) => a.id === btn.dataset.addAddon);
    if (!addon || state.cart.some((i) => i.id === addon.id)) return;
    state.cart.push({ ...addon, qty: 1 });
    renderCart();
    renderSummary(true);
    showToast(`ADDED ${addon.name.toUpperCase()}`, "ok");
  });

  el.clearCartBtn.addEventListener("click", () => {
    state.cart = [];
    state.maxStepIndex = 0;
    renderCart();
    showToast("STUDIO BAG CLEARED");
  });

  el.restoreBagBtn.addEventListener("click", () => {
    state.cart = getDefaultCart();
    renderCart();
    renderSummary(true);
    showToast("DEFAULT STUDIO BAG RESTORED", "ok");
  });

  el.toShippingBtn.addEventListener("click", () => {
    if (state.cart.length > 0) goToStep("shipping");
  });

  el.backToCartBtn.addEventListener("click", () => goToStep("cart"));
  el.backToShippingBtn.addEventListener("click", () => goToStep("shipping"));
  el.backToPaymentBtn.addEventListener("click", () => goToStep("payment"));
  el.fillDemoShippingBtn.addEventListener("click", () => fillDemoShipping(false));

  el.stepNodes.forEach((node) => {
    node.addEventListener("click", () => {
      if (!node.disabled) goToStep(node.dataset.stepTarget);
    });
  });

  // === Promo Code Logic ===
  el.promoInput.addEventListener("input", () => {
    el.applyPromoBtn.disabled = el.promoInput.value.trim().length === 0 || state.disabledPreview;
    el.promoMsg.textContent = "";
    el.promoMsg.className = "promo-form__msg";
  });

  el.promoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = el.promoInput.value.trim().toUpperCase();
    if (!raw) return;

    el.applyPromoBtn.disabled = true;
    el.applyPromoBtn.textContent = "...";

    setTimeout(() => {
      el.applyPromoBtn.textContent = "APPLY";
      const match = PROMO_CODES[raw];
      if (match) {
        state.promo = { code: raw, rate: match.rate, label: match.label };
        el.promoInput.value = "";
        el.promoMsg.textContent = "";
        el.promoActiveText.textContent = `${raw} (${match.label})`;
        el.promoActiveChip.classList.remove("is-hidden");
        renderSummary(true);
        showToast(`PROMO ${raw} APPLIED`, "ok");
      } else {
        el.promoMsg.textContent = "Invalid code. Try BEFORE10 or STUDIO20.";
        el.promoMsg.className = "promo-form__msg is-err";
        el.applyPromoBtn.disabled = false;
      }
    }, 300);
  });

  el.removePromoBtn.addEventListener("click", () => {
    state.promo = null;
    el.promoActiveChip.classList.add("is-hidden");
    renderSummary(true);
    showToast("PROMO CODE REMOVED");
  });

  // === Mobile Summary Accordion ===
  el.summaryMobileToggle.addEventListener("click", () => {
    if (window.innerWidth > 1040) return;
    const collapsed = el.summaryCard.classList.toggle("is-collapsed");
    el.summaryMobileToggle.setAttribute("aria-expanded", String(!collapsed));
  });

  // === Topbar & State Lab Controls ===
  el.soundToggleBtn.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    el.soundToggleBtn.textContent = `SFX: ${state.soundEnabled ? "ON" : "OFF"}`;
    el.soundToggleBtn.setAttribute("aria-pressed", String(state.soundEnabled));
  });

  el.qaToggleBtn.addEventListener("click", () => {
    state.qaOpen = !state.qaOpen;
    el.qaBar.classList.toggle("is-collapsed", !state.qaOpen);
    el.qaToggleBtn.classList.toggle("is-active", state.qaOpen);
    el.qaToggleBtn.setAttribute("aria-pressed", String(state.qaOpen));
  });

  function setSimOutcome(outcome, toast = true) {
    state.simOutcome = outcome;
    el.simOutcomeBtns.forEach((b) => {
      const active = b.dataset.simOutcome === outcome;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    if (toast) showToast(`GATEWAY SIMULATION: ${outcome.toUpperCase()}`);
  }

  el.simOutcomeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setSimOutcome(btn.dataset.simOutcome));
  });

  el.qaEmptyCartBtn.addEventListener("click", () => {
    state.cart = [];
    state.maxStepIndex = 0;
    goToStep("cart");
    renderCart();
    showToast("EMPTY CART STATE ACTIVE");
  });

  el.qaFillDemoBtn.addEventListener("click", () => {
    if (state.cart.length === 0) state.cart = getDefaultCart();
    fillDemoShipping(true);
    saveShippingFromInputs();
    applyCardPreset("success", false);
    savePaymentFromInputs();
    state.maxStepIndex = 3;
    renderCart();
    if (state.step === "cart") goToStep("shipping");
    showToast("DEMO DATA PREFILLED ACROSS FLOW", "ok");
  });

  el.qaValidationBtn.addEventListener("click", () => {
    if (state.cart.length === 0) state.cart = getDefaultCart();
    renderCart();
    if (state.step === "payment") {
      switchPaymentMethod("card");
      el.cardNumber.value = "4111";
      el.cardHolder.value = "";
      el.cardExpiry.value = "01/20";
      el.cardCvc.value = "1";
      validateFieldList(["cardNumber", "cardHolder", "cardExpiry", "cardCvc"]);
      el.paymentErrorBanner.classList.remove("is-hidden");
    } else {
      goToStep("shipping");
      document.getElementById("shipFullName").value = "";
      document.getElementById("shipEmail").value = "invalid-email";
      document.getElementById("shipPhone").value = "12";
      document.getElementById("shipStreet").value = "";
      validateFieldList(["fullName", "email", "phone", "street", "city", "postalCode"]);
      el.shippingErrorBanner.classList.remove("is-hidden");
    }
    showToast("VALIDATION ERRORS TRIGGERED", "err");
  });

  el.qaDisabledBtn.addEventListener("click", () => {
    state.disabledPreview = !state.disabledPreview;
    el.qaDisabledBtn.classList.toggle("is-active", state.disabledPreview);
    el.qaDisabledBtn.setAttribute("aria-pressed", String(state.disabledPreview));
    renderCart();
    syncDeliveryUI();
    syncTermsState();
    el.applyPromoBtn.disabled = state.disabledPreview || el.promoInput.value.trim().length === 0;
    showToast(state.disabledPreview ? "DISABLED CONTROLS PREVIEW ON" : "DISABLED CONTROLS PREVIEW OFF");
  });

  function resetAllFlow() {
    clearProcessingTimers();
    state.cart = getDefaultCart();
    state.promo = null;
    state.maxStepIndex = 0;
    state.disabledPreview = false;
    state.lastOrder = null;
    setSimOutcome("success", false);

    el.qaDisabledBtn.classList.remove("is-active");
    el.qaDisabledBtn.setAttribute("aria-pressed", "false");
    el.promoActiveChip.classList.add("is-hidden");
    el.promoMsg.textContent = "";
    el.shippingForm.reset();
    el.paymentForm.reset();
    el.agreeTermsCheck.checked = false;
    el.sameAsShippingCheck.checked = true;
    el.billingExtraFields.classList.add("is-hidden");
    el.shippingErrorBanner.classList.add("is-hidden");
    el.paymentErrorBanner.classList.add("is-hidden");
    document.querySelectorAll(".field").forEach((f) => {
      f.classList.remove("is-error", "is-valid");
      const err = f.querySelector(".field__error");
      if (err) err.textContent = "";
    });
    state.shipping.deliveryMethod = "standard";
    switchPaymentMethod("card");
    updateVirtualCardPreview();
    syncDeliveryUI();
    renderCart();
    goToStep("cart");
    showToast("CHECKOUT FLOW RESET");
  }

  el.qaResetBtn.addEventListener("click", resetAllFlow);
  el.newCheckoutBtn.addEventListener("click", resetAllFlow);

  // === Initialize ===
  updateVirtualCardPreview();
  syncDeliveryUI();
  renderCart();
  goToStep("cart");
})();
