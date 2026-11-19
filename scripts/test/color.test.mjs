import { test } from "node:test";
import assert from "node:assert/strict";
import Color from "colorjs.io";
import {
  parseColor,
  wcagRatio,
  apcaLc,
  evaluatePair,
  formatRatio,
  isLargeText,
  composite,
} from "../lib/color.mjs";

// colorjs.io is a widely used, independent implementation. It is the test oracle here.
function oracleWcag(a, b) {
  return new Color(a).contrast(new Color(b), "WCAG21");
}
function oracleApca(text, bg) {
  // colorjs.io: background.contrast(text, "APCA")
  return new Color(bg).contrast(new Color(text), "APCA");
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function randomHex(rand) {
  return "#" + Array.from({ length: 3 }, () => Math.floor(rand() * 256).toString(16).padStart(2, "0")).join("");
}

test("parses hex, rgb, rgba, hsl and keywords", () => {
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor("#11223380"), { r: 17, g: 34, b: 51, a: 128 / 255 });
  assert.deepEqual(parseColor("rgb(15, 17, 19)"), { r: 15, g: 17, b: 19, a: 1 });
  assert.deepEqual(parseColor("rgba(15, 17, 19, 0.5)"), { r: 15, g: 17, b: 19, a: 0.5 });
  assert.deepEqual(parseColor("rgb(15 17 19 / 50%)"), { r: 15, g: 17, b: 19, a: 0.5 });
  const red = parseColor("hsl(0, 100%, 50%)");
  assert.equal(Math.round(red.r), 255);
  assert.equal(Math.round(red.g), 0);
  assert.equal(parseColor("transparent").a, 0);
});

test("rejects unreadable colors with a clear message", () => {
  assert.throws(() => parseColor("#12"), /Cannot read hex color/);
  assert.throws(() => parseColor("oklch(0.5 0.1 200)"), /Use hex/);
  assert.throws(() => parseColor(42), /must be a string/);
});

test("WCAG ratio matches known values", () => {
  assert.equal(wcagRatio(parseColor("#000"), parseColor("#fff")), 21);
  assert.equal(wcagRatio(parseColor("#fff"), parseColor("#fff")), 1);
  // #777 on white is a well-known near miss for 4.5:1.
  assert.equal(formatRatio(wcagRatio(parseColor("#777"), parseColor("#fff"))), "4.47");
});

test("WCAG ratio matches colorjs.io on 500 random pairs", () => {
  // We use the coefficients written in WCAG (0.2126, 0.7152, 0.0722). colorjs.io
  // uses the more precise sRGB matrix (0.2126729, ...), so results differ slightly.
  // The difference must stay below 0.001, far below the 0.01 shown in reports.
  const rand = seededRandom(7);
  for (let i = 0; i < 500; i++) {
    const a = randomHex(rand);
    const b = randomHex(rand);
    const ours = wcagRatio(parseColor(a), parseColor(b));
    const theirs = oracleWcag(a, b);
    assert.ok(Math.abs(ours - theirs) < 1e-3, `${a} vs ${b}: ${ours} != ${theirs}`);
  }
});

test("APCA Lc matches colorjs.io on 500 random pairs", () => {
  const rand = seededRandom(11);
  for (let i = 0; i < 500; i++) {
    const text = randomHex(rand);
    const bg = randomHex(rand);
    const ours = apcaLc(parseColor(text), parseColor(bg));
    const theirs = oracleApca(text, bg);
    assert.ok(Math.abs(ours - theirs) < 1e-6, `${text} on ${bg}: ${ours} != ${theirs}`);
  }
});

test("APCA sign: dark on light is positive, light on dark is negative", () => {
  assert.ok(apcaLc(parseColor("#000"), parseColor("#fff")) > 100);
  assert.ok(apcaLc(parseColor("#fff"), parseColor("#000")) < -100);
});

test("formatRatio never rounds a failure up into a pass", () => {
  assert.equal(formatRatio(4.4999), "4.49");
  assert.equal(formatRatio(4.5), "4.50");
});

test("evaluatePair applies the right threshold per kind", () => {
  const grey = "#949494"; // about 3.0:1 on white
  assert.equal(evaluatePair(grey, "#fff", { kind: "text" }).passAA, false);
  const ui = evaluatePair(grey, "#fff", { kind: "ui" });
  assert.equal(ui.requiredAA, 3);
  assert.equal(ui.passAAA, null);
  assert.throws(() => evaluatePair("#000", "#fff", { kind: "huge" }), /Unknown kind/);
});

test("translucent colors are composited before measuring", () => {
  const r = evaluatePair("rgba(0, 0, 0, 0.5)", "#ffffff");
  assert.equal(r.composited, true);
  assert.equal(r.resolvedForeground, "#808080");
  assert.throws(() => composite(parseColor("#000"), parseColor("rgba(0,0,0,0.5)")), /opaque/);
});

test("large text rule follows WCAG sizes", () => {
  assert.equal(isLargeText(24), true);
  assert.equal(isLargeText(18.66, 700), true);
  assert.equal(isLargeText(18.66, 400), false);
  assert.equal(isLargeText(16, 700), false);
});
