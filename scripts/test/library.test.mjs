import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let lib;
let root;

before(async () => {
  process.env.UX_GRANDMASTER_HOME = mkdtempSync(join(tmpdir(), "uxg-home-"));
  root = mkdtempSync(join(tmpdir(), "uxg-lib-"));
  mkdirSync(join(root, "notes"));
  writeFileSync(
    join(root, "buttons.md"),
    "Use one primary button per screen. Secondary buttons carry less important actions. " +
      "Tertiary buttons look like links. Destructive actions need friction.",
  );
  writeFileSync(
    join(root, "notes", "forms.txt"),
    "Labels sit above fields. Never use placeholder text as a label. Validate when the form is submitted.",
  );
  writeFileSync(join(root, "ignore.docx"), "not indexed");
  writeFileSync(join(root, ".hidden.md"), "secret primary button");
  lib = await import("../lib/library.mjs");
});

test("tokenize handles Turkish and mixed case", () => {
  assert.deepEqual(lib.tokenize("Birincil BUTON ve İkincil"), ["birincil", "buton", "ve", "ikincil"]);
  assert.deepEqual(lib.tokenize("café"), ["cafe"]);
});

test("index reads supported files, skips hidden and unsupported ones", () => {
  const index = lib.buildIndex(root);
  const titles = index.documents.map((d) => d.title).sort();
  assert.deepEqual(titles, ["buttons", "forms"]);
});

test("search ranks the page that covers the topic first and cites it", () => {
  const index = lib.readIndex();
  const hits = lib.search(index, "primary button");
  assert.equal(hits[0].title, "buttons");
  assert.equal(hits[0].page, 1);
  assert.match(hits[0].excerpt, /primary button/i);
});

test("excerpts stay short", () => {
  const long = Array.from({ length: 500 }, (_, i) => `word${i}`).join(" ") + " target " + "tail ".repeat(200);
  const e = lib.excerpt(long, ["target"]);
  const words = e.replace(/…/g, "").trim().split(/\s+/);
  assert.ok(words.length <= lib.EXCERPT_WORDS, `excerpt had ${words.length} words`);
  assert.match(e, /target/);
});

test("unchanged files are reused on reindex", () => {
  const first = lib.readIndex();
  const second = lib.buildIndex(root);
  assert.equal(second.documents[0].stamp, first.documents[0].stamp);
});

test("a missing folder gives a clear error", () => {
  assert.throws(() => lib.buildIndex(join(root, "nope")), /Library folder not found/);
});

test("unexpanded placeholders are not treated as a folder", () => {
  process.env.UX_GRANDMASTER_LIBRARY = "${user_config.library_path}";
  const dir = lib.resolveLibraryDir();
  assert.notEqual(dir, "${user_config.library_path}");
  delete process.env.UX_GRANDMASTER_LIBRARY;
});
