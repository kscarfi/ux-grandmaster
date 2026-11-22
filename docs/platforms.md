# Platform support

UX Grandmaster keeps every skill and agent once: skills in `skills/`, agents in `agents/`. Platform files are thin manifests, plus copies generated from those sources where a platform needs a different file name or folder. A platform is listed as supported only after its format is checked against its official docs and an install is tested on that platform.

Status values:

- **Verified format:** the manifest format was read in the platform's official docs on the date shown.
- **Install tested:** the plugin was installed and a skill fired on that platform.
- **Pending:** not checked yet.

## Shared layout

| File | Read by | Notes |
|---|---|---|
| `plugin.json` (root) | Agent Plugins clients: Codex, Cursor, GitHub Copilot, VS Code, Kiro | [Agent Plugins](https://agent-plugins.org) 1.0.0 (see the install findings below for why not 1.1.0). Closed manifest: `$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`. No component paths. |
| `skills/<name>/SKILL.md` | Every platform | Must follow the [Agent Skills specification](https://agentskills.io/specification). |
| `agents/<name>.md` | Claude Code, Cursor, Antigravity, Gemini CLI (preview) | Source of truth for subagents. Copied to other names where a platform needs them. |
| `.claude-plugin/` (manifest, marketplace, hooks) | Claude Code; also read by Copilot (legacy), Factory Droid and Codex as a fallback marketplace | Claude Code reads this manifest before the root one. |
| `assets/icon.png` | Agent Plugins clients and the Claude plugin directory | Square PNG. Agent Plugins recommends 512 px; the Claude directory accepts 512 to 2048 px. |

## Hooks: why there is no root `hooks.json`

Platforms disagree on hook files with the same name:

| File | Claude Code | Cursor | Codex | Antigravity | Agent Plugins core |
|---|---|---|---|---|---|
| `hooks.json` (root) | not read | not read | not read | its own format (named groups) | portable format (`$schema`, `command`, `args`) |
| `hooks/hooks.json` | read by default | Cursor format, `sessionStart` | read by default | not read | not read |

One file cannot satisfy all of them. So the only hook, the session-start bootstrap, is delivered per platform:

- **Claude Code:** `.claude-plugin/hooks.json`, named in the Claude manifest. There is deliberately no `hooks/hooks.json`.
- **Cursor:** a path set in `.cursor-plugin/plugin.json`, pointing to a Cursor-format file.
- **Codex:** a path set in `extensions.com.openai.hooks` in the root manifest.
- **GitHub Copilot (Agent Plugins mode):** `com.github.copilot/hooks/hooks.json`.
- **Antigravity:** no hook. `rules/AGENTS.md` is always on and carries the same bootstrap text.
- **Gemini CLI:** no hook. The context file named in `gemini-extension.json` carries the bootstrap text.
- **Everyone else:** the `using-ux-grandmaster` skill's description makes it load at the start of design work.

## Platforms

Install tests ran on 2026-11-20 on macOS, each CLI in an empty home folder, installing from a local clone of this repository. Skill counts below are from 1.0.0 (31 skills); 1.1.0 has 40. Rechecked on 2026-11-22 from GitHub: Claude Code 1.0.0 install, and GitHub Copilot CLI 1.1.0 install with 40 skills and no warnings.

| Platform | How it loads UX Grandmaster | Install command | Install test (2026-11-20) |
|---|---|---|---|
| Claude Code 2.1.328 | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, hooks in `.claude-plugin/hooks.json` | `/plugin marketplace add kscarfi/ux-grandmaster`, then `/plugin install ux-grandmaster@ux-grandmaster` | Pass: `claude plugin validate` passes; 31 skills, 4 agents, session hook; evals run against it. |
| Codex CLI 0.170.0 | Root `plugin.json` (Agent Plugins 1.0.0); marketplace in `.agents/plugins/marketplace.json` | `codex plugin marketplace add kscarfi/ux-grandmaster`, then `codex plugin add ux-grandmaster@ux-grandmaster` | Pass: installed, 31 skills, `scripts/uxg.mjs` runs from the installed copy. |
| GitHub Copilot CLI 1.0.114 | Root `plugin.json` (Agent Plugins 1.0.0); agents in `com.github.copilot/agents/`; marketplace in `.github/plugin/marketplace.json` | `copilot plugin marketplace add kscarfi/ux-grandmaster`, then `copilot plugin install ux-grandmaster@ux-grandmaster` | Pass: 31 skills, no warnings. Agents not checked (needs a signed-in session). |
| Gemini CLI 0.70.0 | `gemini-extension.json`, `GEMINI.md`, `commands/*.toml` | `gemini extensions install https://github.com/kscarfi/ux-grandmaster` | Pass: `gemini extensions validate` passes; 31 skills and the context file load. |
| Qwen Code 0.28.0 | Reads the Gemini extension | `qwen extensions install https://github.com/kscarfi/ux-grandmaster` | Pass: 31 skills. |
| Antigravity CLI | `.antigravity-plugin/plugin.json`, `agents/`, `rules/AGENTS.md` | `agy plugin install https://github.com/kscarfi/ux-grandmaster` | Pass: 31 skills, 4 agents, 1 always-on rule; short commands converted to skills. `--strict` lists three expected warnings: `GEMINI.md`, `commands/` and the root `plugin.json` are for other platforms. |
| Factory Droid | `.factory-plugin/plugin.json`; marketplace from `.claude-plugin/marketplace.json` | `droid plugin marketplace add https://github.com/kscarfi/ux-grandmaster`, then `droid plugin install ux-grandmaster@ux-grandmaster` | Pass: installed and enabled, 31 skills in the plugin cache. |
| OpenCode 1.19.6 | Skills folder added in `opencode.json` | Clone the repository, then add its `skills` folder to `"skills"` in `opencode.json` | Pass: `opencode debug skill` lists all 31 skills. |
| Cursor | `.cursor-plugin/plugin.json` (skills, agents, always-on rule); `.cursor-plugin/marketplace.json` | Cursor plugin marketplace | Not tested: the Cursor CLI needs a signed-in account to add a marketplace. Format verified against the docs. |
| VS Code agent plugins, Kiro | Root `plugin.json` (Agent Plugins 1.0.0) | Per client | Not tested. |
| Kimi Code, Devin CLI, Pi, Hermes Agent, Grok Build CLI | Agent Skills from `skills/` | Per client | Not tested. Any client that reads Agent Skills can load the `skills/` folder. |

Findings from the install tests:

- Codex CLI 0.170 rejects Agent Plugins 1.1.0 manifests ("missing or invalid plugin.json") and accepts 1.0.0. The root manifest targets 1.0.0, which has no `displayName`; Copilot also warned about `displayName`.
- Gemini CLI, Cursor and Codex read `hooks/hooks.json` by default. Claude Code's hook therefore lives in `.claude-plugin/hooks.json`, named in the Claude manifest, so other agents never run a Claude-only command.
- Copilot CLI marks direct installs from a path or repository as deprecated; install through the marketplace.

Notes from the docs:

- Codex runs plugin hooks only for plugins installed manually in the desktop app, after the user trusts them; plugins with hooks are not eligible for its public directory.
- Gemini CLI was replaced by Antigravity CLI for unpaid and Google One users on 2026-06-18; Gemini CLI extensions still exist for other users.
- Antigravity ignores `mcp.json` and `.mcp.json`; it reads `mcp_config.json`.

## Capability gaps

Subagents, hooks and slash commands are not part of the portable Agent Plugins core. Every skill says what to do when a capability is missing. For example, when subagents are not available, the critique runs inline with a fresh-eyes checklist and says so in its report.

## Claude directory edition

The Claude directory (claude.ai/directory/manage) accepts only text plugins from organizations that are not Verified: no hooks, scripts, `package.json` or lockfiles. On 2026-11-22 the portal blocked the full repository for these reasons. The `claude-directory` branch holds a text-only edition with every skill and agent, built by `npm run build:directory`; in that edition the skills measure with the tools the agent has instead of the `uxg` scripts. To update it, run the build and replace the branch contents with `dist/claude-directory/`.

## Directory submissions (2026-11-22)

| Directory | How | Status |
|---|---|---|
| Claude directory | Developer portal, `claude-directory` branch (text-only edition) | In review |
| Cursor Marketplace | Publisher application form | Submitted |
| GitHub Copilot (awesome-copilot) | External plugin issue, tag `v1.1.0` | Submitted: github/awesome-copilot#6565 |
| Antigravity Marketplace | Interest form | Submitted |
| Gemini CLI extension gallery | `gemini-cli-extension` repository topic, daily crawl | Waiting for crawl |
| OpenAI (ChatGPT and Codex) | Developer portal, archive from `node scripts/build-submission.mjs openai` | Draft saved; the portal is not accepting skills-only submissions |
| mcp.directory | Submit-skill form, link to `skills/using-ux-grandmaster/SKILL.md` | Submitted |
| Factory | Not open to outside submissions | Users add this repository as a marketplace |
