# Other agents

For OpenCode, Factory Droid, Kiro, VS Code, Qwen Code, Kimi Code, Devin, Pi, Hermes, Grok and any agent that reads Agent Skills:

- **`uxg` path:** the plugin's `scripts/uxg.mjs`: two folders up from this skill's folder. If you only have the skills folder, clone https://github.com/kscarfi/ux-grandmaster and use `scripts/uxg.mjs` from there.
- **No subagents:** use the fresh-eyes fallback in `critiquing-designs` and `auditing-accessibility`, and say in the report that the review was not independent.
- **No question tool:** ask one question at a time in plain text.
- **No shell:** do the checks by hand and say that numbers were not machine-checked.
