#!/usr/bin/env node
// Builds the plugin copy that the figma-link-review eval loads.
//
// claude plugin eval only accepts a plugin shipped with a case if it sits in the
// case's own subdirectory, and an MCP server can only be mocked if the plugin
// under test declares it. So this copies the real skills, agents, hooks and
// scripts into evals/figma-link-review/harness/ and adds a placeholder "figma"
// MCP server, which the case's mocks/ answer. The copy is not committed.
// Run it before that case: node scripts/prepare-eval-harness.mjs

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const H = join(ROOT, "evals", "figma-link-review", "harness");
rmSync(H, { recursive: true, force: true });
mkdirSync(join(H, ".claude-plugin"), { recursive: true });
for (const d of ["skills", "agents", "hooks", "scripts"]) {
  cpSync(join(ROOT, d), join(H, d), { recursive: true, filter: (p) => !p.includes(`${join("scripts", "test")}`) });
}
cpSync(join(ROOT, ".claude-plugin", "hooks.json"), join(H, ".claude-plugin", "hooks.json"));
const manifest = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));
delete manifest.userConfig;
writeFileSync(join(H, ".claude-plugin", "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(
  join(H, ".mcp.json"),
  JSON.stringify({ mcpServers: { figma: { command: "node", args: ["-e", "process.exit(0)"] } } }, null, 2) + "\n",
);
console.log(`Harness ready at ${H}`);
