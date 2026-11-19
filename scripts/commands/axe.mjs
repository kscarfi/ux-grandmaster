// uxg axe: run axe-core in Chromium against a page, for WCAG 2.2 A and AA rules.

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { importRuntime, resolveRuntime, missing, toUrl } from "../lib/runtime.mjs";

/** axe-core tags for WCAG 2.0, 2.1 and 2.2, levels A and AA. */
export const DEFAULT_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const IMPACT_ORDER = ["critical", "serious", "moderate", "minor"];

export const help = `Usage:
  uxg axe <url-or-html-file> [options]

Runs axe-core against the rendered page and lists violations by impact,
with the elements and the WCAG criteria involved.

Options:
  --width <px>          Viewport width. Default: 1280. Run again at 360 for mobile.
  --theme <light|dark>  Emulated color scheme. Default: light.
  --tags <list>         axe rule tags. Default: ${DEFAULT_TAGS.join(",")}.
  --json                Print JSON.

axe finds roughly the issues a machine can find. Keyboard order, focus
visibility in context, meaningful labels and reading order still need a
manual check. Needs \`uxg setup\` once.

Exit codes: 0 no violations, 1 violations found, 2 usage error.`;

export async function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      width: { type: "string", default: "1280" },
      theme: { type: "string", default: "light" },
      tags: { type: "string", default: DEFAULT_TAGS.join(",") },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };
  if (positionals.length !== 1) throw usage("Give one URL or HTML file.");
  const width = Number.parseInt(values.width, 10);
  if (!Number.isInteger(width) || width < 200) throw usage("--width must be a whole number of at least 200.");

  const url = toUrl(positionals[0]);
  const { chromium } = await importRuntime("playwright");
  const axePath = resolveRuntime("axe-core", "axe.min.js");
  if (!axePath) throw missing("axe-core");
  const axeSource = readFileSync(axePath, "utf8");
  const tags = values.tags.split(",").map((t) => t.trim()).filter(Boolean);

  const browser = await chromium.launch();
  let results;
  try {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: values.theme, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.addScriptTag({ content: axeSource });
    results = await page.evaluate(
      // eslint-disable-next-line no-undef
      (runTags) => axe.run(document, { runOnly: { type: "tag", values: runTags }, resultTypes: ["violations", "incomplete"] }),
      tags,
    );
  } finally {
    await browser.close();
  }

  const violations = results.violations
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      wcag: v.tags.filter((t) => /^wcag\d{3,4}$/.test(t)).map(formatCriterion),
      nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary })),
    }))
    .sort((a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact));
  const needsReview = results.incomplete.map((v) => ({ id: v.id, help: v.help, count: v.nodes.length }));
  const code = violations.length ? 1 : 0;

  if (values.json) {
    return {
      output: JSON.stringify({ url, width, theme: values.theme, axeVersion: results.testEngine.version, tags, violations, needsReview }, null, 2),
      code,
    };
  }
  const lines = [`axe-core ${results.testEngine.version} at ${width}px, ${values.theme} theme. Tags: ${tags.join(", ")}.`, ""];
  if (!violations.length) lines.push("No violations found by axe.");
  for (const v of violations) {
    lines.push(`[${v.impact}] ${v.id}: ${v.help}${v.wcag.length ? ` (WCAG ${v.wcag.join(", ")})` : ""}`);
    for (const n of v.nodes.slice(0, 5)) lines.push(`  - ${n.target}`);
    if (v.nodes.length > 5) lines.push(`  - and ${v.nodes.length - 5} more`);
  }
  if (needsReview.length) {
    lines.push("", "Needs a manual check (axe could not decide):", ...needsReview.map((r) => `- ${r.id}: ${r.help} (${r.count})`));
  }
  lines.push("", "axe covers what a machine can test. Still check keyboard order, focus and reading order by hand.");
  return { output: lines.join("\n"), code };
}

/** "wcag143" -> "1.4.3", "wcag1410" -> "1.4.10" */
function formatCriterion(tag) {
  const d = tag.replace("wcag", "");
  return `${d[0]}.${d[1]}.${d.slice(2)}`;
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
