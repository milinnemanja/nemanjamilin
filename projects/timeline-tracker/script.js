/* =========================================================
   ::BEFORE SOLUTIONS — TIMELINE TRACKER
   Pure Vanilla JS: 3 Shifts, Full Clock Picker, Live Timeline, History Calendar
========================================================= */

(() => {
  "use strict";

  const HOVER_SOUND_URL = "../../tap_01.wav";
  const STORAGE_KEY = "before_timeline_tracker_v1";
  const CUSTOM_TYPES_KEY = "before_timeline_custom_types_v1";
  const TZ = "Europe/Belgrade";

  // 12 Default Triadic Colors derived from Studio Purple (#6d4aff / 252° -> 252°, 132°, 12°)
  const TRIADIC_PALETTE = [
    { hex: "#6d4aff", name: "STUDIO PURPLE", pole: "P" },
    { hex: "#8b5cf6", name: "ELECTRIC VIOLET", pole: "P" },
    { hex: "#a855f7", name: "ORCHID PURPLE", pole: "P" },
    { hex: "#4f46e5", name: "DEEP INDIGO", pole: "P" },
    { hex: "#10b981", name: "TRIAD EMERALD", pole: "E" },
    { hex: "#34d399", name: "MINT SIGNAL", pole: "E" },
    { hex: "#14b8a6", name: "TEAL PULSE", pole: "E" },
    { hex: "#84cc16", name: "LIME SHIFT", pole: "E" },
    { hex: "#f97316", name: "TRIAD ORANGE", pole: "C" },
    { hex: "#fb7185", name: "CORAL ROSE", pole: "C" },
    { hex: "#f59e0b", name: "AMBER ALERT", pole: "C" },
    { hex: "#eab308", name: "GOLD WARNING", pole: "C" }
  ];

  const SHIFTS = {
    1: {
      id: 1,
      name: "SHIFT 01",
      label: "06:00 – 14:00",
      startMin: 360,
      defaultStart: "09:15",
      defaultEnd: "09:45",
      hours: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]
    },
    2: {
      id: 2,
      name: "SHIFT 02",
      label: "14:00 – 22:00",
      startMin: 840,
      defaultStart: "17:30",
      defaultEnd: "18:22",
      hours: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
    },
    3: {
      id: 3,
      name: "SHIFT 03",
      label: "22:00 – 06:00",
      startMin: 1320,
      defaultStart: "01:15",
      defaultEnd: "01:45",
      hours: ["22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"]
    }
  };

  const BUILTIN_TYPES = [
    { id: "error", label: "SYSTEM ERROR / STOP", short: "ERROR", color: "#ef4444", isCustom: false },
    { id: "lunch", label: "LUNCH BREAK", short: "LUNCH BREAK", color: "#ffffff", isCustom: false },
    { id: "work", label: "PRODUCTION WORKING", short: "PRODUCTION", color: "#6d4aff", isCustom: false }
  ];

  // === Time & Date Helpers ===
  const pad2 = (n) => String(n).padStart(2, "0");

  function getNowParts() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(now);

    const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const weekday = new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      weekday: "short"
    }).format(now).toUpperCase();

    const year = get("year");
    const month = get("month");
    const day = get("day");
    const hour = get("hour") === 24 ? 0 : get("hour");
    const minute = get("minute");
    const second = get("second");

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      weekday,
      dateKey: `${year}-${pad2(month)}-${pad2(day)}`
    };
  }

  function shiftDateKey(dateKey, deltaDays) {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
    return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
  }

  function getActiveShiftInfo(nowParts) {
    const { hour, minute, second, dateKey } = nowParts;
    if (hour >= 6 && hour < 14) {
      return { shiftId: 1, opDateKey: dateKey, relMin: (hour * 60 + minute) - 360 + second / 60 };
    }
    if (hour >= 14 && hour < 22) {
      return { shiftId: 2, opDateKey: dateKey, relMin: (hour * 60 + minute) - 840 + second / 60 };
    }
    if (hour >= 22) {
      return { shiftId: 3, opDateKey: dateKey, relMin: (hour * 60 + minute) - 1320 + second / 60 };
    }
    return { shiftId: 3, opDateKey: shiftDateKey(dateKey, -1), relMin: (hour * 60 + minute) + 120 + second / 60 };
  }

  function parseTimeStr(str) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(str.trim());
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return { h, min };
  }

  function toShiftRelMin(timeStr, shiftId) {
    const parsed = parseTimeStr(timeStr);
    if (!parsed) return null;
    const total = parsed.h * 60 + parsed.min;

    if (shiftId === 1) {
      const rel = total - 360;
      return rel >= 0 && rel <= 480 ? rel : null;
    }
    if (shiftId === 2) {
      const rel = total - 840;
      return rel >= 0 && rel <= 480 ? rel : null;
    }
    // Shift 3: 22:00..23:59 -> 0..120, 00:00..06:00 -> 120..480
    if (total >= 1320) return total - 1320;
    if (total <= 360) return total + 120;
    return null;
  }

  function relMinToTimeStr(rel, shiftId) {
    const abs = (SHIFTS[shiftId].startMin + rel) % 1440;
    return `${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
  }

  function formatDuration(mins) {
    const m = Math.max(0, Math.round(mins));
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h === 0) return `${rem}m`;
    if (rem === 0) return `${h}h`;
    return `${h}h ${rem}m`;
  }

  function formatDateReadable(dateKey) {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(dt).toUpperCase();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // === Realistic Initial History Seed ===
  function buildSeedData(nowParts) {
    const active = getActiveShiftInfo(nowParts);
    const today = active.opDateKey;
    const data = {};

    const add = (dateKey, shiftId, type, start, end, comment) => {
      const key = `${dateKey}|${shiftId}`;
      if (!data[key]) data[key] = [];
      data[key].push({
        id: `seed-${dateKey}-${shiftId}-${data[key].length + 1}`,
        type,
        start,
        end,
        comment
      });
    };

    // Today's completed/ongoing shifts
    if (active.shiftId >= 2) {
      add(today, 1, "work", "06:00", "06:20", "Morning line startup & safety verification");
      add(today, 1, "lunch", "10:00", "10:30", "Lunch break");
      add(today, 1, "error", "11:42", "12:08", "Conveyor optical sensor fault — recalibrated");
    }
    if (active.shiftId === 2 && active.relMin > 55) {
      add(today, 2, "work", "14:00", "14:15", "Afternoon shift handover completed");
      add(today, 2, "error", "14:40", "15:04", "Hydraulic pressure drop on Line B");
    }
    if (active.shiftId === 3) {
      add(today, 1, "lunch", "10:00", "10:30", "Lunch break");
      add(today, 2, "error", "16:15", "16:44", "PLC gateway timeout — restarted controller");
      add(today, 2, "lunch", "18:30", "19:00", "Lunch break");
    }

    // Past 12 days realistic history
    const templates = [
      (d) => {
        add(d, 1, "lunch", "10:00", "10:30", "Lunch break");
        add(d, 1, "error", "12:10", "12:38", "Production stopped due to system error (PLC sync)");
        add(d, 2, "lunch", "18:15", "18:45", "Lunch break");
        add(d, 3, "error", "00:25", "01:05", "Thermal overload on Packaging Unit 02");
        add(d, 3, "lunch", "02:00", "02:30", "Lunch break");
      },
      (d) => {
        add(d, 1, "lunch", "10:05", "10:35", "Lunch break");
        add(d, 2, "error", "17:30", "18:22", "Production stopped due to system error");
        add(d, 2, "lunch", "19:15", "19:45", "Lunch break");
        add(d, 3, "lunch", "02:10", "02:40", "Lunch break");
      },
      (d) => {
        add(d, 1, "work", "06:00", "06:25", "Scheduled tooling inspection before run");
        add(d, 1, "lunch", "10:00", "10:30", "Lunch break");
        add(d, 2, "lunch", "18:00", "18:30", "Lunch break");
        add(d, 3, "work", "22:00", "22:20", "Night batch parameter check");
        add(d, 3, "lunch", "02:00", "02:30", "Lunch break");
      },
      (d) => {
        add(d, 1, "error", "08:12", "08:47", "Main feeder belt tension alarm");
        add(d, 1, "lunch", "10:15", "10:45", "Lunch break");
        add(d, 2, "lunch", "18:00", "18:30", "Lunch break");
        add(d, 2, "error", "20:05", "20:29", "Label printer firmware freeze");
        add(d, 3, "lunch", "02:00", "02:30", "Lunch break");
      }
    ];

    for (let offset = 1; offset <= 12; offset++) {
      const pastKey = shiftDateKey(today, -offset);
      templates[offset % templates.length](pastKey);
    }

    return data;
  }

  function loadStorage(nowParts) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      // ignore storage errors
    }
    const seed = buildSeedData(nowParts);
    saveStorage(seed);
    return seed;
  }

  function saveStorage(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore storage errors
    }
  }

  function loadCustomTypes() {
    try {
      const raw = localStorage.getItem(CUSTOM_TYPES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  }

  function saveCustomTypes(types) {
    try {
      localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(types));
    } catch {
      // ignore storage errors
    }
  }

  function getContrastText(hex) {
    const clean = (hex || "#6d4aff").replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? "#111111" : "#ffffff";
  }

  // === State ===
  const initialNow = getNowParts();
  const initialActive = getActiveShiftInfo(initialNow);

  const state = {
    logs: loadStorage(initialNow),
    customTypes: loadCustomTypes(),
    selectedEventType: "error",
    selectedPaletteColor: TRIADIC_PALETTE[4].hex, // #10b981 Triad Emerald default
    customDrawerOpen: false,
    selectedDate: initialActive.opDateKey,
    selectedShift: initialActive.shiftId,
    calendarYear: Number(initialActive.opDateKey.split("-")[0]),
    calendarMonth: Number(initialActive.opDateKey.split("-")[1]) - 1, // 0-indexed
    editingId: null,
    soundEnabled: true,
    clockTarget: "start", // "start" | "end"
    clockMode: "hour",    // "hour" | "min"
    startTime: SHIFTS[initialActive.shiftId].defaultStart,
    endTime: SHIFTS[initialActive.shiftId].defaultEnd
  };

  function getAllEventTypes() {
    return [...BUILTIN_TYPES, ...state.customTypes];
  }

  function getTypeMeta(typeId, fallbackColor = null) {
    const found = getAllEventTypes().find((t) => t.id === typeId);
    if (found) return found;
    return {
      id: typeId,
      label: "CUSTOM EVENT",
      short: "CUSTOM",
      color: fallbackColor || "#8b5cf6",
      isCustom: true
    };
  }

  // === DOM Cache ===
  const el = {
    liveClockSeconds: document.getElementById("liveClockSeconds"),
    liveDateLabel: document.getElementById("liveDateLabel"),
    liveShiftBanner: document.getElementById("liveShiftBanner"),
    jumpLiveBtn: document.getElementById("jumpLiveBtn"),
    soundToggleBtn: document.getElementById("soundToggleBtn"),

    shiftTabs: Array.from(document.querySelectorAll(".shift-tab")),
    timelineLegend: document.getElementById("timelineLegend"),
    timelineContextKicker: document.getElementById("timelineContextKicker"),
    timelineTitle: document.getElementById("timelineTitle"),
    timelineHours: document.getElementById("timelineHours"),
    timelineTrack: document.getElementById("timelineTrack"),
    timelineSegments: document.getElementById("timelineSegments"),
    timelineTicks: document.getElementById("timelineTicks"),
    timelineNowCursor: document.getElementById("timelineNowCursor"),
    timelineNowBadge: document.getElementById("timelineNowBadge"),
    timelineTooltip: document.getElementById("timelineTooltip"),

    kpiWorking: document.getElementById("kpiWorking"),
    kpiError: document.getElementById("kpiError"),
    kpiLunch: document.getElementById("kpiLunch"),
    kpiUptime: document.getElementById("kpiUptime"),

    eventForm: document.getElementById("eventForm"),
    formModeBadge: document.getElementById("formModeBadge"),
    statusSelector: document.getElementById("statusSelector"),
    toggleCustomOptionBtn: document.getElementById("toggleCustomOptionBtn"),
    customOptionDrawer: document.getElementById("customOptionDrawer"),
    customTypeName: document.getElementById("customTypeName"),
    selectedColorHex: document.getElementById("selectedColorHex"),
    triadicPaletteGrid: document.getElementById("triadicPaletteGrid"),
    customOptionError: document.getElementById("customOptionError"),
    cancelCustomOptionBtn: document.getElementById("cancelCustomOptionBtn"),
    saveCustomOptionBtn: document.getElementById("saveCustomOptionBtn"),
    startTimeCard: document.getElementById("startTimeCard"),
    endTimeCard: document.getElementById("endTimeCard"),
    startTimeInput: document.getElementById("startTimeInput"),
    endTimeInput: document.getElementById("endTimeInput"),
    intervalSummary: document.getElementById("intervalSummary"),
    eventComment: document.getElementById("eventComment"),
    formError: document.getElementById("formError"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    submitEventLabel: document.getElementById("submitEventLabel"),

    clockTargetLabel: document.getElementById("clockTargetLabel"),
    clockModeHour: document.getElementById("clockModeHour"),
    clockModeMin: document.getElementById("clockModeMin"),
    clockSvg: document.getElementById("clockSvg"),
    clockTicksLayer: document.getElementById("clockTicksLayer"),
    clockLabelsLayer: document.getElementById("clockLabelsLayer"),
    clockHand: document.getElementById("clockHand"),
    clockKnob: document.getElementById("clockKnob"),
    clockReadout: document.getElementById("clockReadout"),

    eventList: document.getElementById("eventList"),
    emptyLogState: document.getElementById("emptyLogState"),
    logCountBadge: document.getElementById("logCountBadge"),
    clearShiftBtn: document.getElementById("clearShiftBtn"),

    calendarMonthTitle: document.getElementById("calendarMonthTitle"),
    calPrevBtn: document.getElementById("calPrevBtn"),
    calNextBtn: document.getElementById("calNextBtn"),
    calendarGrid: document.getElementById("calendarGrid"),
    calDaySummary: document.getElementById("calDaySummary"),

    toastStack: document.getElementById("toastStack")
  };

  // === Hover Audio ===
  let audioUnlocked = false;
  const audioBase = new Audio(HOVER_SOUND_URL);
  audioBase.preload = "auto";
  audioBase.volume = 0.65;

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

  let lastSound = 0;
  document.addEventListener("mouseover", (e) => {
    if (!state.soundEnabled || !audioUnlocked) return;
    const t = e.target.closest(".hover-sound");
    if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
    const now = performance.now();
    if (now - lastSound < 85) return;
    lastSound = now;
    const c = audioBase.cloneNode(true);
    c.volume = audioBase.volume;
    c.play().catch(() => {});
  });

  function showToast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    el.toastStack.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transition = "opacity .18s ease";
      setTimeout(() => t.remove(), 200);
    }, 2600);
  }

  // === Shift Logs Accessors ===
  function getShiftEvents(dateKey = state.selectedDate, shiftId = state.selectedShift) {
    const key = `${dateKey}|${shiftId}`;
    const list = state.logs[key] ? [...state.logs[key]] : [];
    list.sort((a, b) => {
      const ra = toShiftRelMin(a.start, shiftId) ?? 0;
      const rb = toShiftRelMin(b.start, shiftId) ?? 0;
      return ra - rb;
    });
    return list;
  }

  function setShiftEvents(dateKey, shiftId, events) {
    const key = `${dateKey}|${shiftId}`;
    if (events.length === 0) {
      delete state.logs[key];
    } else {
      state.logs[key] = events;
    }
    saveStorage(state.logs);
  }

  // === Build Full-Width Timeline Segments & KPIs ===
  function computeShiftBreakdown(dateKey, shiftId, nowParts) {
    const active = getActiveShiftInfo(nowParts);
    const isLiveShift = dateKey === active.opDateKey && shiftId === active.shiftId;
    const isFutureDay = dateKey > active.opDateKey;
    const isFutureShiftToday = dateKey === active.opDateKey && (
      (active.shiftId === 1 && shiftId > 1) ||
      (active.shiftId === 2 && shiftId === 3)
    );

    let elapsedRel = 480;
    if (isFutureDay || isFutureShiftToday) elapsedRel = 0;
    else if (isLiveShift) elapsedRel = Math.max(0, Math.min(480, active.relMin));

    const events = getShiftEvents(dateKey, shiftId);

    // Track per-minute state across 480 minutes for accurate KPI totals
    const minuteState = new Array(480).fill(null);
    for (let m = 0; m < Math.floor(elapsedRel); m++) {
      minuteState[m] = "work";
    }
    events.forEach((ev) => {
      const s = toShiftRelMin(ev.start, shiftId);
      const e = toShiftRelMin(ev.end, shiftId);
      if (s === null || e === null || e <= s) return;
      for (let m = s; m < e && m < 480; m++) {
        minuteState[m] = ev.type;
      }
    });

    let workMins = 0;
    let errorMins = 0;
    let lunchMins = 0;
    let customMins = 0;
    minuteState.forEach((st) => {
      if (st === "work") workMins++;
      else if (st === "error") errorMins++;
      else if (st === "lunch") lunchMins++;
      else if (st !== null) customMins++;
    });

    const totalTracked = workMins + errorMins + lunchMins + customMins;
    const uptime = totalTracked > 0 ? Math.round(((totalTracked - errorMins) / totalTracked) * 100) : 100;

    return {
      isLiveShift,
      isFuture: isFutureDay || isFutureShiftToday,
      elapsedRel,
      events,
      workMins: workMins + customMins,
      errorMins,
      lunchMins,
      uptime
    };
  }

  function renderLegend() {
    el.timelineLegend.innerHTML = getAllEventTypes().map((t) => {
      const cls = t.isCustom ? "" : `swatch--${t.id}`;
      const style = t.isCustom ? `style="background:${t.color};box-shadow:0 0 8px ${t.color}66"` : "";
      return `<span class="legend__item"><span class="swatch ${cls}" ${style}></span>${escapeHtml(t.label)}</span>`;
    }).join("");
  }

  function renderTimeline() {
    renderLegend();
    const nowParts = getNowParts();
    const active = getActiveShiftInfo(nowParts);
    const shift = SHIFTS[state.selectedShift];
    const info = computeShiftBreakdown(state.selectedDate, state.selectedShift, nowParts);

    // Update Shift Tabs
    el.shiftTabs.forEach((tab) => {
      const id = Number(tab.dataset.shift);
      tab.classList.toggle("is-active", id === state.selectedShift);
      tab.classList.toggle("is-current-shift", state.selectedDate === active.opDateKey && id === active.shiftId);
      tab.setAttribute("aria-selected", String(id === state.selectedShift));
    });

    // Update Header & KPIs
    const dateReadable = formatDateReadable(state.selectedDate);
    el.timelineContextKicker.textContent = info.isLiveShift
      ? `(→) LIVE SHIFT TIMELINE · ${dateReadable}`
      : info.isFuture
        ? `(→) UPCOMING SHIFT · ${dateReadable}`
        : `(→) HISTORICAL SHIFT RECORD · ${dateReadable}`;

    el.timelineTitle.textContent = `${shift.name} · ${shift.label}`;
    el.kpiWorking.textContent = formatDuration(info.workMins);
    el.kpiError.textContent = formatDuration(info.errorMins);
    el.kpiLunch.textContent = formatDuration(info.lunchMins);
    el.kpiUptime.textContent = `${info.uptime}%`;

    // Hour Labels & Ticks (0..8 hours)
    el.timelineHours.innerHTML = shift.hours.map((hr, idx) => {
      const leftPct = (idx / 8) * 100;
      return `<span class="timeline-hour-label" style="left:${leftPct}%">${hr}</span>`;
    }).join("");

    let ticksHtml = "";
    for (let i = 1; i < 16; i++) {
      const pct = (i / 16) * 100;
      const isHour = i % 2 === 0;
      ticksHtml += `<span class="timeline-tick ${isHour ? "" : "timeline-tick--sub"}" style="left:${pct}%"></span>`;
    }
    el.timelineTicks.innerHTML = ticksHtml;

    // Build visual segments:
    // 1. Base purple working bar from 0 to elapsedRel
    // 2. Explicit events layered cleanly on top (work / error / lunch / custom)
    const segments = [];
    if (info.elapsedRel > 0) {
      segments.push({
        id: null,
        type: "work",
        color: "#6d4aff",
        startRel: 0,
        endRel: info.elapsedRel,
        startStr: shift.hours[0],
        endStr: relMinToTimeStr(Math.round(info.elapsedRel), state.selectedShift),
        comment: "Production active (continuous operation)"
      });
    }

    info.events.forEach((ev) => {
      const s = toShiftRelMin(ev.start, state.selectedShift);
      const e = toShiftRelMin(ev.end, state.selectedShift);
      if (s === null || e === null || e <= s) return;
      const meta = getTypeMeta(ev.type, ev.customColor);
      segments.push({
        id: ev.id,
        type: ev.type,
        color: meta.color,
        isCustom: meta.isCustom,
        startRel: s,
        endRel: e,
        startStr: ev.start,
        endStr: ev.end,
        comment: ev.comment
      });
    });

    el.timelineSegments.innerHTML = segments.map((seg) => {
      const left = (seg.startRel / 480) * 100;
      const width = ((seg.endRel - seg.startRel) / 480) * 100;
      const dur = Math.round(seg.endRel - seg.startRel);
      const builtinCls = !seg.isCustom ? `tl-seg--${seg.type}` : "";
      const customStyle = seg.isCustom
        ? `background:linear-gradient(180deg, ${seg.color} 0%, ${seg.color}cc 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.3);z-index:2;`
        : "";
      return `<div
        class="tl-seg ${builtinCls}"
        style="left:${left}%;width:${Math.max(width, 0.35)}%;${customStyle}"
        data-seg-id="${escapeHtml(seg.id || "")}"
        data-seg-type="${escapeHtml(seg.type)}"
        data-seg-color="${escapeHtml(seg.color)}"
        data-seg-range="${escapeHtml(seg.startStr)} – ${escapeHtml(seg.endStr)}"
        data-seg-dur="${formatDuration(dur)}"
        data-seg-comment="${escapeHtml(seg.comment)}"
      ></div>`;
    }).join("");

    // Live NOW Cursor
    if (info.isLiveShift) {
      const pct = Math.max(0, Math.min(100, (info.elapsedRel / 480) * 100));
      el.timelineNowCursor.classList.remove("is-hidden");
      el.timelineNowCursor.style.left = `${pct}%`;
      el.timelineNowBadge.textContent = `NOW ${pad2(nowParts.hour)}:${pad2(nowParts.minute)}`;
    } else {
      el.timelineNowCursor.classList.add("is-hidden");
    }
  }

  // Timeline Hover Tooltip & Click Highlight
  el.timelineSegments.addEventListener("mousemove", (e) => {
    const seg = e.target.closest(".tl-seg");
    if (!seg) {
      el.timelineTooltip.classList.add("is-hidden");
      return;
    }
    const type = seg.dataset.segType;
    const meta = getTypeMeta(type, seg.dataset.segColor);
    const labelColor = type === "work" ? "#9d85ff" : meta.color;
    const trackRect = el.timelineTrack.getBoundingClientRect();
    const x = Math.max(110, Math.min(trackRect.width - 110, e.clientX - trackRect.left));

    el.timelineTooltip.style.left = `${x}px`;
    el.timelineTooltip.innerHTML = `
      <div class="timeline-tooltip__head">
        <span style="color:${escapeHtml(labelColor)};font-weight:700">${escapeHtml(meta.short)}</span>
        <span>${seg.dataset.segRange} (${seg.dataset.segDur})</span>
      </div>
      <div class="timeline-tooltip__msg">${escapeHtml(seg.dataset.segComment)}</div>
    `;
    el.timelineTooltip.classList.remove("is-hidden");
  });

  el.timelineSegments.addEventListener("mouseleave", () => {
    el.timelineTooltip.classList.add("is-hidden");
  });

  el.timelineSegments.addEventListener("click", (e) => {
    const seg = e.target.closest(".tl-seg");
    if (!seg || !seg.dataset.segId) return;
    document.querySelectorAll(".event-row").forEach((r) => r.classList.remove("is-highlighted"));
    const row = document.querySelector(`.event-row[data-event-id="${seg.dataset.segId}"]`);
    if (row) {
      row.classList.add("is-highlighted");
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  // === Render Shift Event List ===
  function renderEventList() {
    const events = getShiftEvents();
    el.logCountBadge.textContent = `${pad2(events.length)} ${events.length === 1 ? "ENTRY" : "ENTRIES"}`;

    if (events.length === 0) {
      el.eventList.innerHTML = "";
      el.emptyLogState.classList.remove("is-hidden");
      el.clearShiftBtn.disabled = true;
      return;
    }

    el.emptyLogState.classList.add("is-hidden");
    el.clearShiftBtn.disabled = false;

    el.eventList.innerHTML = events.map((ev) => {
      const s = toShiftRelMin(ev.start, state.selectedShift) ?? 0;
      const e = toShiftRelMin(ev.end, state.selectedShift) ?? 0;
      const dur = Math.max(0, e - s);
      const meta = getTypeMeta(ev.type, ev.customColor);
      const barCls = !meta.isCustom ? `event-row__bar--${ev.type}` : "";
      const barStyle = meta.isCustom ? `style="background:${escapeHtml(meta.color)}"` : "";
      const badgeCls = !meta.isCustom ? `event-row__badge--${ev.type}` : "";
      const badgeStyle = meta.isCustom
        ? `style="background:${escapeHtml(meta.color)};border-color:${escapeHtml(meta.color)};color:${getContrastText(meta.color)};font-weight:700"`
        : "";
      return `
        <article class="event-row" data-event-id="${escapeHtml(ev.id)}" role="listitem">
          <span class="event-row__bar ${barCls}" ${barStyle} aria-hidden="true"></span>
          <div class="event-row__time">
            <span class="event-row__range">${escapeHtml(ev.start)} – ${escapeHtml(ev.end)}</span>
            <span class="event-row__dur">${formatDuration(dur)}</span>
          </div>
          <div class="event-row__body">
            <span class="event-row__badge ${badgeCls}" ${badgeStyle}>${escapeHtml(meta.label)}</span>
            <span class="event-row__comment">${escapeHtml(ev.comment)}</span>
          </div>
          <div class="event-row__actions">
            <button class="row-action-btn hover-sound" type="button" data-edit-id="${escapeHtml(ev.id)}">EDIT</button>
            <button class="row-action-btn row-action-btn--del hover-sound" type="button" data-delete-id="${escapeHtml(ev.id)}">DEL</button>
          </div>
        </article>
      `;
    }).join("");
  }

  // === Interactive Full Clock System (24H + 60 Minutes) ===
  function renderClockStaticTicks() {
    let ticks = "";
    for (let i = 0; i < 60; i++) {
      const ang = (i * 6 - 90) * (Math.PI / 180);
      const isMajor = i % 5 === 0;
      const r1 = isMajor ? 102 : 106;
      const r2 = 111;
      const x1 = 120 + r1 * Math.cos(ang);
      const y1 = 120 + r1 * Math.sin(ang);
      const x2 = 120 + r2 * Math.cos(ang);
      const y2 = 120 + r2 * Math.sin(ang);
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="clock-tick ${isMajor ? "clock-tick--major" : ""}" />`;
    }
    el.clockTicksLayer.innerHTML = ticks;
  }

  function getActiveTimeStr() {
    return state.clockTarget === "start" ? state.startTime : state.endTime;
  }

  function setActiveTimeStr(val) {
    if (state.clockTarget === "start") {
      state.startTime = val;
      el.startTimeInput.value = val;
    } else {
      state.endTime = val;
      el.endTimeInput.value = val;
    }
    updateIntervalPreview();
    renderClockDial();
  }

  function renderClockDial() {
    const parsed = parseTimeStr(getActiveTimeStr()) || { h: 17, min: 30 };
    el.clockTargetLabel.textContent = `EDITING: ${state.clockTarget === "start" ? "START TIME" : "END TIME"} (${pad2(parsed.h)}:${pad2(parsed.min)})`;
    el.clockModeHour.classList.toggle("is-active", state.clockMode === "hour");
    el.clockModeMin.classList.toggle("is-active", state.clockMode === "min");
    el.startTimeCard.classList.toggle("is-focused", state.clockTarget === "start");
    el.endTimeCard.classList.toggle("is-focused", state.clockTarget === "end");

    let labels = "";
    let handRadius = 88;
    let angleDeg = 0;

    if (state.clockMode === "hour") {
      // Outer ring 00-11, Inner ring 12-23
      for (let h = 0; h < 12; h++) {
        const ang = (h * 30 - 90) * (Math.PI / 180);
        const x = 120 + 88 * Math.cos(ang);
        const y = 120 + 88 * Math.sin(ang);
        labels += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="clock-label ${parsed.h === h ? "is-selected" : ""}">${pad2(h)}</text>`;
      }
      for (let h = 12; h < 24; h++) {
        const ang = ((h - 12) * 30 - 90) * (Math.PI / 180);
        const x = 120 + 57 * Math.cos(ang);
        const y = 120 + 57 * Math.sin(ang);
        labels += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="clock-label is-inner ${parsed.h === h ? "is-selected" : ""}">${pad2(h)}</text>`;
      }
      handRadius = parsed.h >= 12 ? 57 : 88;
      angleDeg = (parsed.h % 12) * 30 - 90;
      el.clockReadout.textContent = "SELECT HOUR (OUTER 00–11 · INNER 12–23)";
    } else {
      // Minute mode: 00..59 with 5-minute labels
      for (let m = 0; m < 60; m += 5) {
        const ang = (m * 6 - 90) * (Math.PI / 180);
        const x = 120 + 86 * Math.cos(ang);
        const y = 120 + 86 * Math.sin(ang);
        labels += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="clock-label ${parsed.min === m ? "is-selected" : ""}">${pad2(m)}</text>`;
      }
      handRadius = 86;
      angleDeg = parsed.min * 6 - 90;
      el.clockReadout.textContent = `EXACT MINUTE: :${pad2(parsed.min)} (DRAG FOR 00–59)`;
    }

    el.clockLabelsLayer.innerHTML = labels;
    const rad = angleDeg * (Math.PI / 180);
    const kx = 120 + handRadius * Math.cos(rad);
    const ky = 120 + handRadius * Math.sin(rad);
    el.clockHand.setAttribute("x2", kx.toFixed(1));
    el.clockHand.setAttribute("y2", ky.toFixed(1));
    el.clockKnob.setAttribute("cx", kx.toFixed(1));
    el.clockKnob.setAttribute("cy", ky.toFixed(1));
  }

  function handleClockPointer(clientX, clientY, commitHourSwitch = false) {
    const rect = el.clockSvg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy) * (240 / rect.width);

    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    const current = parseTimeStr(getActiveTimeStr()) || { h: 17, min: 30 };

    if (state.clockMode === "hour") {
      const slot = Math.round(deg / 30) % 12;
      const isInner = dist < 72;
      const newHour = isInner ? slot + 12 : slot;
      setActiveTimeStr(`${pad2(newHour)}:${pad2(current.min)}`);
      if (commitHourSwitch) {
        state.clockMode = "min";
        renderClockDial();
      }
    } else {
      const newMin = Math.round(deg / 6) % 60;
      setActiveTimeStr(`${pad2(current.h)}:${pad2(newMin)}`);
    }
  }

  let clockDragging = false;
  el.clockSvg.addEventListener("pointerdown", (e) => {
    clockDragging = true;
    el.clockSvg.setPointerCapture(e.pointerId);
    handleClockPointer(e.clientX, e.clientY, false);
  });
  el.clockSvg.addEventListener("pointermove", (e) => {
    if (!clockDragging) return;
    handleClockPointer(e.clientX, e.clientY, false);
  });
  el.clockSvg.addEventListener("pointerup", (e) => {
    if (!clockDragging) return;
    clockDragging = false;
    handleClockPointer(e.clientX, e.clientY, state.clockMode === "hour");
  });

  el.clockModeHour.addEventListener("click", () => {
    state.clockMode = "hour";
    renderClockDial();
  });
  el.clockModeMin.addEventListener("click", () => {
    state.clockMode = "min";
    renderClockDial();
  });

  document.querySelectorAll("[data-focus-clock]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.clockTarget = btn.dataset.focusClock;
      state.clockMode = "hour";
      renderClockDial();
    });
  });

  function updateIntervalPreview() {
    const sRel = toShiftRelMin(state.startTime, state.selectedShift);
    const eRel = toShiftRelMin(state.endTime, state.selectedShift);
    if (sRel === null || eRel === null || eRel <= sRel) {
      el.intervalSummary.textContent = `${state.startTime} → ${state.endTime} (OUT OF SHIFT / INVALID)`;
      el.intervalSummary.style.color = "#fca5a5";
    } else {
      el.intervalSummary.textContent = `${state.startTime} → ${state.endTime} (${formatDuration(eRel - sRel)})`;
      el.intervalSummary.style.color = "";
    }
  }

  // Time Input typing & nudging
  function bindTimeInput(inputEl, target) {
    inputEl.addEventListener("focus", () => {
      state.clockTarget = target;
      renderClockDial();
    });
    inputEl.addEventListener("input", () => {
      const val = inputEl.value.trim();
      if (target === "start") state.startTime = val;
      else state.endTime = val;
      updateIntervalPreview();
      if (parseTimeStr(val)) renderClockDial();
    });
  }
  bindTimeInput(el.startTimeInput, "start");
  bindTimeInput(el.endTimeInput, "end");

  document.querySelectorAll("[data-nudge]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [target, deltaStr] = btn.dataset.nudge.split(":");
      const delta = Number(deltaStr);
      state.clockTarget = target;
      const curStr = target === "start" ? state.startTime : state.endTime;
      const rel = toShiftRelMin(curStr, state.selectedShift);
      if (rel === null) return;
      const nextRel = Math.max(0, Math.min(480, rel + delta));
      setActiveTimeStr(relMinToTimeStr(nextRel, state.selectedShift));
    });
  });

  // === Category Selector & 12-Color Triadic Palette ===
  function renderStatusSelector() {
    const types = getAllEventTypes();
    if (!types.some((t) => t.id === state.selectedEventType)) {
      state.selectedEventType = "error";
    }

    el.statusSelector.innerHTML = types.map((t) => {
      const isSelected = state.selectedEventType === t.id;
      const cls = !t.isCustom ? `status-option--${t.id}` : "";
      const borderStyle = isSelected && t.isCustom ? `style="border-color:${escapeHtml(t.color)}"` : "";
      const swatchCls = !t.isCustom ? `swatch--${t.id}` : "";
      const swatchStyle = t.isCustom ? `style="background:${escapeHtml(t.color)};box-shadow:0 0 8px ${escapeHtml(t.color)}66"` : "";

      return `
        <label class="status-option ${cls} ${isSelected ? "is-selected" : ""} hover-sound" ${borderStyle}>
          <input type="radio" name="eventType" value="${escapeHtml(t.id)}" ${isSelected ? "checked" : ""} />
          <span class="status-option__main">
            <span class="swatch ${swatchCls}" ${swatchStyle}></span>
            <span class="status-option__label">${escapeHtml(t.label)}</span>
          </span>
          ${t.isCustom ? `<button class="status-option__remove hover-sound" type="button" data-remove-type="${escapeHtml(t.id)}" aria-label="Delete ${escapeHtml(t.label)}">×</button>` : ""}
        </label>
      `;
    }).join("");
  }

  function renderTriadicPalette() {
    const activeSwatch = TRIADIC_PALETTE.find((c) => c.hex === state.selectedPaletteColor) || TRIADIC_PALETTE[0];
    el.selectedColorHex.textContent = `${activeSwatch.hex.toUpperCase()} · ${activeSwatch.name}`;

    el.triadicPaletteGrid.innerHTML = TRIADIC_PALETTE.map((c) => {
      const selected = c.hex === state.selectedPaletteColor;
      return `
        <button
          class="triad-swatch hover-sound ${selected ? "is-selected" : ""}"
          type="button"
          data-palette-hex="${c.hex}"
          data-pole="${c.pole}"
          style="background:${c.hex}"
          title="${c.name} (${c.hex})"
          aria-label="${c.name}"
          aria-pressed="${String(selected)}"
        ></button>
      `;
    }).join("");
  }

  function setCustomDrawerOpen(open) {
    state.customDrawerOpen = open;
    el.customOptionDrawer.classList.toggle("is-hidden", !open);
    el.toggleCustomOptionBtn.setAttribute("aria-expanded", String(open));
    el.customOptionError.classList.add("is-hidden");
    if (open) {
      renderTriadicPalette();
      el.customTypeName.focus();
    }
  }

  el.toggleCustomOptionBtn.addEventListener("click", () => {
    setCustomDrawerOpen(!state.customDrawerOpen);
  });

  el.cancelCustomOptionBtn.addEventListener("click", () => {
    el.customTypeName.value = "";
    setCustomDrawerOpen(false);
  });

  el.triadicPaletteGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-palette-hex]");
    if (!btn) return;
    state.selectedPaletteColor = btn.dataset.paletteHex;
    renderTriadicPalette();
  });

  el.saveCustomOptionBtn.addEventListener("click", () => {
    const rawName = el.customTypeName.value.trim();
    if (!rawName) {
      el.customOptionError.textContent = "Enter a name for the new event option.";
      el.customOptionError.classList.remove("is-hidden");
      el.customTypeName.focus();
      return;
    }

    const label = rawName.toUpperCase();
    const newType = {
      id: `custom-${Date.now()}`,
      label,
      short: label.length > 16 ? label.slice(0, 16) : label,
      color: state.selectedPaletteColor,
      isCustom: true
    };

    state.customTypes.push(newType);
    saveCustomTypes(state.customTypes);
    state.selectedEventType = newType.id;
    el.customTypeName.value = "";
    setCustomDrawerOpen(false);
    renderStatusSelector();
    renderLegend();
    showToast(`ADDED OPTION: ${label}`);
  });

  el.statusSelector.addEventListener("click", (e) => {
    const remBtn = e.target.closest("[data-remove-type]");
    if (remBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = remBtn.dataset.removeType;
      state.customTypes = state.customTypes.filter((t) => t.id !== id);
      saveCustomTypes(state.customTypes);
      if (state.selectedEventType === id) state.selectedEventType = "error";
      renderStatusSelector();
      renderLegend();
      showToast("CUSTOM OPTION REMOVED");
    }
  });

  el.statusSelector.addEventListener("change", (e) => {
    if (e.target.name === "eventType") {
      state.selectedEventType = e.target.value;
      renderStatusSelector();
    }
  });

  document.querySelectorAll("[data-preset-text]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedEventType = btn.dataset.presetType;
      renderStatusSelector();
      el.eventComment.value = btn.dataset.presetText;
      el.formError.classList.add("is-hidden");
    });
  });

  function resetFormToNew() {
    state.editingId = null;
    el.formModeBadge.textContent = "NEW ENTRY";
    el.submitEventLabel.textContent = "ADD TO TIMELINE";
    el.cancelEditBtn.classList.add("is-hidden");
    el.formError.classList.add("is-hidden");
    el.eventComment.value = "";
    const def = SHIFTS[state.selectedShift];
    state.startTime = def.defaultStart;
    state.endTime = def.defaultEnd;
    el.startTimeInput.value = state.startTime;
    el.endTimeInput.value = state.endTime;
    updateIntervalPreview();
    renderClockDial();
  }

  el.cancelEditBtn.addEventListener("click", resetFormToNew);

  el.eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const shift = SHIFTS[state.selectedShift];
    const sRel = toShiftRelMin(el.startTimeInput.value, state.selectedShift);
    const eRel = toShiftRelMin(el.endTimeInput.value, state.selectedShift);
    const comment = el.eventComment.value.trim();
    const type = state.selectedEventType || "error";
    const meta = getTypeMeta(type);

    if (sRel === null || eRel === null) {
      el.formError.textContent = `Both times must be within ${shift.name} (${shift.label}).`;
      el.formError.classList.remove("is-hidden");
      return;
    }
    if (eRel <= sRel) {
      el.formError.textContent = "End time must be after start time within the shift.";
      el.formError.classList.remove("is-hidden");
      return;
    }
    if (!comment) {
      el.formError.textContent = "Please enter a short comment describing what happened.";
      el.formError.classList.remove("is-hidden");
      el.eventComment.focus();
      return;
    }

    el.formError.classList.add("is-hidden");
    const normStart = relMinToTimeStr(sRel, state.selectedShift);
    const normEnd = relMinToTimeStr(eRel, state.selectedShift);

    const events = getShiftEvents();
    const payload = {
      type,
      customColor: meta.isCustom ? meta.color : undefined,
      start: normStart,
      end: normEnd,
      comment
    };

    if (state.editingId) {
      const idx = events.findIndex((x) => x.id === state.editingId);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...payload };
      }
      showToast("SHIFT ENTRY UPDATED");
    } else {
      events.push({
        id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...payload
      });
      showToast(`${meta.short} LOGGED (${normStart}–${normEnd})`);
    }

    setShiftEvents(state.selectedDate, state.selectedShift, events);
    resetFormToNew();
    renderAll();
  });

  // Event List Edit / Delete / Clear
  el.eventList.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit-id]");
    if (editBtn) {
      const ev = getShiftEvents().find((x) => x.id === editBtn.dataset.editId);
      if (!ev) return;
      state.editingId = ev.id;
      el.formModeBadge.textContent = "EDITING ENTRY";
      el.submitEventLabel.textContent = "SAVE CHANGES";
      el.cancelEditBtn.classList.remove("is-hidden");
      state.selectedEventType = ev.type;
      renderStatusSelector();
      state.startTime = ev.start;
      state.endTime = ev.end;
      el.startTimeInput.value = ev.start;
      el.endTimeInput.value = ev.end;
      el.eventComment.value = ev.comment;
      updateIntervalPreview();
      renderClockDial();
      el.eventForm.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const delBtn = e.target.closest("[data-delete-id]");
    if (delBtn) {
      const id = delBtn.dataset.deleteId;
      const updated = getShiftEvents().filter((x) => x.id !== id);
      setShiftEvents(state.selectedDate, state.selectedShift, updated);
      if (state.editingId === id) resetFormToNew();
      renderAll();
      showToast("ENTRY REMOVED");
    }
  });

  el.clearShiftBtn.addEventListener("click", () => {
    setShiftEvents(state.selectedDate, state.selectedShift, []);
    resetFormToNew();
    renderAll();
    showToast("SHIFT LOG CLEARED");
  });

  // === History Calendar ===
  function renderCalendar() {
    const nowParts = getNowParts();
    const todayKey = getActiveShiftInfo(nowParts).opDateKey;
    const y = state.calendarYear;
    const m = state.calendarMonth;

    const monthName = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(Date.UTC(y, m, 1))).toUpperCase();
    el.calendarMonthTitle.textContent = monthName;

    const firstDay = new Date(Date.UTC(y, m, 1));
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const startWeekday = (firstDay.getUTCDay() + 6) % 7; // Monday = 0

    let cells = "";
    for (let i = 0; i < startWeekday; i++) {
      cells += `<div class="cal-day cal-day--pad" aria-hidden="true"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${y}-${pad2(m + 1)}-${pad2(d)}`;
      const isFuture = dateKey > todayKey;
      const isToday = dateKey === todayKey;
      const isSelected = dateKey === state.selectedDate;

      const dayEvents = [1, 2, 3].flatMap((sid) => getShiftEvents(dateKey, sid));
      const hasError = dayEvents.some((ev) => ev.type === "error");
      const hasLunch = dayEvents.some((ev) => ev.type === "lunch");
      const hasWork = dayEvents.some((ev) => ev.type === "work") || (!isFuture && dateKey <= todayKey);

      let dots = "";
      if (!isFuture) {
        if (hasWork) dots += `<span class="cal-dot cal-dot--work"></span>`;
        if (hasError) dots += `<span class="cal-dot cal-dot--error"></span>`;
        if (hasLunch) dots += `<span class="cal-dot cal-dot--lunch"></span>`;
      }

      cells += `
        <button
          class="cal-day hover-sound ${isFuture ? "is-future" : ""} ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}"
          type="button"
          data-cal-date="${dateKey}"
          ${isFuture ? "disabled" : ""}
        >
          <span class="cal-day__num">${pad2(d)}</span>
          <span class="cal-day__dots">${dots}</span>
        </button>
      `;
    }

    el.calendarGrid.innerHTML = cells;
    renderDayMiniSummary(nowParts);
  }

  function renderDayMiniSummary(nowParts) {
    const rows = [1, 2, 3].map((sid) => {
      const info = computeShiftBreakdown(state.selectedDate, sid, nowParts);
      const count = info.events.length;
      return `
        <button class="cal-shift-mini hover-sound ${state.selectedShift === sid ? "is-active" : ""}" type="button" data-cal-shift="${sid}">
          <span class="cal-shift-mini__left">
            <strong class="cal-shift-mini__name">${SHIFTS[sid].name}</strong>
            <span class="cal-shift-mini__hours mono">${SHIFTS[sid].label}</span>
          </span>
          <span class="cal-shift-mini__stats mono">${count} ${count === 1 ? "LOG" : "LOGS"} · ${info.uptime}%</span>
        </button>
      `;
    }).join("");

    el.calDaySummary.innerHTML = `
      <span class="cal-summary-title">DAY BREAKDOWN · ${formatDateReadable(state.selectedDate)}</span>
      ${rows}
    `;
  }

  el.calendarGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cal-date]");
    if (!btn || btn.disabled) return;
    state.selectedDate = btn.dataset.calDate;
    resetFormToNew();
    renderAll();
  });

  el.calDaySummary.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cal-shift]");
    if (!btn) return;
    state.selectedShift = Number(btn.dataset.calShift);
    resetFormToNew();
    renderAll();
  });

  el.calPrevBtn.addEventListener("click", () => {
    state.calendarMonth -= 1;
    if (state.calendarMonth < 0) {
      state.calendarMonth = 11;
      state.calendarYear -= 1;
    }
    renderCalendar();
  });

  el.calNextBtn.addEventListener("click", () => {
    state.calendarMonth += 1;
    if (state.calendarMonth > 11) {
      state.calendarMonth = 0;
      state.calendarYear += 1;
    }
    renderCalendar();
  });

  // === Shift Tabs & Live Controls ===
  el.shiftTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.selectedShift = Number(tab.dataset.shift);
      resetFormToNew();
      renderAll();
    });
  });

  el.jumpLiveBtn.addEventListener("click", () => {
    const active = getActiveShiftInfo(getNowParts());
    state.selectedDate = active.opDateKey;
    state.selectedShift = active.shiftId;
    state.calendarYear = Number(active.opDateKey.split("-")[0]);
    state.calendarMonth = Number(active.opDateKey.split("-")[1]) - 1;
    resetFormToNew();
    renderAll();
    showToast(`JUMPED TO LIVE ${SHIFTS[active.shiftId].name}`);
  });

  el.soundToggleBtn.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    el.soundToggleBtn.textContent = `SFX: ${state.soundEnabled ? "ON" : "OFF"}`;
    el.soundToggleBtn.setAttribute("aria-pressed", String(state.soundEnabled));
  });

  // === Live Clock Loop (Realistic Current Time) ===
  function tickLiveClock() {
    const now = getNowParts();
    const active = getActiveShiftInfo(now);

    el.liveClockSeconds.textContent = `${pad2(now.hour)}:${pad2(now.minute)}:${pad2(now.second)}`;
    el.liveDateLabel.textContent = `${now.weekday} ${pad2(now.day)}.${pad2(now.month)}.${now.year}`;
    el.liveShiftBanner.textContent = `LIVE ${SHIFTS[active.shiftId].name} (${SHIFTS[active.shiftId].label})`;

    const isViewingLive = state.selectedDate === active.opDateKey && state.selectedShift === active.shiftId;
    el.jumpLiveBtn.classList.toggle("is-live", isViewingLive);

    if (isViewingLive && now.second === 0) {
      renderTimeline();
    } else if (isViewingLive) {
      const pct = Math.max(0, Math.min(100, (active.relMin / 480) * 100));
      el.timelineNowCursor.style.left = `${pct}%`;
      el.timelineNowBadge.textContent = `NOW ${pad2(now.hour)}:${pad2(now.minute)}`;
    }
  }

  function renderAll() {
    renderTimeline();
    renderEventList();
    renderCalendar();
  }

  // === Initialize ===
  renderClockStaticTicks();
  renderStatusSelector();
  renderTriadicPalette();
  resetFormToNew();
  tickLiveClock();
  renderAll();
  setInterval(tickLiveClock, 1000);
})();
