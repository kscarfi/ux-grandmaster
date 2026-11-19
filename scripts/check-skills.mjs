#!/usr/bin/env node
// Checks every skill and agent against the Agent Skills specification and the
// project's own writing rules. Exits 1 with a list of problems.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORTABLE_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const MAX_DESCRIPTION = 1024; // Agent Skills specification
const MAX_LINES = 500; // Agent Skills specification recommendation
const HYPE = /\b(revolutionary|seamless(ly)?|magical|effortless(ly)?|supercharge|game-?changing)\b/i;
const problems = [];

function frontmatter(text, file) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) {
    problems.push(`${file}: no YAML frontmatter at the top`);
    return {};
  }
  const out = {};
  let current = null;
  for (const line of m[1].split("\n")) {
    const top = line.match(/^([A-Za-z][\w-]*):\s?(.*)$/);
    if (top) {
      current = top[1];
      out[current] = top[2];
    } else if (current && /^\s+/.test(line)) {
      out[current] += "\n" + line;
    }
  }
  return out;
}

function checkProse(text, file) {
  if (text.includes("—")) problems.push(`${file}: contains an em dash`);
  const hype = text.match(HYPE);
  // The taste guide lists hype words on purpose.
  if (hype && !file.endsWith("taste.md")) problems.push(`${file}: hype word "${hype[0]}"`);
}

const skillsDir = join(ROOT, "skills");
const skillNames = readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const name of skillNames) {
  const file = join("skills", name, "SKILL.md");
  if (!existsSync(join(ROOT, file))) {
    problems.push(`${file}: missing`);
    continue;
  }
  const text = readFileSync(join(ROOT, file), "utf8");
  const fm = frontmatter(text, file);
  for (const key of Object.keys(fm)) {
    if (!PORTABLE_KEYS.has(key)) problems.push(`${file}: frontmatter key "${key}" is not portable`);
  }
  if (fm.name !== name) problems.push(`${file}: name "${fm.name}" does not match folder "${name}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) problems.push(`${file}: invalid skill name`);
  const desc = (fm.description ?? "").trim();
  if (!desc) problems.push(`${file}: empty description`);
  if (desc.length > MAX_DESCRIPTION) problems.push(`${file}: description is ${desc.length} characters, max ${MAX_DESCRIPTION}`);
  const lines = text.split("\n").length;
  if (lines > MAX_LINES) problems.push(`${file}: ${lines} lines, keep under ${MAX_LINES}`);
  checkProse(text, file);

  // Links to references must exist.
  for (const [, rel] of text.matchAll(/\]\((references\/[^)]+)\)/g)) {
    if (!existsSync(join(ROOT, "skills", name, rel))) problems.push(`${file}: broken link ${rel}`);
  }
  // Backticked skill names must exist.
  for (const [, ref] of text.matchAll(/`([a-z]+(?:-[a-z]+)+)`/g)) {
    if (/^(using|framing|researching|analyzing|synthesizing|writing|mapping|diverging|designing|critiquing|auditing|verifying|receiving|preparing|measuring|building)-/.test(ref) && !skillNames.includes(ref)) {
      problems.push(`${file}: refers to unknown skill \`${ref}\``);
    }
  }
  const refs = join(skillsDir, name, "references");
  if (existsSync(refs)) {
    for (const f of readdirSync(refs)) checkProse(readFileSync(join(refs, f), "utf8"), join("skills", name, "references", f));
  }
}

for (const f of readdirSync(join(ROOT, "agents"))) {
  const file = join("agents", f);
  const text = readFileSync(join(ROOT, file), "utf8");
  const fm = frontmatter(text, file);
  if (!fm.name || !fm.description) problems.push(`${file}: needs name and description`);
  if (fm.name && `${fm.name}.md` !== f) problems.push(`${file}: name "${fm.name}" does not match file name`);
  checkProse(text, file);
}

for (const f of ["README.md", "evals/README.md", "evals/RESULTS.md", "docs/build-log.md", "docs/platforms.md", "docs/roadmap.md", "docs/library.md", "CONTRIBUTING.md", "SECURITY.md"]) {
  if (existsSync(join(ROOT, f))) checkProse(readFileSync(join(ROOT, f), "utf8"), f);
}

if (problems.length) {
  console.error(`${problems.length} problem(s):\n${problems.map((p) => `- ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`${skillNames.length} skills and ${readdirSync(join(ROOT, "agents")).length} agents pass.`);
