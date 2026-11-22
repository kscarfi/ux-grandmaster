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

### Finding: the first evals were too easy

The first baseline run (no skills) scored close to full marks on critique, accessibility and funnel content. The model found 9 of 10 seeded issues and computed contrast ratios correctly without a tool. Those cases could not show what UX Grandmaster adds. The one clear gap was process: asked to design a screen with no context, the model built it without asking a single question. New cases now target process (framing, states, design system use, divergent exploration, measurement planning), and every case runs on a smaller model too. Details in [evals/RESULTS.md](../evals/RESULTS.md).

### Finding: small models need a direct session note

On Claude Haiku 5.5 the skills almost never loaded on their own: asked to "design a money transfer screen", the agent built HTML straight away even with the plugin installed. The session-start note only said the plugin existed. Rewritten to say that loading `using-ux-grandmaster` is the first step for user-facing design and review work, it raised Haiku's framing score from 0.25 to 1.00 and did not make the plugin fire on backend, coding or one-line copy tasks. Details in [evals/RESULTS.md](../evals/RESULTS.md).

### AI mistakes and how they were caught

| # | Mistake | How it was caught | Fix |
|---|---|---|---|
| 1 | Proposed using company hiring case studies from the reference library as templates for eval scenarios. Those are confidential hiring material, not research. | Kemal reviewed the proposal. | Removed them from the source list. Eval scenarios are written from scratch. |
| 3 | Wrote two expected values in the statistics tests from memory: z = 3.0905 for 500/10000 vs 600/10000 (correct: 3.1016) and 8,156 users per arm for 5% to 6% (correct: 8,158). The code was right and the tests were wrong. | The tests failed. The expected values were then computed by hand from the formulas, independently of the code. | Expected values in tests now come from a published table or a hand computation written in the test comment, never from memory. |
| 4 | The first contrast run on Leeward checked every text token against every surface token, including pairs that never appear together, and reported hundreds of false failures. Translucent dark-theme surfaces were also composited over white. | Compared the output with Leeward's own contrast report. | Added `--pairs` for the pairs that actually appear in the UI, multi-file token loading, per-pair backdrops, and lazy alias resolution so one broken token does not stop the run. |
| 5 | Wrote reference sample sizes into an eval grader from memory again (about 9,300, 4,100 and 1,500 users per variant), one hour after logging mistake 3. The true values are 9,418, 4,168 and 1,486. | Self-check before running the case. | The grader now quotes the values computed by `uxg ab-test --plan`. Rule repeated: every number in a grader comes from a script or a cited table. |
| 6 | Wrote an eval grader for "no primitive tokens" whose pattern also matched valid Leeward semantic tokens (`--lw-space-2xs`, `--lw-space-3xl`), so it marked correct work as wrong in both arms. | Investigating why the plugin did not improve that case. | Pattern narrowed to numeric primitives and palette steps, and checked against both kinds of names. |
| 7 | Wrote the critique grader to look for a tool named `Agent`; in the Claude Code version that runs the evals, the subagent tool is named `Task`. The grader could never pass. | Reading the eval trace. | The grader now looks for the subagent type in the trace, whatever the tool is called. |
| 8 | Skills told the agent to run `uxg <command>` without saying where `uxg` is. The agent searched the PATH, did not find it, and wrote its own analysis script, skipping the tested statistics. | Reading the eval trace. | Every skill that uses `uxg` now gives the exact path and a fallback. |
| 9 | Ran the secret scan piped through `tail`, which hid its failure, so a commit was pushed while gitleaks reported 3 findings. They were false positives (a made-up Figma file key in a test), but the process failed: CI went red. | CI failed on the secret-scan step; the scan output was then read. | The made-up key is allowlisted narrowly in `.gitleaks.toml`, and `npm run check` now runs the secret scan itself and stops on any finding. |
| 2 | Said the reference library had been "read" when only the short documents were read in full and the long books were read by table of contents and key chapters. The limitation was stated, but in a later section of the reply. | Self-review while writing this log. | From now on, coverage is stated first: which documents were read in full and which only in part. Each skill's source book is read in full when that skill is written. |
