# Platform support

UX Grandmaster keeps every skill once, in `skills/`. Each platform gets a thin manifest that points to that folder. A platform is listed as supported only after its format is checked against its official docs and an install is tested on that platform.

Status values:

- **Verified format:** the manifest format was read in the platform's official docs on the date shown.
- **Install tested:** the plugin was installed and a skill fired on that platform.
- **Pending:** not checked yet.

## Shared layout

| File | Read by | Notes |
|---|---|---|
| `plugin.json` (root) | Clients that implement the [Agent Plugins](https://agent-plugins.org) standard, version 1.1.0 | Closed manifest: only `$schema`, `name`, `version`, `displayName`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`. |
| `skills/<name>/SKILL.md` | Every platform | Must follow the [Agent Skills specification](https://agentskills.io/specification). |
| `hooks.json` (root) | Agent Plugins clients | `$schema` plus `hooks`. Handlers use `command` (one token) and `args`; `${PLUGIN_ROOT}` expands in `args` only. SessionStart returns `{"additional_context": "..."}`. |
| `.claude-plugin/plugin.json`, `hooks/hooks.json` | Claude Code | Takes precedence over the root manifest in Claude Code. |
| `assets/icon.png` | Agent Plugins clients and the Claude plugin directory | Square PNG. Agent Plugins recommends 512 px; the Claude directory accepts 512 to 2048 px. |

## Platforms

| Platform | Manifest | Install command | Format | Install |
|---|---|---|---|---|
| Claude Code | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `/plugin marketplace add kscarfi/ux-grandmaster` | Verified 2026-11-19 ([docs](https://code.claude.com/docs/en/plugins-reference)) | Pending |
| Codex (CLI and app) | Root `plugin.json` (Agent Plugins); `.codex-plugin/plugin.json` is the older fallback | Pending | Partly checked 2026-11-19 ([docs](https://developers.openai.com/codex/plugins/build/)) | Pending |
| Cursor | Root `plugin.json` (Agent Plugins) or `.cursor-plugin/plugin.json`; `.cursor-plugin/marketplace.json` | Pending | Partly checked 2026-11-19 ([docs](https://cursor.com/docs/reference/plugins)) | Pending |
| GitHub Copilot CLI | Root `plugin.json` (Agent Plugins 1.0 or later); also reads `.claude-plugin/plugin.json`; agents are `.agent.md` | `copilot plugin install` | Partly checked 2026-11-19 ([docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)) | Pending |
| VS Code agent plugins | Root `plugin.json` (Agent Plugins) | Pending | Pending ([docs](https://code.visualstudio.com/docs/agents/reference/agent-plugin-reference)) | Pending |
| Antigravity | Root `plugin.json`, or `.antigravity-plugin/plugin.json`, which wins when both exist | `agy plugin install https://github.com/kscarfi/ux-grandmaster` | Partly checked 2026-11-19 ([docs](https://antigravity.google/docs/build-plugins/)) | Pending |
| Gemini CLI | `gemini-extension.json` plus a context file; skills found automatically | `gemini extensions install https://github.com/kscarfi/ux-grandmaster` | Partly checked 2026-11-19 ([docs](https://geminicli.com/docs/extensions/reference/)) | Pending |
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

## Capability gaps

Subagents, hooks and slash commands are not part of the portable Agent Plugins core. Every skill says what to do when a capability is missing. For example, when subagents are not available, the critique runs inline with a fresh-eyes checklist and says so in its report.
