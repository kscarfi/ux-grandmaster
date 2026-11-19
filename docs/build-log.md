# Build log

A public record of how UX Grandmaster is built: the decisions, and every mistake the AI builder made with how it was caught. Newest entries at the top.

## 2026-11-19

### Decisions

- **Scope:** ship a complete 1.0 directly instead of the planned 0.1 and 0.5 steps (Kemal).
- **Short commands:** `/ux-grandmaster:brief`, `:research`, `:critique`, `:a11y` and `:handoff` are built as skills the user calls by name, because current Claude Code docs mark `commands/` as the older format.
- **Platforms:** support every agent that has a documented plugin, extension or skills format. Each format is verified in that platform's official docs before its manifest is written. See [platforms.md](platforms.md).
- **Packaging:** one repository serves two layouts at once. A root `plugin.json` and `hooks.json` follow the open Agent Plugins 1.1.0 standard; `.claude-plugin/` holds the Claude Code manifest. A local test with Claude Code 2.1.328 showed that when both exist, Claude Code reads `.claude-plugin/plugin.json` and the root files do not cause validation errors.
- **Script language:** Node.js (ES modules). Playwright and axe-core, which the screenshot and accessibility scripts need, are Node libraries.
- **Evals:** use Claude Code's built-in `claude plugin eval`, which runs each case with and without the plugin and reports the difference.
- **Sources:** skill text paraphrases principles from published books and research with attribution. No source text is copied. Case studies, hiring material and portfolio work are not used as sources.

### AI mistakes and how they were caught

| # | Mistake | How it was caught | Fix |
|---|---|---|---|
| 1 | Proposed using company hiring case studies from the reference library as templates for eval scenarios. Those are confidential hiring material, not research. | Kemal reviewed the proposal. | Removed them from the source list. Eval scenarios are written from scratch. |
| 2 | Said the reference library had been "read" when only the short documents were read in full and the long books were read by table of contents and key chapters. The limitation was stated, but in a later section of the reply. | Self-review while writing this log. | From now on, coverage is stated first: which documents were read in full and which only in part. Each skill's source book is read in full when that skill is written. |
