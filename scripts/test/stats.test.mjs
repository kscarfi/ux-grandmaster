import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalCdf,
  normalQuantile,
  wilsonInterval,
  newcombeInterval,
  twoProportionTest,
  sampleRatioMismatch,
  sampleSizePerArm,
} from "../lib/stats.mjs";

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) < tol, `${msg ?? ""} ${a} != ${b}`);

test("normal CDF and quantile match published table values", () => {
  close(normalCdf(0), 0.5, 1e-7);
  close(normalCdf(1.96), 0.9750021, 1e-6);
  close(normalCdf(-1.645), 0.0499849, 1e-6);
  close(normalQuantile(0.975), 1.959964, 1e-6);
  close(normalQuantile(0.8), 0.8416212, 1e-6);
  close(normalQuantile(0.001), -3.090232, 1e-6);
  assert.throws(() => normalQuantile(1), /between 0 and 1/);
});

test("quantile inverts the CDF across the range", () => {
  for (const p of [0.0001, 0.01, 0.1, 0.3, 0.5, 0.7, 0.9, 0.99, 0.9999]) {
    close(normalCdf(normalQuantile(p)), p, 1e-6, `p=${p}`);
  }
});

test("Wilson interval matches Newcombe (1998) table I examples", () => {
  // 81 of 263: 0.2553 to 0.3662
  const a = wilsonInterval(81, 263);
  close(a.low, 0.2553, 5e-5);
  close(a.high, 0.3662, 5e-5);
  // 0 of 10: 0 to 0.2775
  const b = wilsonInterval(0, 10);
  close(b.low, 0, 1e-9);
  close(b.high, 0.2775, 5e-5);
});

test("Newcombe difference interval matches the published worked example", () => {
  // Newcombe (1998), example (a): 56/70 vs 48/80, method 10: 0.0524 to 0.3339
  const d = newcombeInterval(48, 80, 56, 70);
  close(d.low, 0.0524, 5e-5);
  close(d.high, 0.3339, 5e-5);
});

test("two-proportion z-test", () => {
  // Hand computation: pooled p = 1100/20000 = 0.055,
  // se = sqrt(0.055 * 0.945 * 2/10000) = 0.0032241, z = 0.01 / se = 3.1016.
  const t = twoProportionTest(500, 10000, 600, 10000);
  close(t.z, 3.1016, 1e-3);
  assert.ok(t.p < 0.01);
  assert.deepEqual(twoProportionTest(0, 10, 0, 10), { z: 0, p: 1 });
});

test("sample ratio mismatch flags a broken split and passes a normal one", () => {
  assert.equal(sampleRatioMismatch(50000, 50300).mismatch, false);
  const bad = sampleRatioMismatch(50000, 52000);
  assert.equal(bad.mismatch, true);
  close(bad.stat, 39.2157, 1e-3);
  assert.equal(sampleRatioMismatch(30000, 70000, 0.3).mismatch, false);
});

test("sample size follows the two-proportion formula", () => {
  // Hand computation with z(0.975) = 1.959964 and z(0.8) = 0.841621:
  // p1 = 0.05, p2 = 0.06, p-bar = 0.055 -> 8157.73, rounded up to 8158.
  assert.equal(sampleSizePerArm(0.05, 0.06), 8158);
  assert.throws(() => sampleSizePerArm(0.1, 0.1), /must differ/);
});
