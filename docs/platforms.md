# Platform support

UX Grandmaster keeps every skill and agent once: skills in `skills/`, agents in `agents/`. Platform files are thin manifests, plus copies generated from those sources where a platform needs a different file name or folder. A platform is listed as supported only after its format is checked against its official docs and an install is tested on that platform.

Status values:

- **Verified format:** the manifest format was read in the platform's official docs on the date shown.
- **Install tested:** the plugin was installed and a skill fired on that platform.
- **Pending:** not checked yet.

## Shared layout

| File | Read by | Notes |
|---|---|---|
| `plugin.json` (root) | Agent Plugins clients: Codex, Cursor, GitHub Copilot, VS Code, Kiro | [Agent Plugins](https://agent-plugins.org) 1.1.0. Closed manifest: `$schema`, `name`, `version`, `displayName`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`. No component paths. |
| `skills/<name>/SKILL.md` | Every platform | Must follow the [Agent Skills specification](https://agentskills.io/specification). |
| `agents/<name>.md` | Claude Code, Cursor, Antigravity, Gemini CLI (preview) | Source of truth for subagents. Copied to other names where a platform needs them. |
| `.claude-plugin/` | Claude Code; also read by Copilot (legacy), Factory Droid and Codex as a fallback marketplace | Claude Code reads this manifest before the root one. |
| `assets/icon.png` | Agent Plugins clients and the Claude plugin directory | Square PNG. Agent Plugins recommends 512 px; the Claude directory accepts 512 to 2048 px. |

## Hooks: why there is no root `hooks.json`

Platforms disagree on hook files with the same name:

| File | Claude Code | Cursor | Codex | Antigravity | Agent Plugins core |
|---|---|---|---|---|---|
| `hooks.json` (root) | not read | not read | not read | its own format (named groups) | portable format (`$schema`, `command`, `args`) |
| `hooks/hooks.json` | Claude format, `SessionStart` | Cursor format, `sessionStart` | read by default | not read | not read |

One file cannot satisfy all of them. So the only hook, the session-start bootstrap, is delivered per platform:

- **Claude Code:** `hooks/hooks.json`.
- **Cursor:** a path set in `.cursor-plugin/plugin.json`, pointing to a Cursor-format file.
- **Codex:** a path set in `extensions.com.openai.hooks` in the root manifest.
- **GitHub Copilot (Agent Plugins mode):** `com.github.copilot/hooks/hooks.json`.
- **Antigravity:** no hook. `rules/AGENTS.md` is always on and carries the same bootstrap text.
- **Gemini CLI:** no hook. The context file named in `gemini-extension.json` carries the bootstrap text.
- **Everyone else:** the `using-ux-grandmaster` skill's description makes it load at the start of design work.

## Platforms

| Platform | Manifest | Install | Format | Install tested |
|---|---|---|---|---|
| Claude Code | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `/plugin marketplace add kscarfi/ux-grandmaster` | Verified 2026-11-19 ([docs](https://code.claude.com/docs/en/plugins-reference)) | Pending |
| Codex (CLI and app) | Root `plugin.json` with `extensions.com.openai`; `.codex-plugin/plugin.json` is the older fallback; marketplace at `.agents/plugins/marketplace.json` | `codex plugin marketplace add kscarfi/ux-grandmaster` | Verified 2026-11-19 ([docs](https://developers.openai.com/codex/plugins/build/)) | Pending |
| Cursor | `.cursor-plugin/plugin.json` (Cursor format, allows agents, rules and hook paths) or root `plugin.json`; marketplace at `.cursor-plugin/marketplace.json` | Marketplace submission | Verified 2026-11-19 ([docs](https://cursor.com/docs/reference/plugins)) | Pending |
| GitHub Copilot CLI | Root `plugin.json` (Agent Plugins); agents in `com.github.copilot/agents/*.agent.md`, hooks in `com.github.copilot/hooks/hooks.json`; marketplace in `.github/plugin/marketplace.json` | `copilot plugin install kscarfi/ux-grandmaster` | Verified 2026-11-19 ([docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)) | Pending |
| VS Code agent plugins | Root `plugin.json` (Agent Plugins) | Pending | Pending ([docs](https://code.visualstudio.com/docs/agents/reference/agent-plugin-reference)) | Pending |
| Antigravity (IDE and CLI) | `.antigravity-plugin/plugin.json` (wins over root); `agents/`, `rules/`, `mcp_config.json`; no commands | `agy plugin install https://github.com/kscarfi/ux-grandmaster` | Verified 2026-11-19 ([docs](https://antigravity.google/docs/build-plugins/)) | Pending |
| Gemini CLI | `gemini-extension.json` with `contextFileName`; `skills/`, `agents/` (preview), `commands/*.toml`, `hooks/hooks.json` | `gemini extensions install https://github.com/kscarfi/ux-grandmaster` | Verified 2026-11-19 ([docs](https://geminicli.com/docs/extensions/reference/)) | Pending |
| Factory Droid | `.factory-plugin/plugin.json`; falls back to `.claude-plugin/marketplace.json` | `droid plugin marketplace add`, then `droid plugin install` | Partly checked 2026-11-19 ([docs](https://docs.factory.ai/cli/configuration/plugins)) | Pending |
| Kiro | Agent Plugins | Pending | Pending | Pending |
| OpenCode | Pending | Pending | Pending | Pending |
| Qwen Code | Pending | Pending | Pending | Pending |
| Kimi Code | Pending | Pending | Pending | Pending |
| Devin CLI | Pending | Pending | Pending | Pending |
| Pi | Pending | Pending | Pending | Pending |
| Hermes Agent | Pending | Pending | Pending | Pending |
| Grok Build CLI | Pending | Pending | Pending | Pending |
| Agents that read `AGENTS.md` only | `AGENTS.md` | Copy or reference | Pending | Pending |

Notes from the docs:

- Codex runs plugin hooks only for plugins installed manually in the desktop app, after the user trusts them; plugins with hooks are not eligible for its public directory.
- Gemini CLI was replaced by Antigravity CLI for unpaid and Google One users on 2026-06-18; Gemini CLI extensions still exist for other users.
- Antigravity ignores `mcp.json` and `.mcp.json`; it reads `mcp_config.json`.

## Capability gaps

Subagents, hooks and slash commands are not part of the portable Agent Plugins core. Every skill says what to do when a capability is missing. For example, when subagents are not available, the critique runs inline with a fresh-eyes checklist and says so in its report.
