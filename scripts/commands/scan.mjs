// uxg scan: find likely UX and accessibility problems in a codebase, and the
// platform guidelines that apply to it.

import { extname, relative, resolve } from "node:path";
import { readFileSync, statSync } from "node:fs";
import { parseArgs } from "node:util";
import { detectPlatforms, walk } from "../lib/platforms.mjs";
import { RULES, scanText } from "../lib/ux-rules.mjs";

const ORDER = { high: 0, medium: 1, low: 2 };
const MAX_FILE_BYTES = 1_000_000;

export const help = `Usage:
  uxg scan [folder] [options]

Reads the source code of a web, iOS, visionOS, watchOS, Android, Wear OS,
Android XR, Flutter or React Native app and lists likely UX and accessibility
problems with file and line, the principle behind each, and a fix. It also
detects which platforms the project targets and links their official design
guidelines.

Findings are candidates. Confirm each one by reading the code and, where
possible, the running UI (uxg screenshot, uxg axe). Static checks cannot see
everything: flows, copy quality and visual hierarchy need a review.

Options:
  --min <high|medium|low>  Lowest severity to list. Default: low.
  --rule <id>              Only this rule. Repeatable.
  --limit <n>              Findings to list per rule. Default: 20.
  --rules                  List all rules and exit.
  --json                   Print JSON.

Exit codes: 0 done (findings or not), 2 usage error.`;

export function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      min: { type: "string", default: "low" },
      rule: { type: "string", multiple: true },
      limit: { type: "string", default: "20" },
      rules: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };
  if (values.rules) {
    return {
      output: RULES.map((r) => `${r.id} [${r.severity}] ${r.title}. ${r.principle}`).join("\n"),
      code: 0,
    };
  }
  if (!(values.min in ORDER)) throw usage("--min must be high, medium or low.");
  const limit = Number.parseInt(values.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) throw usage("--limit must be a positive whole number.");
  if (values.rule) {
    const unknown = values.rule.filter((r) => !RULES.some((x) => x.id === r));
    if (unknown.length) throw usage(`Unknown rule(s): ${unknown.join(", ")}. Run uxg scan --rules.`);
  }

  const root = resolve(positionals[0] ?? ".");
  try {
    if (!statSync(root).isDirectory()) throw new Error();
  } catch {
    throw usage(`Not a folder: ${root}`);
  }

  const files = [...walk(root)];
  const platforms = detectPlatforms(root, files);
  const exts = new Set(RULES.flatMap((r) => r.exts));
  let scanned = 0;
  const findings = [];
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!exts.has(ext) || /\.min\.(js|css)$/.test(file)) continue;
    let text;
    try {
      if (statSync(file).size > MAX_FILE_BYTES) continue;
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    scanned++;
    for (const f of scanText(text, ext, { platforms: platforms.map((p) => p.key) })) {
      if (ORDER[f.severity] > ORDER[values.min]) continue;
      if (values.rule && !values.rule.includes(f.rule)) continue;
      findings.push({ ...f, file: relative(root, file) });
    }
  }
  findings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.rule.localeCompare(b.rule) || a.file.localeCompare(b.file) || a.line - b.line);

  const counts = { high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;

  if (values.json) {
    return { output: JSON.stringify({ root, scannedFiles: scanned, platforms, counts, findings }, null, 2), code: 0 };
  }

  const lines = [];
  lines.push(`Scanned ${scanned} source file(s) in ${root}.`);
  if (platforms.length) {
    lines.push("", "Platforms detected, and the guidelines to check against:");
    for (const p of platforms) {
      lines.push(`- ${p.name} (${p.evidence.join("; ")})`);
      for (const [title, url] of p.guidelines) lines.push(`  - ${title}: ${url}`);
    }
  } else {
    lines.push("", "No known UI platform detected.");
  }
  lines.push("", `Candidates: ${counts.high} high, ${counts.medium} medium, ${counts.low} low.`);

  const byRule = new Map();
  for (const f of findings) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule).push(f);
  }
  for (const [, list] of byRule) {
    const r = list[0];
    lines.push("", `[${r.severity}] ${r.title} (${r.rule}), ${list.length} place(s)`, `  Why: ${r.principle}`, `  Fix: ${r.fix}`);
    for (const f of list.slice(0, limit)) lines.push(`  - ${f.file}:${f.line}  ${f.snippet}`);
    if (list.length > limit) lines.push(`  - and ${list.length - limit} more`);
  }
  lines.push(
    "",
    "These are candidates from static checks. Confirm each in the code and the running UI.",
    "Not covered by static checks: flows, copy quality, visual hierarchy, layout at each width. Use a review for those.",
  );
  return { output: lines.join("\n"), code: 0 };
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
