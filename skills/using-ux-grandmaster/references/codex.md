# Codex

- **`uxg` path:** the plugin's `scripts/uxg.mjs`: two folders up from this skill's folder.
- **Subagents:** if this Codex version cannot start subagents, run critiques and audits with the fresh-eyes fallback in `critiquing-designs`, and say so in the report.
- **Questions:** ask one framing question at a time in plain text and wait for the answer.
- **Short commands:** not available as slash commands. Ask in words: "critique this", "run an accessibility audit".
- **Hooks:** Codex runs plugin hooks only for plugins installed manually in the desktop app, after you trust them. Without the hook, this skill loads when its description matches the task.
