#!/usr/bin/env node
// Builds directory submission archives that follow each directory's rules.
//
//   node scripts/build-submission.mjs openai
//     Skills-only archive for the OpenAI plugin portal (platform.openai.com/plugins).
//     Rules checked 2026-11-22 (developers.openai.com/plugins/guides/submit-claude-plugin):
//     .claude-plugin/plugin.json with a description and skills/<name>/SKILL.md at the root;
//     no lifecycle hooks; no userConfig; Claude-specific wording made provider-neutral;
//     commands and agents converted or left out.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2];
if (target !== "openai") {
  console.error("Usage: node scripts/build-submission.mjs openai");
  process.exit(2);
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const out = join(ROOT, "dist");
const stage = join(out, "ux-grandmaster");
rmSync(stage, { recursive: true, force: true });
mkdirSync(join(stage, ".claude-plugin"), { recursive: true });

// Manifest without hooks, userConfig or Claude-only fields.
const manifest = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));
for (const k of ["hooks", "userConfig", "network"]) delete manifest[k];
writeFileSync(join(stage, ".claude-plugin", "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");

// Skills, with the Claude-only path variable replaced by the neutral relative path.
const NOTE_CLAUDE =
  /> \*\*Running `uxg`:\*\* `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/uxg\.mjs" <command>`\. If `\$\{CLAUDE_PLUGIN_ROOT\}` is not filled in on your platform, the script is `\.\.\/\.\.\/scripts\/uxg\.mjs` from this skill's folder\./g;
const NOTE_NEUTRAL = "> **Running `uxg`:** `node <this skill's folder>/../../scripts/uxg.mjs <command>`.";
for (const name of readdirSync(join(ROOT, "skills"))) {
  const src = join(ROOT, "skills", name);
  const dst = join(stage, "skills", name);
  cpSync(src, dst, { recursive: true });
  const file = join(dst, "SKILL.md");
  let text = readFileSync(file, "utf8").replace(NOTE_CLAUDE, NOTE_NEUTRAL);
  text = text.replace(/In Claude Code the path is `\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/uxg\.mjs`\. /g, "");
  writeFileSync(file, text);
}

// The helper scripts the skills run (no tests, no build tools), and public files.
cpSync(join(ROOT, "scripts", "uxg.mjs"), join(stage, "scripts", "uxg.mjs"));
cpSync(join(ROOT, "scripts", "lib"), join(stage, "scripts", "lib"), { recursive: true });
cpSync(join(ROOT, "scripts", "commands"), join(stage, "scripts", "commands"), { recursive: true });
for (const f of ["README.md", "LICENSE", "assets/icon.png"]) cpSync(join(ROOT, f), join(stage, f), { recursive: true });

// The Claude Code platform note is not useful in other agents.
rmSync(join(stage, "skills", "using-ux-grandmaster", "references", "claude-code.md"), { force: true });

// Fail if anything Claude-only is left.
const leftovers = spawnSync("grep", ["-rlE", "CLAUDE_PLUGIN_ROOT|user_config\\.", join(stage, "skills")], { encoding: "utf8" }).stdout.trim();
if (leftovers) {
  console.error(`Claude-only references remain in:\n${leftovers}`);
  process.exit(1);
}

const zip = join(out, `ux-grandmaster-${pkg.version}-openai.zip`);
rmSync(zip, { force: true });
const r = spawnSync("zip", ["-qr", zip, "ux-grandmaster"], { cwd: out });
if (r.status !== 0) {
  console.error("zip failed. Install zip, or compress dist/ux-grandmaster by hand.");
  process.exit(1);
}
console.log(`Wrote ${zip}`);
console.log(existsSync(zip) ? "Upload it at https://platform.openai.com/plugins (Create plugin > Skills only)." : "");
