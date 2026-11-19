import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "../lib/csv.mjs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "uxg.mjs");
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
function tmp(name, content) {
  const f = join(mkdtempSync(join(tmpdir(), "uxg-an-")), name);
  writeFileSync(f, content);
  return f;
}

test("CSV parser handles quotes, commas and CRLF", () => {
  assert.deepEqual(parseCsv('a,b\r\n"x, y","say ""hi"""\n'), [
    ["a", "b"],
    ["x, y", 'say "hi"'],
  ]);
  assert.throws(() => parseCsv('a\n"open'), /unclosed quote/);
});

test("funnel counts users in order and finds the segment behind the drop", () => {
  // 4 users on web all finish; 4 on ios: 3 reach cart, 1 pays.
  const rows = ["user_id,event,timestamp,device"];
  for (let i = 1; i <= 4; i++) {
    rows.push(`w${i},view,2026-01-01T10:00:00Z,web`, `w${i},cart,2026-01-01T10:01:00Z,web`, `w${i},paid,2026-01-01T10:02:00Z,web`);
  }
  for (let i = 1; i <= 4; i++) rows.push(`i${i},view,2026-01-01T10:00:00Z,ios`);
  for (let i = 1; i <= 3; i++) rows.push(`i${i},cart,2026-01-01T10:01:00Z,ios`);
  rows.push("i1,paid,2026-01-01T10:02:00Z,ios");
  // Out of order: paid before view does not count as reaching paid.
  rows.push("x1,paid,2026-01-01T09:00:00Z,web", "x1,view,2026-01-01T10:00:00Z,web", "x1,cart,2026-01-01T10:05:00Z,web");
  const csv = tmp("e.csv", rows.join("\n"));
  const r = run("funnel", csv, "--steps", "view,cart,paid", "--time", "timestamp", "--segment", "device", "--json");
  assert.equal(r.status, 0, r.stderr);
  const data = JSON.parse(r.stdout);
  assert.deepEqual(data.steps.map((s) => s.users), [9, 8, 5]);
  assert.equal(data.biggestDrop.step, "paid");
  const ios = data.segments.find((s) => s.name === "ios");
  assert.equal(ios.steps[2].users, 1);
  assert.equal(ios.steps[2].small, true);
});

test("funnel reports missing columns clearly", () => {
  const csv = tmp("e.csv", "uid,event\n1,view\n");
  const r = run("funnel", csv, "--steps", "view,cart");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /missing column\(s\): user_id/);
});

test("cohort leaves future periods empty and counts retention", () => {
  const csv = tmp(
    "a.csv",
    [
      "user_id,signup_date,activity_date",
      "a,2026-01-05,2026-01-05",
      "a,2026-01-05,2026-01-13",
      "b,2026-01-06,2026-01-06",
      "c,2026-01-12,2026-01-12",
    ].join("\n"),
  );
  const r = run("cohort", csv, "--periods", "3", "--json");
  assert.equal(r.status, 0, r.stderr);
  const data = JSON.parse(r.stdout);
  assert.equal(data.cohorts[0].cohort, "2026-01-05");
  assert.equal(data.cohorts[0].size, 2);
  assert.equal(data.cohorts[0].cells[1].active, 1);
  assert.equal(data.cohorts[0].cells[2], null);
  assert.equal(data.cohorts[1].cells[1], null);
});

test("ab-test stops on sample ratio mismatch", () => {
  const r = run("ab-test", "--control", "50000,2500", "--variant", "52000,2700");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /STOP: sample ratio mismatch/);
});

test("ab-test reads a clean result and plans a test", () => {
  const ok = run("ab-test", "--control", "10000,500", "--variant", "10000,600", "--json");
  assert.equal(ok.status, 0);
  const data = JSON.parse(ok.stdout);
  assert.equal(data.test.significant, true);
  assert.ok(Math.abs(data.difference.relativeLift - 0.2) < 1e-9);
  const plan = run("ab-test", "--plan", "--baseline", "0.05", "--mde", "0.01", "--json");
  assert.equal(JSON.parse(plan.stdout).perArm, 8158);
  assert.equal(run("ab-test", "--control", "10,20", "--variant", "10,1").status, 2);
});
