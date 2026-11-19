import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "uxg.mjs");
const run = (...args) => spawnSync(process.execPath, [CLI, "contrast", ...args], { encoding: "utf8" });

function tmp(name, content) {
  const dir = mkdtempSync(join(tmpdir(), "uxg-cli-"));
  const f = join(dir, name);
  writeFileSync(f, content);
  return f;
}

test("exit 0 when a pair passes, 1 when it fails, 2 on bad input", () => {
  assert.equal(run("#000000", "#ffffff").status, 0);
  assert.equal(run("#777777", "#ffffff").status, 1);
  assert.equal(run("nope").status, 2);
});

test("JSON output carries the numbers an agent needs", () => {
  const r = run("#777777", "#ffffff", "--json");
  const data = JSON.parse(r.stdout);
  assert.equal(data.failures, 1);
  assert.equal(data.pairs[0].requiredAA, 4.5);
  assert.equal(typeof data.pairs[0].apcaLc, "number");
});

test("token globs work with or without leading dashes", () => {
  const css = tmp("t.css", ":root { --text-a: #111; --text-b: #999; --bg-a: #fff; }");
  const r = run("--tokens", css, "--fg", "text-*", "--bg", "bg-a", "--json");
  const data = JSON.parse(r.stdout);
  assert.equal(data.checked, 2);
  assert.equal(data.failures, 1);
});

test("a pairs file checks only the listed pairs, with per-pair kind", () => {
  const css = tmp("t.css", ":root { --icon: #949494; --bg: #ffffff; }");
  const pairs = tmp("p.json", JSON.stringify([{ fg: "icon", bg: "bg", kind: "ui", note: "close icon" }]));
  const r = run("--pairs", pairs, "--tokens", css, "--json");
  const data = JSON.parse(r.stdout);
  assert.equal(r.status, 0);
  assert.equal(data.pairs[0].note, "close icon");
});

test("non-color tokens are skipped, not fatal", () => {
  const css = tmp("t.css", ":root { --text: #111; --shadow: 0 1px 2px #000; --bg: #fff; }");
  const r = run("--tokens", css, "--fg", "text", "--fg", "shadow", "--bg", "bg", "--json");
  const data = JSON.parse(r.stdout);
  assert.equal(data.checked, 1);
  assert.equal(data.skipped.length, 1);
});
