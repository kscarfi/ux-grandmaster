// Personal reference library: index the user's own design books and papers on
// their own machine, and search them with page-level citations.
//
// Copyright stance, enforced here and in the skills:
// - Nothing from the library ships with UX Grandmaster. The user points to
//   files they own; the index stays in their home folder.
// - Search returns a short excerpt (EXCERPT_WORDS) and a page number, so an
//   agent can cite and paraphrase, not reproduce.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";

/** Words returned around a match. Short on purpose: enough to cite, not to copy. */
export const EXCERPT_WORDS = 40;
/** Words per chunk for Markdown and text files, which have no pages. */
export const CHUNK_WORDS = 300;
/** BM25 parameters, the common defaults from Robertson and Zaragoza (2009). */
const BM25_K1 = 1.2;
const BM25_B = 0.75;

const SUPPORTED = new Set([".pdf", ".md", ".markdown", ".txt"]);

/** Where the index lives. Override with UX_GRANDMASTER_HOME. */
export function homeDir() {
  return process.env.UX_GRANDMASTER_HOME || join(homedir(), ".ux-grandmaster");
}

export function indexPath() {
  return join(homeDir(), "library", "index.json");
}

/**
 * Find the library folder: explicit argument, then UX_GRANDMASTER_LIBRARY,
 * then the Claude Code plugin option, then the folder saved by the last index run.
 */
export function resolveLibraryDir(explicit) {
  const candidates = [
    explicit,
    process.env.UX_GRANDMASTER_LIBRARY,
    process.env.CLAUDE_PLUGIN_OPTION_LIBRARY_PATH,
    readIndex()?.root,
  ];
  for (const c of candidates) {
    if (c && !c.includes("${")) return resolve(c);
  }
  return null;
}

export function readIndex() {
  const file = indexPath();
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Split text into lowercase word tokens. Unicode-aware, so Turkish and other scripts work. */
export function tokenize(text) {
  // Strip accents and dots after decomposing, so "İkincil", "ikincil" and
  // "Ikincil" all match, and "café" matches "cafe".
  const folded = text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en-US");
  return (folded.match(/[\p{L}\p{N}]+/gu) ?? []).filter((t) => t.length > 1);
}

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (SUPPORTED.has(extname(entry.name).toLowerCase())) out.push(p);
    }
  };
  walk(dir);
  return out.sort();
}

function hasPdftotext() {
  const r = spawnSync("pdftotext", ["-v"], { encoding: "utf8" });
  return !r.error;
}

/** Extract pages of text from one file. PDF pages come from pdftotext's form feeds. */
export function extractPages(file) {
  const ext = extname(file).toLowerCase();
  if (ext === ".pdf") {
    const r = spawnSync("pdftotext", ["-enc", "UTF-8", file, "-"], {
      encoding: "utf8",
      maxBuffer: 512 * 1024 * 1024,
    });
    if (r.error) throw new Error("pdftotext is not installed");
    if (r.status !== 0) throw new Error(`pdftotext failed: ${r.stderr.trim().split("\n")[0]}`);
    return r.stdout.split("\f").map((p) => p.replace(/\s+/g, " ").trim());
  }
  const words = readFileSync(file, "utf8").split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += CHUNK_WORDS) chunks.push(words.slice(i, i + CHUNK_WORDS).join(" "));
  return chunks;
}

/**
 * Build or refresh the index for a folder. Files whose size and modified time
 * have not changed are reused from the previous index.
 */
export function buildIndex(root, { onProgress = () => {} } = {}) {
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`Library folder not found: ${root}`);
  }
  const previous = readIndex();
  const prevDocs = new Map((previous?.root === root ? previous.documents : []).map((d) => [d.path, d]));
  const files = listFiles(root);
  const pdfOk = hasPdftotext();
  const documents = [];
  const problems = [];

  for (const path of files) {
    const st = statSync(path);
    const stamp = `${st.size}:${Math.floor(st.mtimeMs)}`;
    const prev = prevDocs.get(path);
    if (prev && prev.stamp === stamp) {
      documents.push(prev);
      continue;
    }
    if (extname(path).toLowerCase() === ".pdf" && !pdfOk) {
      problems.push({ path, reason: "pdftotext is not installed" });
      continue;
    }
    onProgress(path);
    try {
      const pages = extractPages(path);
      const words = pages.reduce((n, p) => n + tokenize(p).length, 0);
      if (words === 0) {
        problems.push({ path, reason: "no text found (scanned images need OCR first)" });
        continue;
      }
      documents.push({
        id: createHash("sha1").update(path).digest("hex").slice(0, 12),
        path,
        title: basename(path, extname(path)),
        stamp,
        pages,
      });
    } catch (err) {
      problems.push({ path, reason: err.message });
    }
  }

  const index = { version: 1, root, builtAt: new Date().toISOString(), documents, problems };
  mkdirSync(join(homeDir(), "library"), { recursive: true });
  writeFileSync(indexPath(), JSON.stringify(index));
  return index;
}

/** Rank pages by BM25 for the query. Returns hits with a short excerpt and page number. */
export function search(index, query, { limit = 5, perDocument = 2 } = {}) {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) throw new Error("The query has no searchable words.");

  const units = [];
  for (const doc of index.documents) {
    doc.pages.forEach((text, i) => {
      if (text) units.push({ doc, page: i + 1, text, tokens: tokenize(text) });
    });
  }
  if (!units.length) return [];

  const avgLen = units.reduce((n, u) => n + u.tokens.length, 0) / units.length;
  const df = new Map(terms.map((t) => [t, 0]));
  for (const u of units) {
    const seen = new Set(u.tokens);
    for (const t of terms) if (seen.has(t)) df.set(t, df.get(t) + 1);
  }

  const scored = [];
  for (const u of units) {
    const tf = new Map();
    for (const tok of u.tokens) if (df.has(tok)) tf.set(tok, (tf.get(tok) ?? 0) + 1);
    if (!tf.size) continue;
    let score = 0;
    for (const [t, f] of tf) {
      const idf = Math.log(1 + (units.length - df.get(t) + 0.5) / (df.get(t) + 0.5));
      score += (idf * f * (BM25_K1 + 1)) / (f + BM25_K1 * (1 - BM25_B + (BM25_B * u.tokens.length) / avgLen));
    }
    // Pages that contain every term rank above pages that contain only some.
    score *= tf.size / terms.length;
    scored.push({ u, score });
  }
  scored.sort((a, b) => b.score - a.score);

  const perDoc = new Map();
  const hits = [];
  for (const { u, score } of scored) {
    const n = perDoc.get(u.doc.id) ?? 0;
    if (n >= perDocument) continue;
    perDoc.set(u.doc.id, n + 1);
    hits.push({
      title: u.doc.title,
      path: u.doc.path,
      page: u.page,
      score: Number(score.toFixed(3)),
      excerpt: excerpt(u.text, terms),
    });
    if (hits.length >= limit) break;
  }
  return hits;
}

/** A window of EXCERPT_WORDS words around the first matching word. */
export function excerpt(text, terms) {
  const words = text.split(/\s+/);
  const termSet = new Set(terms);
  let at = words.findIndex((w) => tokenize(w).some((t) => termSet.has(t)));
  if (at < 0) at = 0;
  const start = Math.max(0, at - Math.floor(EXCERPT_WORDS / 3));
  const slice = words.slice(start, start + EXCERPT_WORDS).join(" ");
  return `${start > 0 ? "… " : ""}${slice}${start + EXCERPT_WORDS < words.length ? " …" : ""}`;
}
