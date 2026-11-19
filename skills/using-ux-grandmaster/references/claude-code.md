# Claude Code

- **`uxg` path:** `${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs`. Claude Code fills in the plugin root in skill text; when reading this file directly, use the skill's base directory and go two folders up.
- **Subagents:** start them with the Agent tool (named Task in some versions). UX Grandmaster's agents are `ux-grandmaster:design-critic`, `ux-grandmaster:accessibility-auditor`, `ux-grandmaster:research-scout` and `ux-grandmaster:usability-walker`.
- **Questions:** use the question tool (AskUserQuestion) for one framing question at a time, with likely answers as options.
- **Short commands:** `/ux-grandmaster:brief`, `/ux-grandmaster:research`, `/ux-grandmaster:critique`, `/ux-grandmaster:a11y`, `/ux-grandmaster:handoff`.
- **Design library:** the folder chosen at install is passed to `uxg` as `CLAUDE_PLUGIN_OPTION_LIBRARY_PATH` in hooks; in a shell, pass it with `--dir` or `UX_GRANDMASTER_LIBRARY` the first time, after which `uxg library` remembers it.
- **Session start:** a hook adds a short note about UX Grandmaster at the start of each session.
- **Figma:** use the Figma MCP tools if they are connected (`/mcp` shows them).
