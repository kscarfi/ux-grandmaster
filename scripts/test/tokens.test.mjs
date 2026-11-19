import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseCssCustomProperties, loadTokens, matchTokens, globToRegExp } from "../lib/tokens.mjs";

function tmpFile(name, content) {
  const dir = mkdtempSync(join(tmpdir(), "uxg-tokens-"));
  const file = join(dir, name);
  writeFileSync(file, content);
  return file;
}

test("reads custom properties and lets the last declaration win", () => {
  const map = parseCssCustomProperties(":root { --a: #fff; --b: 1rem; } .x { --a: #000; }");
  assert.equal(map.get("--a"), "#000");
  assert.equal(map.get("--b"), "1rem");
});

test("selector filter reads only matching blocks", () => {
  const css = '[data-theme="light"] { --a: #fff; } [data-theme="dark"] { --a: #000; }';
  assert.equal(parseCssCustomProperties(css, 'data-theme="light"').get("--a"), "#fff");
});

test("resolves var() aliases, nested fallbacks and comments", () => {
  const file = tmpFile(
    "t.css",
    "/* c */ :root { --base: #123456; --alias: var(--base); --fb: var(--missing, var(--base)); }",
  );
  const t = loadTokens(file);
  assert.equal(t.get("--alias"), "#123456");
  assert.equal(t.get("--fb"), "#123456");
});

test("reports alias loops and missing references when the token is read", () => {
  const loop = loadTokens(tmpFile("loop.css", ":root { --a: var(--b); --b: var(--a); --ok: #fff; }"));
  assert.throws(() => loop.get("--a"), /alias loop/);
  assert.equal(loop.get("--ok"), "#fff");
  const miss = loadTokens(tmpFile("miss.css", ":root { --a: var(--nope); }"));
  assert.throws(() => miss.get("--a"), /not defined/);
});

test("later files override earlier ones and can use their tokens", () => {
  const base = tmpFile("base.css", ":root { --ink: #111111; --text: var(--ink); }");
  const theme = tmpFile("theme.css", ":root { --ink: #eeeeee; --surface: var(--paper); --paper: #000000; }");
  const t = loadTokens([base, theme]);
  assert.equal(t.get("--text"), "#eeeeee");
  assert.equal(t.get("--surface"), "#000000");
});

test("reads DTCG JSON with aliases", () => {
  const file = tmpFile(
    "t.json",
    JSON.stringify({ color: { ink: { $value: "#111111" }, text: { $value: "{color.ink}" } } }),
  );
  const t = loadTokens(file);
  assert.equal(t.get("color.text"), "#111111");
});

test("gives a clear error for a missing file or bad JSON", () => {
  assert.throws(() => loadTokens("/no/such/file.css"), /Cannot read token file/);
  assert.throws(() => loadTokens(tmpFile("bad.json", "{")), /not valid JSON/);
});

test("glob matching treats only * as special", () => {
  assert.ok(globToRegExp("--lw-text-*").test("--lw-text-default"));
  assert.ok(!globToRegExp("--lw-text-*").test("--lw-fill-default"));
  assert.ok(!globToRegExp("a.b").test("axb"));
  const t = new Map([
    ["--x-1", ""],
    ["--y-1", ""],
  ]);
  assert.deepEqual(matchTokens(t, "--x-*"), ["--x-1"]);
});
