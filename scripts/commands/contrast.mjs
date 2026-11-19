// uxg contrast: WCAG 2.2 ratio and APCA Lc for color pairs or a token file.

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { evaluatePair, formatRatio } from "../lib/color.mjs";
import { loadTokens, matchTokens } from "../lib/tokens.mjs";

export const help = `Usage:
  uxg contrast <foreground> <background> [options]
  uxg contrast --tokens <file> --fg <glob> --bg <glob> [options]
  uxg contrast --pairs <pairs.json> [--tokens <file>] [options]

Checks WCAG 2.2 contrast (the pass bar) and reports APCA Lc (informational).

Options:
  --kind <text|large|ui>   What the foreground is. Default: text.
                           text: normal text, needs 4.5:1 for AA.
                           large: 24px and up, or 18.66px bold and up, needs 3:1.
                           ui: borders, icons, focus rings, needs 3:1 (1.4.11).
  --backdrop <color>       Opaque color behind a translucent background. Default: #ffffff.
  --tokens <file>          CSS file with custom properties, or DTCG JSON. Repeatable:
                           later files override earlier ones (base, then theme).
  --selector <text>        Only read CSS blocks whose selector contains this text.
  --fg <glob>              Foreground token names, * is a wildcard. Repeatable.
  --bg <glob>              Background token names, * is a wildcard. Repeatable.
                           For CSS tokens, leave out the leading "--" (lw-text-*),
                           or write --fg=--lw-text-*.
  --pairs <file>           JSON array of the pairs that actually appear in the UI:
                           [{"fg": "lw-text-default", "bg": "lw-fill-surface-canvas",
                             "kind": "text", "backdrop": "...", "note": "..."}]
                           fg, bg and backdrop may be token names or colors.
  --only-failures          List failing pairs only.
  --json                   Print JSON instead of a table.

Exit codes: 0 all pairs pass AA, 1 at least one fails, 2 usage or input error.

Examples:
  uxg contrast "#6b7280" "#ffffff"
  uxg contrast --tokens tokens.css --fg "lw-text-*" --bg "lw-fill-surface-*"`;

export function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      kind: { type: "string", default: "text" },
      backdrop: { type: "string", default: "#ffffff" },
      tokens: { type: "string", multiple: true },
      selector: { type: "string" },
      pairs: { type: "string" },
      fg: { type: "string", multiple: true },
      bg: { type: "string", multiple: true },
      "only-failures": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { output: help, code: 0 };

  const opts = { kind: values.kind, backdrop: values.backdrop };
  const results = [];
  const skipped = [];

  if (values.pairs) {
    let list;
    try {
      list = JSON.parse(readFileSync(values.pairs, "utf8"));
    } catch (err) {
      throw new UsageError(`Cannot read pairs file "${values.pairs}": ${err.message}`);
    }
    if (!Array.isArray(list)) throw new UsageError("The pairs file must be a JSON array.");
    const tokens = values.tokens ? loadTokens(values.tokens, { selector: values.selector }) : null;
    const value = (name) => {
      if (!tokens) return name;
      const key = tokens.has(name) ? name : tokens.has(`--${name}`) ? `--${name}` : null;
      return key ? tokens.get(key) : name;
    };
    for (const [i, p] of list.entries()) {
      if (!p?.fg || !p?.bg) throw new UsageError(`Pair ${i + 1} needs "fg" and "bg".`);
      try {
        const r = evaluatePair(value(p.fg), value(p.bg), {
          kind: p.kind ?? opts.kind,
          backdrop: p.backdrop ? value(p.backdrop) : opts.backdrop,
        });
        results.push({ ...r, foreground: p.fg, background: p.bg, note: p.note });
      } catch (err) {
        skipped.push(`${p.fg} on ${p.bg}: ${err.message}`);
      }
    }
  } else if (values.tokens) {
    if (!values.fg?.length || !values.bg?.length) {
      throw new UsageError("With --tokens, give at least one --fg and one --bg glob, or a --pairs file.");
    }
    const tokens = loadTokens(values.tokens, { selector: values.selector });
    // CSS names start with "--", which shells and argument parsers read as options,
    // so names may be given without the leading dashes.
    const find = (g) => {
      const direct = matchTokens(tokens, g);
      return direct.length || g.startsWith("--") ? direct : matchTokens(tokens, `--${g}`);
    };
    const fgs = unique(values.fg.flatMap(find));
    const bgs = unique(values.bg.flatMap(find));
    if (!fgs.length) throw new UsageError(`No foreground tokens match ${values.fg.join(", ")}`);
    if (!bgs.length) throw new UsageError(`No background tokens match ${values.bg.join(", ")}`);
    for (const f of fgs) {
      for (const b of bgs) {
        try {
          const r = evaluatePair(tokens.get(f), tokens.get(b), opts);
          results.push({ ...r, foreground: f, background: b });
        } catch (err) {
          skipped.push(`${f} on ${b}: ${err.message}`);
        }
      }
    }
    if (!results.length) {
      throw new UsageError(`No pair could be measured.\n${skipped.slice(0, 5).join("\n")}`);
    }
  } else {
    if (positionals.length !== 2) {
      throw new UsageError("Give two colors, or use --tokens with --fg and --bg.");
    }
    results.push(evaluatePair(positionals[0], positionals[1], opts));
  }

  const failures = results.filter((r) => !r.passAA);
  const shown = values["only-failures"] ? failures : results;
  const code = failures.length ? 1 : 0;

  if (values.json) {
    return {
      output: JSON.stringify(
        {
          standard: "WCAG 2.2",
          kind: opts.kind,
          checked: results.length,
          failures: failures.length,
          skipped,
          pairs: shown,
        },
        null,
        2,
      ),
      code,
    };
  }

  const lines = [
    `| Foreground | Background | Ratio | Needs (AA) | AA | AAA | APCA Lc |`,
    `|---|---|---|---|---|---|---|`,
    ...shown.map(
      (r) =>
        `| ${label(r.foreground, r.resolvedForeground)} | ${label(r.background, r.resolvedBackground)} | ` +
        `${formatRatio(r.ratio)}:1 | ${r.requiredAA}:1 | ${r.passAA ? "pass" : "FAIL"} | ` +
        `${r.passAAA === null ? "n/a" : r.passAAA ? "pass" : "fail"} | ${r.apcaLc.toFixed(1)} |`,
    ),
    "",
    `Checked ${results.length} pair(s) as ${opts.kind}. WCAG 2.2 AA failures: ${failures.length}.` +
      (results.some((r) => r.composited) ? ` Translucent colors were composited over ${opts.backdrop}.` : ""),
    `APCA Lc is informational. WCAG 2.2 AA is the pass bar.`,
    ...(skipped.length
      ? [`Skipped ${skipped.length} pair(s) that are not plain colors:`, ...skipped.map((s) => `- ${s}`)]
      : []),
  ];
  return { output: lines.join("\n"), code };
}

function label(name, hex) {
  return name.toLowerCase() === hex ? `\`${hex}\`` : `\`${name}\` (${hex})`;
}

function unique(list) {
  return [...new Set(list)];
}

export class UsageError extends Error {}
