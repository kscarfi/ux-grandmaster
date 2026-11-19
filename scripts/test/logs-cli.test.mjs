import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "../commands/sources.mjs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "uxg.mjs");
const cwd = mkdtempSync(join(tmpdir(), "uxg-logs-"));
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8", cwd });

test("decision add numbers entries and requires evidence", () => {
  const ok = run(
    "decision", "add", "--title", "Amount first", "--decision", "Put the amount field first",
    "--why", "People decide how much before whom", "--evidence-type", "research", "--source", "interviews 2026-11",
  );
  assert.equal(ok.status, 0, ok.stderr);
  const second = run(
    "decision", "add", "--title", "Fee next to amount", "--decision", "Show the fee beside the amount",
    "--why", "Not tested yet", "--evidence-type", "assumption", "--revisit", "after the first usability test",
  );
  assert.equal(second.status, 0, second.stderr);
  const log = readFileSync(join(cwd, "design/decisions.md"), "utf8");
  assert.match(log, /## D001: Amount first/);
  assert.match(log, /## D002: Fee next to amount/);
  assert.match(log, /Revisit when:\*\* after the first usability test/);

  assert.equal(run("decision", "add", "--title", "x", "--decision", "y", "--why", "z", "--evidence-type", "data").status, 2);
  assert.equal(run("decision", "add", "--title", "x", "--decision", "y", "--why", "z", "--evidence-type", "assumption").status, 2);
  assert.match(run("decision", "list").stdout, /D002: Fee next to amount/);
});

test("sources check flags single-source key claims, missing primary and stale dates", () => {
  const today = new Date("2026-11-19");
  const problems = check(
    [
      { claim: "c1", url: "a", title: "t", summary: "s", type: "secondary", accessed: "2026-11-19", published: "2020-01-01", key: true },
      { claim: "c2", url: "b", title: "t", summary: "s", type: "primary", accessed: "2026-11-19", published: "2026-06-01" },
    ],
    today,
  );
  assert.ok(problems.some((p) => /older than 24 months/.test(p)));
  assert.ok(problems.some((p) => /"c1" has 1 source/.test(p)));
  assert.ok(problems.some((p) => /"c1" has no primary/.test(p)));
  assert.ok(!problems.some((p) => /c2/.test(p)));
});

test("sources add, check and render through the CLI", () => {
  const add = (...a) => run("sources", "add", "--claim", "freeze", "--key", ...a);
  assert.equal(add("--url", "https://a.example", "--title", "A", "--summary", "s", "--type", "primary", "--published", "2026-10-01").status, 0);
  assert.equal(run("sources", "check").status, 1);
  assert.equal(add("--url", "https://b.example", "--title", "B", "--summary", "s", "--type", "secondary", "--published", "2026-09-01").status, 0);
  assert.equal(run("sources", "check").status, 0);
  assert.match(run("sources", "render").stdout, /## freeze \(key claim\)/);
  assert.equal(add("--url", "u", "--title", "t", "--summary", "s", "--type", "blog").status, 2);
});
