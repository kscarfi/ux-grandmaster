// uxg sources: a research source log that can be checked for missing dates,
// stale sources and claims that rest on a single source.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_FILE = "research/sources.jsonl";
/** Sources older than this many months are flagged as possibly out of date. */
export const STALE_MONTHS = 24;
const TYPES = ["primary", "secondary"];

export const help = `Usage:
  uxg sources add --claim <id> --url <url> --title <text> --summary <text> --type <primary|secondary> [options]
  uxg sources check [--file <path>] [--json]
  uxg sources render [--file <path>]

Every research claim gets one line per source that supports it. "check" lists
problems: missing fields, sources older than ${STALE_MONTHS} months, and key claims
supported by only one source or by no primary source.

Options for add:
  --claim <id>          Short id for the claim, such as "freeze-card-placement".
  --url <url>           Where the source is.
  --title <text>        Title of the page or document.
  --summary <text>      What the source says, in your own words.
  --type <type>         primary (the original data, product or study) or secondary (someone reporting on it).
  --published <date>    When the source was published or last updated (YYYY-MM-DD), if known.
  --accessed <date>     When you read it (YYYY-MM-DD). Default: today.
  --key                 Mark the claim as key: it needs two sources, at least one primary.
  --file <path>         Log file. Default: ${DEFAULT_FILE}.

Exit codes for check: 0 no problems, 1 problems found, 2 usage error.`;

export function run(argv) {
  const [sub, ...rest] = argv;
  const { values } = parseArgs({
    args: rest,
    options: {
      claim: { type: "string" },
      url: { type: "string" },
      title: { type: "string" },
      summary: { type: "string" },
      type: { type: "string" },
      published: { type: "string" },
      accessed: { type: "string" },
      key: { type: "boolean", default: false },
      file: { type: "string", default: DEFAULT_FILE },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help || !sub) return { output: help, code: sub ? 0 : 2 };

  if (sub === "add") {
    for (const f of ["claim", "url", "title", "summary", "type"]) if (!values[f]) throw usage(`--${f} is required.`);
    if (!TYPES.includes(values.type)) throw usage(`--type must be primary or secondary.`);
    for (const f of ["published", "accessed"]) {
      if (values[f] && !/^\d{4}-\d{2}-\d{2}$/.test(values[f])) throw usage(`--${f} must be YYYY-MM-DD.`);
    }
    const entry = {
      claim: values.claim,
      url: values.url,
      title: values.title,
      summary: values.summary,
      type: values.type,
      published: values.published ?? null,
      accessed: values.accessed ?? new Date().toISOString().slice(0, 10),
      key: values.key,
    };
    mkdirSync(dirname(values.file), { recursive: true });
    if (!existsSync(values.file)) writeFileSync(values.file, "");
    appendFileSync(values.file, JSON.stringify(entry) + "\n");
    return { output: `Added a ${entry.type} source for "${entry.claim}" to ${values.file}.`, code: 0 };
  }

  const entries = load(values.file);

  if (sub === "check") {
    const problems = check(entries);
    if (values.json) return { output: JSON.stringify({ sources: entries.length, problems }, null, 2), code: problems.length ? 1 : 0 };
    if (!problems.length) return { output: `${entries.length} source(s), no problems.`, code: 0 };
    return {
      output: [`${entries.length} source(s), ${problems.length} problem(s):`, ...problems.map((p) => `- ${p}`)].join("\n"),
      code: 1,
    };
  }

  if (sub === "render") {
    const byClaim = group(entries);
    const lines = ["# Sources", ""];
    for (const [claim, list] of byClaim) {
      lines.push(`## ${claim}${list.some((e) => e.key) ? " (key claim)" : ""}`, "");
      for (const e of list) {
        lines.push(
          `- [${e.title}](${e.url}), ${e.type}` +
            `${e.published ? `, published ${e.published}` : ""}, accessed ${e.accessed}: ${e.summary}`,
        );
      }
      lines.push("");
    }
    return { output: lines.join("\n"), code: 0 };
  }

  return { output: `Unknown subcommand "${sub}".\n\n${help}`, code: 2 };
}

export function check(entries, today = new Date()) {
  const problems = [];
  entries.forEach((e, i) => {
    for (const f of ["claim", "url", "title", "summary", "type", "accessed"]) {
      if (!e[f]) problems.push(`Line ${i + 1}: missing ${f}.`);
    }
    const dated = e.published ?? null;
    if (!dated) {
      problems.push(`Line ${i + 1} (${e.claim}): no published date; say "date unknown" when you cite it.`);
    } else {
      const months = (today - new Date(dated)) / (30.44 * 86400000);
      if (months > STALE_MONTHS) {
        problems.push(`Line ${i + 1} (${e.claim}): published ${dated}, older than ${STALE_MONTHS} months. Check for newer data.`);
      }
    }
  });
  for (const [claim, list] of group(entries)) {
    if (!list.some((e) => e.key)) continue;
    const urls = new Set(list.map((e) => e.url));
    if (urls.size < 2) problems.push(`Key claim "${claim}" has ${urls.size} source; it needs at least 2.`);
    if (!list.some((e) => e.type === "primary")) problems.push(`Key claim "${claim}" has no primary source.`);
  }
  return problems;
}

function group(entries) {
  const m = new Map();
  for (const e of entries) {
    if (!m.has(e.claim)) m.set(e.claim, []);
    m.get(e.claim).push(e);
  }
  return m;
}

function load(file) {
  if (!existsSync(file)) throw usage(`No source log at ${file}. Add a source first.`);
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch {
        throw new Error(`Line ${i + 1} of ${file} is not valid JSON.`);
      }
    });
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
