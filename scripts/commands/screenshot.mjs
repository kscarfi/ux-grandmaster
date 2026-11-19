// uxg screenshot: render a page at several viewport sizes so the agent can look at it.

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { importRuntime, toUrl } from "../lib/runtime.mjs";

/** Default viewport widths: small phone, tablet, laptop. */
export const DEFAULT_WIDTHS = [360, 768, 1280];
const DEFAULT_HEIGHT = 900;

export const help = `Usage:
  uxg screenshot <url-or-html-file> [options]

Renders the page in Chromium and saves one PNG per width, so the result can
be looked at before anyone calls it done.

Options:
  --widths <list>       Comma-separated viewport widths. Default: ${DEFAULT_WIDTHS.join(",")}.
  --height <px>         Viewport height. Default: ${DEFAULT_HEIGHT}.
  --theme <light|dark>  Emulated color scheme. Default: light.
  --full-page           Capture the whole page, not just the viewport.
  --wait <ms>           Extra wait after load, for animations or data. Default: 300.
  --out <dir>           Output folder. Default: .ux-grandmaster/screenshots
  --name <prefix>       File name prefix. Default: screen.
  --json                Print JSON.

Motion is reduced during capture. Needs \`uxg setup\` once.`;

export async function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      widths: { type: "string", default: DEFAULT_WIDTHS.join(",") },
      height: { type: "string", default: String(DEFAULT_HEIGHT) },
      theme: { type: "string", default: "light" },
      "full-page": { type: "boolean", default: false },
      wait: { type: "string", default: "300" },
      out: { type: "string", default: ".ux-grandmaster/screenshots" },
      name: { type: "string", default: "screen" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };
  if (positionals.length !== 1) throw usage("Give one URL or HTML file.");
  if (!["light", "dark"].includes(values.theme)) throw usage("--theme must be light or dark.");
  const widths = values.widths.split(",").map((w) => Number.parseInt(w, 10));
  if (widths.some((w) => !Number.isInteger(w) || w < 200 || w > 3840)) throw usage("--widths must be whole numbers from 200 to 3840.");
  const height = Number.parseInt(values.height, 10);
  const wait = Number.parseInt(values.wait, 10);

  const url = toUrl(positionals[0]);
  const { chromium } = await importRuntime("playwright");
  const out = resolve(values.out);
  mkdirSync(out, { recursive: true });

  const browser = await chromium.launch();
  const shots = [];
  const consoleErrors = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height },
        colorScheme: values.theme,
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${width}px: ${m.text()}`));
      page.on("pageerror", (e) => consoleErrors.push(`${width}px: ${e.message}`));
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      if (wait > 0) await page.waitForTimeout(wait);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = join(out, `${values.name}-${width}-${values.theme}.png`);
      await page.screenshot({ path: file, fullPage: values["full-page"] });
      shots.push({ width, theme: values.theme, file, horizontalOverflowPx: Math.max(0, overflow) });
      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (values.json) return { output: JSON.stringify({ url, shots, consoleErrors }, null, 2), code: 0 };
  const lines = [
    ...shots.map(
      (s) => `${s.file}${s.horizontalOverflowPx ? `  (scrolls sideways by ${s.horizontalOverflowPx}px)` : ""}`,
    ),
    ...(consoleErrors.length ? ["", "Console errors:", ...consoleErrors.map((e) => `- ${e}`)] : []),
    "",
    "Open each image and look at it before reporting the screen as done.",
  ];
  return { output: lines.join("\n"), code: 0 };
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
