// uxg ab-test: read an A/B test result, or plan the sample size for one.

import { parseArgs } from "node:util";
import {
  newcombeInterval,
  pct,
  sampleRatioMismatch,
  sampleSizePerArm,
  twoProportionTest,
  wilsonInterval,
  SRM_THRESHOLD,
} from "../lib/stats.mjs";

export const help = `Usage:
  uxg ab-test --control <users>,<conversions> --variant <users>,<conversions> [options]
  uxg ab-test --plan --baseline <rate> --mde <change> [--relative] [options]

Result mode checks the sample ratio first, then reports both rates with
Wilson intervals, the difference with a Newcombe interval, the relative
lift and a two-sided two-proportion z-test.

Plan mode gives the users needed per arm to detect the change.

Options:
  --split <share>        Planned share of users in control. Default: 0.5.
  --confidence <level>   Confidence level for intervals. Default: 0.95.
  --alpha <a>            Plan mode: significance level. Default: 0.05.
  --power <p>            Plan mode: power. Default: 0.8.
  --relative             Plan mode: --mde is relative (0.1 = +10%), not absolute.
  --json                 Print JSON.

Exit codes: 0 done, 1 sample ratio mismatch found, 2 usage error.

Examples:
  uxg ab-test --control 10000,520 --variant 10050,580
  uxg ab-test --plan --baseline 0.052 --mde 0.1 --relative`;

export function run(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      control: { type: "string" },
      variant: { type: "string" },
      split: { type: "string", default: "0.5" },
      confidence: { type: "string", default: "0.95" },
      plan: { type: "boolean", default: false },
      baseline: { type: "string" },
      mde: { type: "string" },
      relative: { type: "boolean", default: false },
      alpha: { type: "string", default: "0.05" },
      power: { type: "string", default: "0.8" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };

  if (values.plan) {
    const baseline = rate(values.baseline, "--baseline");
    const mde = num(values.mde, "--mde");
    const target = values.relative ? baseline * (1 + mde) : baseline + mde;
    if (!(target > 0 && target < 1)) throw usage(`The target rate ${target} is outside 0..1.`);
    const alpha = rate(values.alpha, "--alpha");
    const power = rate(values.power, "--power");
    const perArm = sampleSizePerArm(baseline, target, { alpha, power });
    const out = { baseline, target, alpha, power, perArm, total: perArm * 2 };
    if (values.json) return { output: JSON.stringify(out, null, 2), code: 0 };
    return {
      output: [
        `Baseline ${pct(baseline, 2)} -> target ${pct(target, 2)} (${values.relative ? "relative" : "absolute"} change).`,
        `Users needed per arm: ${perArm.toLocaleString("en-US")} (total ${out.total.toLocaleString("en-US")}),`,
        `for a two-sided test at alpha ${alpha} with power ${power}.`,
        `Run for whole weeks to cover weekday and weekend behavior, and decide the stop date before you start.`,
      ].join("\n"),
      code: 0,
    };
  }

  const [n1, x1] = pair(values.control, "--control");
  const [n2, x2] = pair(values.variant, "--variant");
  const split = rate(values.split, "--split");
  const confidence = rate(values.confidence, "--confidence");

  const srm = sampleRatioMismatch(n1, n2, split);
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const ci1 = wilsonInterval(x1, n1, confidence);
  const ci2 = wilsonInterval(x2, n2, confidence);
  const diff = newcombeInterval(x1, n1, x2, n2, confidence);
  const test = twoProportionTest(x1, n1, x2, n2);
  const lift = p1 === 0 ? null : (p2 - p1) / p1;
  const alpha = 1 - confidence;

  const result = {
    srm: { ...srm, threshold: SRM_THRESHOLD, expectedControlShare: split, observedControlShare: n1 / (n1 + n2) },
    control: { users: n1, conversions: x1, rate: p1, interval: ci1 },
    variant: { users: n2, conversions: x2, rate: p2, interval: ci2 },
    difference: { absolute: p2 - p1, interval: diff, relativeLift: lift },
    test: { ...test, confidence, significant: test.p < alpha },
  };
  const code = srm.mismatch ? 1 : 0;
  if (values.json) return { output: JSON.stringify(result, null, 2), code };

  const level = `${Math.round(confidence * 100)}%`;
  const lines = [];
  if (srm.mismatch) {
    lines.push(
      `STOP: sample ratio mismatch. Control has ${pct(n1 / (n1 + n2), 2)} of users, planned ${pct(split, 2)} ` +
        `(chi-square p = ${srm.p.toExponential(2)}, threshold ${SRM_THRESHOLD}).`,
      `Do not read the result below until assignment, logging and bot filtering are checked.`,
      ``,
    );
  } else {
    lines.push(`Sample ratio check: pass (p = ${srm.p.toFixed(3)}).`, ``);
  }
  lines.push(
    `| Arm | Users | Conversions | Rate | ${level} interval |`,
    `|---|---|---|---|---|`,
    `| Control | ${n1} | ${x1} | ${pct(p1, 2)} | ${pct(ci1.low, 2)} to ${pct(ci1.high, 2)} |`,
    `| Variant | ${n2} | ${x2} | ${pct(p2, 2)} | ${pct(ci2.low, 2)} to ${pct(ci2.high, 2)} |`,
    ``,
    `Difference: ${signed(p2 - p1)} points (${level} interval ${signed(diff.low)} to ${signed(diff.high)}).`,
    `Relative lift: ${lift === null ? "n/a (control rate is 0)" : signed(lift, 1) + "%"}.`,
    `Two-sided z-test: z = ${test.z.toFixed(2)}, p = ${test.p < 0.0001 ? test.p.toExponential(2) : test.p.toFixed(4)}. ` +
      (test.p < alpha
        ? `Significant at ${level} confidence.`
        : `Not significant at ${level} confidence: the interval includes no change.`),
    `Check before acting: was the stop date fixed in advance, did the test run whole weeks, and is a novelty effect possible?`,
  );
  return { output: lines.join("\n"), code };
}

function signed(x, digits = 2) {
  const v = (x * 100).toFixed(digits);
  return x > 0 ? `+${v}` : v;
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}

function num(v, flag) {
  const n = Number(v);
  if (v === undefined || Number.isNaN(n)) throw usage(`${flag} needs a number.`);
  return n;
}

function rate(v, flag) {
  const n = num(v, flag);
  if (!(n > 0 && n < 1)) throw usage(`${flag} must be between 0 and 1, got ${v}.`);
  return n;
}

function pair(v, flag) {
  if (!v) throw usage(`${flag} is required, as <users>,<conversions>.`);
  const [a, b] = v.split(",").map((s) => Number(s.trim()));
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b < 0 || b > a) {
    throw usage(`${flag} must be two whole numbers, users then conversions, with conversions <= users. Got "${v}".`);
  }
  return [a, b];
}
