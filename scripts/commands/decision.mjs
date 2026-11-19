// uxg decision: append design decisions with their evidence to a log in the project.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_FILE = "design/decisions.md";
const CONFIDENCE = ["high", "medium", "low"];
const EVIDENCE = ["research", "data", "principle", "standard", "stakeholder", "assumption"];

export const help = `Usage:
  uxg decision add --title <text> --decision <text> --why <text> --evidence-type <type> [options]
  uxg decision list [--file <path>]

Keeps a decision log so every design choice can be traced to its evidence.

Options for add:
  --title <text>          Short name, such as "Amount field first on transfer".
  --decision <text>       What was decided.
  --why <text>            The reason, in one or two sentences.
  --evidence-type <type>  ${EVIDENCE.join(", ")}.
                          Use "assumption" honestly when there is no evidence yet.
  --source <text>         Where the evidence is: a link, a file, a principle name. Repeatable.
  --alternatives <text>   Options considered and rejected.
  --confidence <level>    ${CONFIDENCE.join(", ")}. Default: medium.
  --revisit <text>        When or what would change this decision.
  --file <path>           Log file. Default: ${DEFAULT_FILE}.

An "assumption" decision must have a --revisit condition.`;

export function run(argv) {
  const [sub, ...rest] = argv;
  const { values } = parseArgs({
    args: rest,
    options: {
      title: { type: "string" },
      decision: { type: "string" },
      why: { type: "string" },
      "evidence-type": { type: "string" },
      source: { type: "string", multiple: true },
      alternatives: { type: "string" },
      confidence: { type: "string", default: "medium" },
      revisit: { type: "string" },
      file: { type: "string", default: DEFAULT_FILE },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help || !sub) return { output: help, code: sub ? 0 : 2 };

  if (sub === "list") {
    if (!existsSync(values.file)) return { output: `No decision log at ${values.file}.`, code: 1 };
    const titles = readFileSync(values.file, "utf8").match(/^## D\d+.*$/gm) ?? [];
    return { output: titles.map((t) => t.replace(/^## /, "")).join("\n") || "The log has no decisions.", code: 0 };
  }

  if (sub !== "add") return { output: `Unknown subcommand "${sub}".\n\n${help}`, code: 2 };

  for (const f of ["title", "decision", "why", "evidence-type"]) {
    if (!values[f]) throw usage(`--${f} is required.`);
  }
  const type = values["evidence-type"];
  if (!EVIDENCE.includes(type)) throw usage(`--evidence-type must be one of: ${EVIDENCE.join(", ")}.`);
  if (!CONFIDENCE.includes(values.confidence)) throw usage(`--confidence must be one of: ${CONFIDENCE.join(", ")}.`);
  if (type === "assumption" && !values.revisit) {
    throw usage('An assumption needs --revisit: what evidence or date would confirm or change it.');
  }
  if (type !== "assumption" && !values.source?.length) {
    throw usage(`Evidence of type "${type}" needs at least one --source.`);
  }

  mkdirSync(dirname(values.file), { recursive: true });
  if (!existsSync(values.file)) {
    writeFileSync(
      values.file,
      "# Design decisions\n\nEach decision names its evidence. Newest last.\n",
    );
  }
  const existing = readFileSync(values.file, "utf8");
  const next = (existing.match(/^## D(\d+)/gm) ?? []).length + 1;
  const id = `D${String(next).padStart(3, "0")}`;
  const date = new Date().toISOString().slice(0, 10);
  const entry = [
    ``,
    `## ${id}: ${oneLine(values.title)}`,
    ``,
    `- **Date:** ${date}`,
    `- **Decision:** ${oneLine(values.decision)}`,
    `- **Why:** ${oneLine(values.why)}`,
    `- **Evidence:** ${type}${values.source?.length ? `: ${values.source.map(oneLine).join("; ")}` : ""}`,
    `- **Confidence:** ${values.confidence}`,
    ...(values.alternatives ? [`- **Alternatives considered:** ${oneLine(values.alternatives)}`] : []),
    ...(values.revisit ? [`- **Revisit when:** ${oneLine(values.revisit)}`] : []),
    ``,
  ].join("\n");
  appendFileSync(values.file, entry);
  return { output: `Logged ${id} in ${values.file}.`, code: 0 };
}

function oneLine(s) {
  return s.replace(/\s+/g, " ").trim();
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
