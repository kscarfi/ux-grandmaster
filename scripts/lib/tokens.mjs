// Read design tokens from CSS custom properties or DTCG JSON and resolve aliases.
// No dependencies.

import { readFileSync } from "node:fs";
import { extname } from "node:path";

/**
 * Load tokens from a file. Returns a Map of name -> raw value with aliases resolved.
 * CSS: every custom property (--name: value) in the file. When a name appears more
 * than once, the last one wins, as in the cascade for a single element. Pass
 * `selector` to read only blocks whose selector list contains that text.
 * JSON: DTCG format ($value, with {group.token} aliases). Names are joined with ".".
 */
export function loadTokens(files, { selector } = {}) {
  const list = Array.isArray(files) ? files : [files];
  const raw = new Map();
  let syntax;
  for (const file of list) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (err) {
      throw new Error(`Cannot read token file "${file}": ${err.code ?? err.message}`);
    }
    const fileSyntax = extname(file).toLowerCase() === ".json" ? "dtcg" : "css";
    if (syntax && syntax !== fileSyntax) {
      throw new Error("Do not mix CSS and JSON token files in one check.");
    }
    syntax = fileSyntax;
    const parsed = fileSyntax === "dtcg" ? parseDtcg(text, file) : parseCssCustomProperties(text, selector);
    // Later files override earlier ones, like a theme file loaded after a base file.
    for (const [k, v] of parsed) raw.set(k, v);
  }
  return new ResolvedTokens(raw, syntax);
}

/**
 * A read-only view over raw tokens that resolves aliases when a token is read.
 * A broken alias only fails the tokens that depend on it, not the whole file.
 */
class ResolvedTokens {
  constructor(raw, syntax) {
    this.raw = raw;
    this.syntax = syntax;
    this.cache = new Map();
  }
  keys() {
    return this.raw.keys();
  }
  has(name) {
    return this.raw.has(name);
  }
  get size() {
    return this.raw.size;
  }
  get(name) {
    if (!this.cache.has(name)) this.cache.set(name, resolveValue(name, this.raw, this.syntax, []));
    return this.cache.get(name);
  }
}

/** Parse custom properties from CSS text. Returns Map name -> raw value. */
export function parseCssCustomProperties(css, selector) {
  const out = new Map();
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let block;
  while ((block = blockRe.exec(noComments))) {
    const sel = block[1].trim();
    if (selector && !sel.includes(selector)) continue;
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);?/g;
    let decl;
    while ((decl = declRe.exec(block[2]))) out.set(decl[1], decl[2].trim());
  }
  return out;
}

/** Parse DTCG JSON. Returns Map "group.token" -> raw $value (strings and numbers only). */
export function parseDtcg(text, file = "tokens") {
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`"${file}" is not valid JSON: ${err.message}`);
  }
  const out = new Map();
  const walk = (node, path) => {
    if (node && typeof node === "object" && "$value" in node) {
      const v = node.$value;
      if (typeof v === "string" || typeof v === "number") out.set(path.join("."), String(v));
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, child] of Object.entries(node)) {
        if (!k.startsWith("$")) walk(child, [...path, k]);
      }
    }
  };
  walk(data, []);
  return out;
}

function resolveValue(name, raw, syntax, chain) {
  if (chain.includes(name)) {
    throw new Error(`Token alias loop: ${[...chain, name].join(" -> ")}`);
  }
  const value = raw.get(name);
  if (value === undefined) return undefined;
  const next = [...chain, name];
  if (syntax === "css") {
    return replaceVars(value, raw, next);
  }
  return value.replace(/\{([^}]+)\}/g, (match, ref) => {
    const r = resolveValue(ref, raw, syntax, next);
    if (r === undefined) throw new Error(`Token "${name}" points to missing token "${ref}"`);
    return r;
  });
}

function replaceVars(value, raw, chain) {
  // Replace innermost var() first so nested fallbacks work.
  let out = value;
  let guard = 0;
  const re = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/;
  while (re.test(out)) {
    if (++guard > 100) throw new Error(`Too many nested var() in "${value}"`);
    out = out.replace(re, (m, ref, fallback) => {
      const r = resolveValue(ref, raw, "css", chain);
      if (r !== undefined) return r;
      if (fallback !== undefined) return fallback.trim();
      throw new Error(`"${chain[chain.length - 1]}" uses ${ref}, which is not defined`);
    });
  }
  return out;
}

/** Turn a simple glob (only * is special) into a RegExp. */
export function globToRegExp(glob) {
  const escaped = glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

/** Token names that match a glob, in file order. */
export function matchTokens(tokens, glob) {
  const re = globToRegExp(glob);
  return [...tokens.keys()].filter((n) => re.test(n));
}
