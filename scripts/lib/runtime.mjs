// Optional runtime packages (Playwright, axe-core) for the screenshot and axe scripts.
// The core scripts need nothing. These two need a browser, so they are installed
// once, on request, into ~/.ux-grandmaster/runtime with `uxg setup`.

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { homeDir } from "./library.mjs";

/** Versions installed by `uxg setup`. Pinned so every machine gets the same checks. */
export const RUNTIME_PACKAGES = {
  playwright: "1.65.0",
  "axe-core": "4.14.0",
};

export function runtimeDir() {
  return join(homeDir(), "runtime");
}

/** Resolve a package from the project first, then from the UX Grandmaster runtime folder. */
export function resolveRuntime(name, subpath = "") {
  const spec = subpath ? `${name}/${subpath}` : name;
  const bases = [join(process.cwd(), "package.json"), import.meta.url, join(runtimeDir(), "package.json")];
  for (const base of bases) {
    try {
      return createRequire(base).resolve(spec);
    } catch {
      // try the next location
    }
  }
  return null;
}

export async function importRuntime(name) {
  const path = resolveRuntime(name);
  if (!path) throw missing(name);
  const mod = await import(pathToFileURL(path).href);
  return mod.default ?? mod;
}

export function missing(name) {
  const e = new Error(
    `${name} is not installed. Run \`uxg setup\` once to install Playwright and axe-core ` +
      `into ${runtimeDir()} (about 200 MB with the Chromium browser).`,
  );
  e.name = "MissingRuntime";
  return e;
}

/** Turn a path or URL argument into a URL Playwright can open. */
export function toUrl(target) {
  if (/^https?:\/\//i.test(target) || target.startsWith("file://")) return target;
  if (!existsSync(target)) throw new Error(`No such file or URL: ${target}`);
  return pathToFileURL(target).href;
}
