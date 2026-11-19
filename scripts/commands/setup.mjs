// uxg setup: install the optional browser runtime for screenshot and axe.

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { RUNTIME_PACKAGES, runtimeDir, resolveRuntime } from "../lib/runtime.mjs";

export const help = `Usage:
  uxg setup [--check]

Installs ${Object.entries(RUNTIME_PACKAGES).map(([k, v]) => `${k} ${v}`).join(" and ")} into
${runtimeDir()}, then downloads the Chromium browser that Playwright uses.
Only \`uxg screenshot\` and \`uxg axe\` need this. Everything else works without it.

  --check   Report what is installed, install nothing.`;

export function run(argv) {
  const { values } = parseArgs({
    args: argv,
    options: { check: { type: "boolean", default: false }, help: { type: "boolean", short: "h", default: false } },
  });
  if (values.help) return { output: help, code: 0 };

  const status = Object.keys(RUNTIME_PACKAGES).map((n) => `${n}: ${resolveRuntime(n) ? "installed" : "missing"}`);
  if (values.check) return { output: status.join("\n"), code: status.some((s) => s.endsWith("missing")) ? 1 : 0 };

  const dir = runtimeDir();
  mkdirSync(dir, { recursive: true });
  const pkg = join(dir, "package.json");
  if (!existsSync(pkg)) {
    writeFileSync(pkg, JSON.stringify({ name: "ux-grandmaster-runtime", private: true, type: "module" }, null, 2));
  }
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const specs = Object.entries(RUNTIME_PACKAGES).map(([k, v]) => `${k}@${v}`);
  process.stderr.write(`Installing ${specs.join(", ")} into ${dir}\n`);
  const install = spawnSync(npm, ["install", "--save-exact", "--no-fund", "--no-audit", ...specs], {
    cwd: dir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (install.status !== 0) return { output: "npm install failed. See the messages above.", code: 1 };
  process.stderr.write("Downloading Chromium for Playwright\n");
  const browser = spawnSync(npx, ["playwright", "install", "chromium"], {
    cwd: dir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (browser.status !== 0) return { output: "Chromium download failed. See the messages above.", code: 1 };
  return { output: `Ready. Runtime installed in ${dir}.`, code: 0 };
}
