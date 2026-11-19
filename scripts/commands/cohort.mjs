// uxg cohort: retention table from an activity CSV.

import { parseArgs } from "node:util";
import { readCsv } from "../lib/csv.mjs";
import { pct } from "../lib/stats.mjs";

export const help = `Usage:
  uxg cohort <activity.csv> [options]

Groups users by the period they started in, then shows the share still
active in each later period. Period 0 is the start period, so it is 100%.

Options:
  --user <column>       User id column. Default: user_id.
  --start <column>      Start date column (sign-up, first purchase). Default: signup_date.
  --activity <column>   Activity date column. Default: activity_date.
  --period <week|month> Default: week. Weeks start on Monday, in UTC.
  --periods <n>         Number of periods to show. Default: 8.
  --json                Print JSON.

Recent cohorts have not had time to reach later periods. Those cells are left
empty, not shown as 0%.

Example:
  uxg cohort activity.csv --period month --periods 6`;

export function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      user: { type: "string", default: "user_id" },
      start: { type: "string", default: "signup_date" },
      activity: { type: "string", default: "activity_date" },
      period: { type: "string", default: "week" },
      periods: { type: "string", default: "8" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };
  if (positionals.length !== 1) throw usage("Give one CSV file.");
  if (!["week", "month"].includes(values.period)) throw usage("--period must be week or month.");
  const periods = Number.parseInt(values.periods, 10);
  if (!Number.isInteger(periods) || periods < 1) throw usage("--periods must be a positive whole number.");

  const rows = readCsv(positionals[0], [values.user, values.start, values.activity]);
  const bucket = values.period === "week" ? weekIndex : monthIndex;
  const label = values.period === "week" ? weekLabel : monthLabel;

  const users = new Map();
  let latest = -Infinity;
  for (const [i, r] of rows.entries()) {
    const id = r[values.user];
    if (!id) continue;
    const start = parseDate(r[values.start], i, values.start);
    const act = r[values.activity] ? parseDate(r[values.activity], i, values.activity) : null;
    let u = users.get(id);
    if (!u) {
      u = { start: bucket(start), active: new Set() };
      users.set(id, u);
    } else {
      u.start = Math.min(u.start, bucket(start));
    }
    if (act !== null) {
      const b = bucket(act);
      u.active.add(b);
      latest = Math.max(latest, b);
    }
    latest = Math.max(latest, bucket(start));
  }

  const cohorts = new Map();
  for (const u of users.values()) {
    if (!cohorts.has(u.start)) cohorts.set(u.start, []);
    cohorts.get(u.start).push(u);
  }

  const table = [...cohorts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, list]) => {
      const cells = [];
      for (let k = 0; k < periods; k++) {
        if (start + k > latest) {
          cells.push(null);
          continue;
        }
        const active = k === 0 ? list.length : list.filter((u) => u.active.has(start + k)).length;
        cells.push({ active, rate: active / list.length });
      }
      return { cohort: label(start), size: list.length, cells };
    });

  if (values.json) return { output: JSON.stringify({ period: values.period, cohorts: table }, null, 2), code: 0 };

  const head = Array.from({ length: periods }, (_, k) => `${values.period === "week" ? "W" : "M"}${k}`);
  const lines = [
    `| Cohort | Users | ${head.join(" | ")} |`,
    `|---|---|${head.map(() => "---").join("|")}|`,
    ...table.map((c) => `| ${c.cohort} | ${c.size} | ${c.cells.map((x) => (x ? pct(x.rate, 0) : "")).join(" | ")} |`),
    ``,
    `Period 0 counts every user in the cohort. Later periods count users with any activity in that ${values.period}.`,
    `Empty cells: the period has not happened yet for that cohort. Small cohorts swing a lot, read them with care.`,
  ];
  return { output: lines.join("\n"), code: 0 };
}

function parseDate(v, i, col) {
  const t = Date.parse(v);
  if (Number.isNaN(t)) throw new Error(`Row ${i + 2}: cannot read date "${v}" in column "${col}".`);
  return t;
}

const DAY = 86400000;
// 1970-01-05 was a Monday; counting weeks from it gives Monday-start weeks.
const MONDAY_EPOCH = Date.UTC(1970, 0, 5);

function weekIndex(t) {
  return Math.floor((t - MONDAY_EPOCH) / (7 * DAY));
}
function weekLabel(i) {
  return new Date(MONDAY_EPOCH + i * 7 * DAY).toISOString().slice(0, 10);
}
function monthIndex(t) {
  const d = new Date(t);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}
function monthLabel(i) {
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
