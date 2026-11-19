// uxg funnel: step-by-step conversion from an event CSV, with segments.

import { parseArgs } from "node:util";
import { readCsv } from "../lib/csv.mjs";
import { pct, wilsonInterval } from "../lib/stats.mjs";

/** Segments with fewer users than this at a step are flagged as too small to read. */
export const MIN_SEGMENT_USERS = 30;

export const help = `Usage:
  uxg funnel <events.csv> --steps <step1,step2,...> [options]

Counts users who reach each step. A user reaches step k only after reaching
every earlier step. With --time, the steps must also happen in order.

Options:
  --user <column>      User id column. Default: user_id.
  --event <column>     Event name column. Default: event.
  --time <column>      Timestamp column. When set, steps must happen in order.
  --segment <column>   Break the funnel down by this column (device, country, ...).
  --focus <step>       Step to show segment intervals for. Default: the step
                       with the lowest step conversion.
  --json               Print JSON.

Segments with fewer than ${MIN_SEGMENT_USERS} users entering a step are flagged.

Example:
  uxg funnel events.csv --steps view_product,add_to_cart,checkout,paid --segment device`;

export function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      steps: { type: "string" },
      user: { type: "string", default: "user_id" },
      event: { type: "string", default: "event" },
      time: { type: "string" },
      segment: { type: "string" },
      focus: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };
  if (positionals.length !== 1) throw usage("Give one CSV file.");
  if (!values.steps) throw usage("--steps is required, as a comma-separated list in funnel order.");
  const steps = values.steps.split(",").map((s) => s.trim()).filter(Boolean);
  if (steps.length < 2) throw usage("A funnel needs at least two steps.");

  const required = [values.user, values.event, values.time, values.segment].filter(Boolean);
  const rows = readCsv(positionals[0], required);

  // Collect, per user, the earliest time of each step and their segment.
  const users = new Map();
  const segmentConflicts = new Set();
  for (const [i, r] of rows.entries()) {
    const id = r[values.user];
    if (!id) continue;
    let u = users.get(id);
    if (!u) {
      u = { first: new Map(), segment: values.segment ? r[values.segment] : null };
      users.set(id, u);
    } else if (values.segment && u.segment !== r[values.segment]) {
      segmentConflicts.add(id);
    }
    const step = r[values.event];
    if (!steps.includes(step)) continue;
    let t = 0;
    if (values.time) {
      t = Date.parse(r[values.time]);
      if (Number.isNaN(t)) throw new Error(`Row ${i + 2}: cannot read time "${r[values.time]}".`);
    }
    const prev = u.first.get(step);
    if (prev === undefined || t < prev) u.first.set(step, t);
  }

  const reached = (u) => {
    let k = 0;
    let last = -Infinity;
    for (const s of steps) {
      const t = u.first.get(s);
      if (t === undefined) break;
      if (values.time && t < last) break;
      last = t;
      k++;
    }
    return k;
  };

  const tally = (group) => {
    const counts = steps.map(() => 0);
    for (const u of group) {
      const k = reached(u);
      for (let i = 0; i < k; i++) counts[i]++;
    }
    return steps.map((s, i) => {
      const entered = i === 0 ? counts[0] : counts[i - 1];
      const ci = i === 0 ? null : wilsonInterval(counts[i], entered);
      return {
        step: s,
        users: counts[i],
        ofStart: counts[0] ? counts[i] / counts[0] : 0,
        stepConversion: i === 0 ? null : entered ? counts[i] / entered : 0,
        interval: ci,
        dropOff: i === 0 ? 0 : entered - counts[i],
        entered,
        small: i > 0 && entered < MIN_SEGMENT_USERS,
      };
    });
  };

  const all = tally(users.values());
  if (all[0].users === 0) {
    return { output: `No user reached the first step "${steps[0]}". Check --steps and --event.`, code: 1 };
  }
  // The step with the biggest absolute loss, and the one with the lowest rate.
  const worst = all.slice(1).reduce((a, b) => (b.dropOff > a.dropOff ? b : a));
  const lowest = all.slice(1).reduce((a, b) => (b.stepConversion < a.stepConversion ? b : a));
  let focus = lowest;
  if (values.focus) {
    if (!steps.slice(1).includes(values.focus)) throw usage(`--focus must be one of: ${steps.slice(1).join(", ")}.`);
    focus = all[steps.indexOf(values.focus)];
  }

  let segments = null;
  if (values.segment) {
    const groups = new Map();
    for (const u of users.values()) {
      const key = u.segment || "(blank)";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(u);
    }
    segments = [...groups.entries()]
      .map(([name, list]) => ({ name, steps: tally(list) }))
      .sort((a, b) => b.steps[0].users - a.steps[0].users);
  }

  const result = {
    users: users.size,
    steps: all,
    biggestDrop: { step: worst.step, lost: worst.dropOff, conversion: worst.stepConversion },
    lowestConversion: { step: lowest.step, conversion: lowest.stepConversion },
    focus: focus.step,
    segments,
    warnings: [
      ...(segmentConflicts.size
        ? [`${segmentConflicts.size} user(s) appear in more than one ${values.segment}; their first value was used.`]
        : []),
      ...(values.time ? [] : ["No --time column: step order inside a user's history was not checked."]),
    ],
  };
  if (values.json) return { output: JSON.stringify(result, null, 2), code: 0 };

  const lines = [
    `| Step | Users | Of start | Step conversion | 95% interval | Lost |`,
    `|---|---|---|---|---|---|`,
    ...all.map(
      (s) =>
        `| ${s.step} | ${s.users} | ${pct(s.ofStart)} | ${s.stepConversion === null ? "" : pct(s.stepConversion)} | ` +
        `${s.interval ? `${pct(s.interval.low)} to ${pct(s.interval.high)}` : ""} | ${s.dropOff || ""} |`,
    ),
    ``,
    `Most users lost: into "${worst.step}", ${worst.dropOff} users (${pct(worst.stepConversion)} step conversion).`,
    `Lowest step conversion: into "${lowest.step}" (${pct(lowest.stepConversion)}).`,
  ];
  if (segments) {
    lines.push(
      ``,
      `Step conversion by ${values.segment}:`,
      ``,
      `| ${values.segment} | Users | ${steps.slice(1).join(" | ")} |`,
      `|---|---|${steps.slice(1).map(() => "---").join("|")}|`,
      ...segments.map(
        (seg) =>
          `| ${seg.name} | ${seg.steps[0].users} | ` +
          seg.steps
            .slice(1)
            .map((s) => `${pct(s.stepConversion)}${s.small ? "*" : ""}`)
            .join(" | ") +
          " |",
      ),
    );
    if (segments.some((seg) => seg.steps.some((s) => s.small))) {
      lines.push(`* fewer than ${MIN_SEGMENT_USERS} users entered this step: too small to read.`);
    }
    const idx = steps.indexOf(focus.step);
    lines.push(``, `Into "${focus.step}" by ${values.segment}, with 95% intervals:`, ``, `| ${values.segment} | Entered | Converted | Rate | 95% interval |`, `|---|---|---|---|---|`);
    for (const seg of segments) {
      const s = seg.steps[idx];
      lines.push(
        `| ${seg.name} | ${s.entered} | ${s.users} | ${pct(s.stepConversion)} | ` +
          `${pct(s.interval.low)} to ${pct(s.interval.high)} |`,
      );
    }
  }
  if (result.warnings.length) lines.push(``, ...result.warnings.map((w) => `Note: ${w}`));
  lines.push(
    `Before concluding: check for a tracking change on these dates, and compare segments of similar size. ` +
      `A gap that disappears when you split by another column (Simpson's paradox) is not a real gap.`,
  );
  return { output: lines.join("\n"), code: 0 };
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
