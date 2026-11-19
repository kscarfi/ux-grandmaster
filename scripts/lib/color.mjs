// Color parsing, alpha compositing, WCAG 2.2 contrast and APCA lightness contrast.
// No dependencies. Every constant below is documented with its source.

/**
 * Parse a CSS color string into { r, g, b, a } with r, g, b in 0..255 and a in 0..1.
 * Supports #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() and hsl()/hsla(),
 * in comma or space syntax, plus the keywords black, white and transparent.
 * Throws an Error with a readable message for anything else.
 */
export function parseColor(input) {
  if (typeof input !== "string") throw new Error(`Color must be a string, got ${typeof input}`);
  const s = input.trim().toLowerCase();

  const keywords = {
    black: { r: 0, g: 0, b: 0, a: 1 },
    white: { r: 255, g: 255, b: 255, a: 1 },
    transparent: { r: 0, g: 0, b: 0, a: 0 },
  };
  if (s in keywords) return { ...keywords[s] };

  if (s.startsWith("#")) return parseHex(s, input);

  const fn = s.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (fn) {
    const parts = fn[2].replace(/\s*\/\s*/, " / ").split(/[\s,]+/).filter(Boolean);
    const slash = parts.indexOf("/");
    let alphaPart;
    let channels = parts;
    if (slash !== -1) {
      alphaPart = parts[slash + 1];
      channels = parts.slice(0, slash);
    } else if (parts.length === 4) {
      alphaPart = parts[3];
      channels = parts.slice(0, 3);
    }
    if (channels.length !== 3) throw new Error(`Cannot read color "${input}": expected 3 channels`);
    const a = alphaPart === undefined ? 1 : parseAlpha(alphaPart, input);

    if (fn[1].startsWith("rgb")) {
      const [r, g, b] = channels.map((c) => parseRgbChannel(c, input));
      return { r, g, b, a };
    }
    const h = parseFloat(channels[0]);
    const sat = parsePercent(channels[1], input);
    const light = parsePercent(channels[2], input);
    if (Number.isNaN(h)) throw new Error(`Cannot read hue in "${input}"`);
    return { ...hslToRgb(h, sat, light), a };
  }

  throw new Error(
    `Cannot read color "${input}". Use hex (#1a2b3c), rgb(), rgba(), hsl() or hsla().`,
  );
}

function parseHex(s, original) {
  const hex = s.slice(1);
  if (!/^[0-9a-f]+$/.test(hex) || ![3, 4, 6, 8].includes(hex.length)) {
    throw new Error(`Cannot read hex color "${original}"`);
  }
  const full = hex.length <= 4 ? [...hex].map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const a = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function parseRgbChannel(c, original) {
  if (c.endsWith("%")) return clamp((parseFloat(c) / 100) * 255, 0, 255);
  const v = parseFloat(c);
  if (Number.isNaN(v)) throw new Error(`Cannot read channel "${c}" in "${original}"`);
  return clamp(v, 0, 255);
}

function parseAlpha(c, original) {
  const v = c.endsWith("%") ? parseFloat(c) / 100 : parseFloat(c);
  if (Number.isNaN(v)) throw new Error(`Cannot read alpha "${c}" in "${original}"`);
  return clamp(v, 0, 1);
}

function parsePercent(c, original) {
  const v = parseFloat(c);
  if (Number.isNaN(v)) throw new Error(`Cannot read percentage "${c}" in "${original}"`);
  return clamp(v / 100, 0, 1);
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] =
    hue < 60 ? [c, x, 0] :
    hue < 120 ? [x, c, 0] :
    hue < 180 ? [0, c, x] :
    hue < 240 ? [0, x, c] :
    hue < 300 ? [x, 0, c] : [c, 0, x];
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/** Composite a color with alpha over an opaque backdrop (simple source-over in sRGB). */
export function composite(fg, backdrop) {
  if (backdrop.a < 1) {
    throw new Error("The backdrop must be opaque. Composite it over its own background first.");
  }
  const a = fg.a;
  return {
    r: fg.r * a + backdrop.r * (1 - a),
    g: fg.g * a + backdrop.g * (1 - a),
    b: fg.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

/** Format an opaque color as #rrggbb. */
export function toHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// WCAG 2.2 contrast ratio
// Source: WCAG 2.2, definitions of "relative luminance" and "contrast ratio"
// https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
// The linearization threshold 0.04045 is the value in the current sRGB definition
// that WCAG 2.2 links to (the older 0.03928 gives the same result for 8-bit colors).
// ---------------------------------------------------------------------------

const WCAG_LINEAR_THRESHOLD = 0.04045;
const WCAG_R = 0.2126;
const WCAG_G = 0.7152;
const WCAG_B = 0.0722;

/** WCAG relative luminance of an opaque color, 0..1. */
export function relativeLuminance({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255;
    return c <= WCAG_LINEAR_THRESHOLD ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return WCAG_R * lin(r) + WCAG_G * lin(g) + WCAG_B * lin(b);
}

/** WCAG contrast ratio between two opaque colors, 1..21. Order does not matter. */
export function wcagRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * WCAG 2.2 thresholds.
 * 1.4.3 Contrast (Minimum), AA: 4.5:1 for text, 3:1 for large text.
 * 1.4.6 Contrast (Enhanced), AAA: 7:1 for text, 4.5:1 for large text.
 * 1.4.11 Non-text Contrast, AA: 3:1 for UI components and graphical objects.
 * Large text: at least 18pt (24 CSS px), or at least 14pt (about 18.66 CSS px) and bold.
 */
export const WCAG_THRESHOLDS = {
  text: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
  ui: { AA: 3 },
};

/** Whether text of this size and weight counts as large text under WCAG. */
export function isLargeText(px, weight = 400) {
  if (px >= 24) return true;
  return weight >= 700 && px >= 18.66;
}

// ---------------------------------------------------------------------------
// APCA lightness contrast (Lc)
// Source: APCA-W3 0.0.98G-4g constants, published by Myndex Research in the
// apca-w3 reference implementation (https://github.com/Myndex/apca-w3).
// APCA is a candidate method for WCAG 3. It is informational here: WCAG 2.2
// is the pass bar. Output is signed: positive for dark text on a light
// background, negative for light text on a dark background.
// ---------------------------------------------------------------------------

const APCA = {
  mainTRC: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  deltaYmin: 0.0005,
  loClip: 0.1,
};

function apcaY({ r, g, b }) {
  return (
    APCA.sRco * (r / 255) ** APCA.mainTRC +
    APCA.sGco * (g / 255) ** APCA.mainTRC +
    APCA.sBco * (b / 255) ** APCA.mainTRC
  );
}

/** APCA Lc for text color on background color, both opaque. Roughly -108..106. */
export function apcaLc(text, background) {
  let yTxt = apcaY(text);
  let yBg = apcaY(background);
  const softClamp = (y) => (y > APCA.blkThrs ? y : y + (APCA.blkThrs - y) ** APCA.blkClmp);
  yTxt = softClamp(yTxt);
  yBg = softClamp(yBg);

  if (Math.abs(yBg - yTxt) < APCA.deltaYmin) return 0;

  let out;
  if (yBg > yTxt) {
    const sapc = (yBg ** APCA.normBG - yTxt ** APCA.normTXT) * APCA.scaleBoW;
    out = sapc < APCA.loClip ? 0 : sapc - APCA.loBoWoffset;
  } else {
    const sapc = (yBg ** APCA.revBG - yTxt ** APCA.revTXT) * APCA.scaleWoB;
    out = sapc > -APCA.loClip ? 0 : sapc + APCA.loWoBoffset;
  }
  return out * 100;
}

/**
 * Evaluate one foreground and background pair.
 * kind: "text" (normal text), "large" (large text) or "ui" (non-text: borders, icons, focus rings).
 * Background may not be translucent unless a backdrop is given.
 */
export function evaluatePair(fgInput, bgInput, { kind = "text", backdrop = "#ffffff" } = {}) {
  if (!WCAG_THRESHOLDS[kind]) throw new Error(`Unknown kind "${kind}". Use text, large or ui.`);
  const base = parseColor(backdrop);
  if (base.a < 1) throw new Error("The backdrop must be an opaque color.");
  let bg = parseColor(bgInput);
  const bgWasTranslucent = bg.a < 1;
  if (bgWasTranslucent) bg = composite(bg, base);
  let fg = parseColor(fgInput);
  const fgWasTranslucent = fg.a < 1;
  if (fgWasTranslucent) fg = composite(fg, bg);

  const ratio = wcagRatio(fg, bg);
  const thresholds = WCAG_THRESHOLDS[kind];
  return {
    foreground: fgInput,
    background: bgInput,
    kind,
    resolvedForeground: toHex(fg),
    resolvedBackground: toHex(bg),
    composited: fgWasTranslucent || bgWasTranslucent,
    ratio,
    passAA: ratio >= thresholds.AA,
    passAAA: thresholds.AAA === undefined ? null : ratio >= thresholds.AAA,
    requiredAA: thresholds.AA,
    apcaLc: apcaLc(fg, bg),
  };
}

/**
 * Format a ratio for display without ever rounding a failure up into a pass.
 * 4.4999 shows as 4.49, not 4.50.
 */
export function formatRatio(ratio) {
  return (Math.floor(ratio * 100) / 100).toFixed(2);
}
