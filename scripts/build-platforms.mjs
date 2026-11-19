#!/usr/bin/env node
// Generates every platform manifest and platform-specific copy from the single
// sources of truth: package.json (version), skills/, agents/ and hooks/.
// Run `node scripts/build-platforms.mjs` after changing those, and
// `node scripts/build-platforms.mjs --check` in CI to fail on drift.
//
// Formats were checked against each platform's official docs on 2026-11-19.
// See docs/platforms.md for the sources.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

const META = {
  name: "ux-grandmaster",
  displayName: "UX Grandmaster",
  version: pkg.version,
  description:
    "A design methodology for AI agents: frame the problem, research, design with your system, get an independent critique, prove accessibility, then hand off.",
  author: { name: "Kemal Salih Carfi", url: "https://kscarfi.com" },
  homepage: "https://github.com/kscarfi/ux-grandmaster",
  repository: "https://github.com/kscarfi/ux-grandmaster",
  license: "MIT",
  keywords: ["design", "ux", "ui", "accessibility", "research", "design-systems", "critique", "wcag"],
};

const OWNER = { name: "Kemal Salih Carfi", url: "https://kscarfi.com" };

const BOOTSTRAP = `UX Grandmaster is installed. It is a design methodology: frame the problem, research, explore directions, design inside the team's design system, get an independent critique, prove accessibility, verify, hand off and measure.

For any task that designs, reviews, researches or measures a user-facing product, screen, flow, component or UX copy, use the skill "using-ux-grandmaster" first. It describes how to size the task (quick fix, single screen, full project) and which skill to use next. Unrelated tasks do not need it.`;

const COMMANDS = {
  brief: "Frame a design problem and write an approved design brief",
  research: "Plan design research or run sourced desk research",
  critique: "Get an independent, severity-ranked critique of a design",
  a11y: "Audit a design or page against WCAG 2.2 AA",
  handoff: "Prepare a developer handoff spec with acceptance criteria",
};

const json = (o) => JSON.stringify(o, null, 2) + "\n";
const files = new Map();
const put = (path, content) => files.set(path, content);

// Claude Code
const claudeManifestPath = ".claude-plugin/plugin.json";
const claudeExisting = existsSync(join(ROOT, claudeManifestPath))
  ? JSON.parse(readFileSync(join(ROOT, claudeManifestPath), "utf8"))
  : {};
put(claudeManifestPath, json({ ...META, userConfig: claudeExisting.userConfig }));
put(
  ".claude-plugin/marketplace.json",
  json({
    name: "ux-grandmaster",
    description: "UX Grandmaster: a design methodology plugin for AI agents.",
    owner: OWNER,
    plugins: [{ name: META.name, source: "./", description: META.description }],
  }),
);

// Agent Plugins 1.1.0 (Codex, Cursor, GitHub Copilot, VS Code, Kiro)
put(
  "plugin.json",
  json({ $schema: "https://agent-plugins.org/schemas/1.1.0/plugin.schema.json", ...META }),
);

// Codex marketplace
put(
  ".agents/plugins/marketplace.json",
  json({
    name: "ux-grandmaster",
    owner: OWNER,
    plugins: [{ name: META.name, source: "./", description: META.description }],
  }),
);

// GitHub Copilot: agents as .agent.md under its extension namespace, marketplace in .github/plugin
const agents = readdirSync(join(ROOT, "agents")).filter((f) => f.endsWith(".md"));
for (const a of agents) {
  put(`com.github.copilot/agents/${a.replace(/\.md$/, ".agent.md")}`, readFileSync(join(ROOT, "agents", a), "utf8"));
}
put(
  ".github/plugin/marketplace.json",
  json({
    name: "ux-grandmaster",
    owner: OWNER,
    plugins: [{ name: META.name, source: "./", description: META.description }],
  }),
);

// Cursor: its own manifest so it also loads agents and the always-on rule
put(
  ".cursor-plugin/plugin.json",
  json({
    name: META.name,
    description: META.description,
    version: META.version,
    author: { name: META.author.name },
    homepage: META.homepage,
    repository: META.repository,
    license: META.license,
    keywords: META.keywords,
    skills: "./skills/",
    agents: "./agents/",
    rules: "./rules/",
  }),
);
put(
  ".cursor-plugin/marketplace.json",
  json({ name: "ux-grandmaster", owner: OWNER, plugins: [{ name: META.name, source: "./", description: META.description }] }),
);

// Always-on rule for Cursor and Antigravity
put(
  "rules/AGENTS.md",
  `---\ndescription: Use UX Grandmaster on design work\nalwaysApply: true\n---\n\n${BOOTSTRAP}\n`,
);

// Antigravity
put(
  ".antigravity-plugin/plugin.json",
  json({
    $schema: "https://antigravity.google/schemas/v1/plugin.json",
    name: META.name,
    displayName: META.displayName,
    description: META.description,
    version: META.version,
    author: META.author,
    homepage: META.homepage,
    repository: META.repository,
    license: META.license,
    keywords: META.keywords,
    suggestedPrompts: [
      "Help me frame this design problem before we design anything",
      "Critique this screen and rank the issues by severity",
      "Audit this page against WCAG 2.2 AA",
    ],
  }),
);

// Gemini CLI: manifest, context file and TOML commands
put(
  "gemini-extension.json",
  json({ name: META.name, version: META.version, description: META.description, contextFileName: "GEMINI.md" }),
);
put("GEMINI.md", `# UX Grandmaster\n\n${BOOTSTRAP}\n\nSkills are in the \`skills/\` folder of this extension.\n`);
for (const [name, description] of Object.entries(COMMANDS)) {
  put(
    `commands/${name}.toml`,
    `description = "${description}"\nprompt = """\nUse the "${name}" skill from UX Grandmaster on this request: {{args}}\n"""\n`,
  );
}

// Factory Droid
put(
  ".factory-plugin/plugin.json",
  json({ name: META.name, description: META.description, version: META.version, author: META.author, license: META.license }),
);

// Write or check
const check = process.argv.includes("--check");
const drift = [];
for (const [path, content] of files) {
  const full = join(ROOT, path);
  const current = existsSync(full) ? readFileSync(full, "utf8") : null;
  if (current === content) continue;
  if (check) drift.push(path);
  else {
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
}
if (check) {
  if (drift.length) {
    console.error(`Out of date. Run node scripts/build-platforms.mjs. Files:\n${drift.map((d) => `- ${d}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`All ${files.size} platform files are up to date.`);
} else {
  console.log(`Wrote ${files.size} platform files for version ${META.version}.`);
}
