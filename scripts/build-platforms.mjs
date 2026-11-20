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

const BOOTSTRAP = `UX Grandmaster is installed: a design methodology plugin (frame, research, explore, design inside the design system and platform guidelines, independent critique, measured accessibility, verify, hand off, measure).

When a request involves designing, building, reviewing, critiquing, auditing or polishing anything a user sees (a screen, page, flow, component, app or UX copy), or analyzing UX data, the first step is to load the "using-ux-grandmaster" skill, before writing any design, code or review. That skill sizes the task and names the next skill. A request like "design a screen" with no information about its users starts with framing questions, not a finished screen. Requests with no user-facing part (backend, data pipelines, infrastructure) do not use it.`;

const COMMANDS = {
  brief: "Frame a design problem and write an approved design brief",
  research: "Plan design research or run sourced desk research",
  critique: "Get an independent, severity-ranked critique of a design",
  a11y: "Audit a design or page against WCAG 2.2 AA",
  handoff: "Prepare a developer handoff spec with acceptance criteria",
  "ux-check": "Find UX and accessibility problems in this code, with file and line",
};

const json = (o) => JSON.stringify(o, null, 2) + "\n";
const files = new Map();
const put = (path, content) => files.set(path, content);

// Claude Code
const claudeManifestPath = ".claude-plugin/plugin.json";
const claudeExisting = existsSync(join(ROOT, claudeManifestPath))
  ? JSON.parse(readFileSync(join(ROOT, claudeManifestPath), "utf8"))
  : {};
// Claude Code hooks live in .claude-plugin/hooks.json, not hooks/hooks.json, because Gemini CLI,
// Cursor and Codex read hooks/hooks.json by default and would run a Claude-only command.
put(claudeManifestPath, json({ ...META, hooks: "./.claude-plugin/hooks.json", userConfig: claudeExisting.userConfig }));
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
  // Agent Plugins 1.0.0, not 1.1.0: Codex CLI 0.170 rejects 1.1.0 manifests, and 1.0.0 has no displayName.
  json({ $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json", ...(({ displayName, ...rest }) => rest)(META) }),
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
    logo: "assets/icon.png",
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
    logo: "assets/icon.svg",
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
