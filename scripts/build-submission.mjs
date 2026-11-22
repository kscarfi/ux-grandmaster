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
if (target === "claude-directory") {
  await buildClaudeDirectory();
  process.exit(0);
}
if (target !== "openai") {
  console.error("Usage: node scripts/build-submission.mjs openai|claude-directory");
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

// ---------------------------------------------------------------------------
// Claude directory edition (claude.ai/directory/manage).
// Organizations that are not Verified may submit text-only plugins: no hooks,
// scripts, package.json or lockfiles, and only Markdown, text, JSON, YAML and
// PNG-like images (rules shown by the portal on 2026-11-22). This edition keeps
// every skill and agent, and tells the agent to measure with the tools it has
// when the uxg scripts are not installed.
async function buildClaudeDirectory() {
  const stage = join(ROOT, "dist", "claude-directory");
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(join(stage, ".claude-plugin"), { recursive: true });
  mkdirSync(join(stage, "assets"), { recursive: true });

  const m = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));
  const manifest = {
    name: m.name, displayName: m.displayName, version: m.version, description: m.description,
    author: m.author, homepage: m.homepage, repository: m.repository, license: m.license, keywords: m.keywords,
    icon: m.icon, documentationUrl: m.documentationUrl, supportUrl: m.supportUrl, privacyPolicyUrl: m.privacyPolicyUrl, termsOfServiceUrl: m.termsOfServiceUrl,
  };
  writeFileSync(join(stage, ".claude-plugin", "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");

  const EDITION_NOTE =
    "> **Measuring:** this edition has no helper scripts. Where a step says `uxg <command>`, do the same measurement with a tool you have (a short script you write, a browser or design tool check) and say how each number was produced. The full edition, with the `uxg` scripts, is at https://github.com/kscarfi/ux-grandmaster.";
  const RUN_NOTE = /> \*\*Running `uxg`:\*\*[^\n]*/g;

  cpSync(join(ROOT, "skills"), join(stage, "skills"), { recursive: true });
  cpSync(join(ROOT, "agents"), join(stage, "agents"), { recursive: true });
  for (const name of readdirSync(join(stage, "skills"))) {
    const file = join(stage, "skills", name, "SKILL.md");
    let t = readFileSync(file, "utf8").replace(RUN_NOTE, EDITION_NOTE);
    if (name === "using-ux-grandmaster") {
      t = t.replace(/Find it once per session:[^\n]*\n/, EDITION_NOTE + "\n");
      t = t.replace(/UX Grandmaster ships one command-line helper, `uxg`[^\n]*\n/, "The full edition of UX Grandmaster ships a command-line helper, `uxg`. This edition does not. The table says what each command measures, so you can do the same with the tools you have.\n");
      t = t.replace(/\| `setup` \|[^\n]*\n/, "");
      t = t.replace(/If Node\.js is not available[^\n]*\n/, "");
      t = t.replace(/If the user has set up a design library \(see `uxg library status`\)[^\n]*\n/, "If the user has a design library and the full edition's `uxg library` is installed, search it when a decision needs a principle or a source. Cite title and page. Paraphrase; quote at most a sentence. Never paste library text into files the user will commit, publish or share.\n");
    }
    if (name === "designing-in-figma") {
      t = t.replace(/2\. \*\*Figma REST API\*\*[\s\S]*?(?=3\. \*\*Neither:\*\*)/, "");
      t = t.replace("3. **Neither:**", "2. **No Figma server:**");
    }
    t = t.replace(/`uxg setup`[^.]*\./g, "a browser tool.");
    writeFileSync(file, t);
  }
  for (const f of ["codex.md", "cursor.md", "copilot.md", "gemini-cli.md", "antigravity.md", "other-agents.md"]) {
    rmSync(join(stage, "skills", "using-ux-grandmaster", "references", f), { force: true });
  }
  {
    const f = join(stage, "skills", "using-ux-grandmaster", "SKILL.md");
    const t = readFileSync(f, "utf8").replace(/## 8\. Platform differences[\s\S]*$/, "## 8. Platform notes\n\nRead [references/claude-code.md](references/claude-code.md) once per session for subagents, questions and short commands.\n");
    writeFileSync(f, t);
  }
  writeFileSync(
    join(stage, "skills", "using-ux-grandmaster", "references", "claude-code.md"),
    "# Claude Code\n\n- **Subagents:** start them with the Agent tool (named Task in some versions): `ux-grandmaster:design-critic`, `ux-grandmaster:accessibility-auditor`, `ux-grandmaster:research-scout`, `ux-grandmaster:usability-walker`.\n- **Questions:** use the question tool (AskUserQuestion) for one framing question at a time.\n- **Short commands:** `/ux-grandmaster:brief`, `/ux-grandmaster:research`, `/ux-grandmaster:critique`, `/ux-grandmaster:a11y`, `/ux-grandmaster:handoff`, `/ux-grandmaster:ux-check`.\n- **Figma:** use the Figma MCP tools if they are connected.\n",
  );

  cpSync(join(ROOT, "assets", "icon.png"), join(stage, "assets", "icon.png"));
  cpSync(join(ROOT, "LICENSE"), join(stage, "LICENSE"));
  writeFileSync(
    join(stage, "README.md"),
    `# UX Grandmaster\n\nA design methodology for AI agents. UX Grandmaster makes Claude work like a senior product designer: it frames the problem before designing, uses evidence, designs inside your design system and your platform's guidelines, gets an independent critique, checks accessibility against WCAG 2.2 AA, and refines everything it generates before you see it.\n\nFor designers at every level, developers checking their own apps, researchers, and design leaders: ${readdirSync(join(stage, "skills")).length} skills and 4 subagents, chosen automatically from your message and what you attach (a Figma link, a screenshot, code, interview notes, a CSV).\n\nThis is the directory edition: skills and agents only. The full edition adds the \`uxg\` scripts (contrast, axe, code scan, Figma REST, funnel and A/B statistics), a session hook and the eval suite: https://github.com/kscarfi/ux-grandmaster\n\nDesigned and directed by Kemal Salih Carfi. MIT License.\n`,
  );

  const bad = spawnSync("grep", ["-rlE", "CLAUDE_PLUGIN_ROOT|FIGMA_TOKEN|scripts/uxg\\.mjs|npm install|npx ", stage], { encoding: "utf8" }).stdout.trim();
  if (bad) {
    console.error(`Not allowed in the directory edition, found in:\n${bad}`);
    process.exit(1);
  }
  console.log(`Wrote ${stage}`);
}
