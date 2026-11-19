# Eval results

Every run is recorded here as it came out, failures included. Scores are the share of graders passed, from 0 to 1.

## 2026-11-19: baseline before any skill

- **Plugin state:** manifest only, no skills, agents or hooks. This is the "without UX Grandmaster" reference.
- **Model under test:** Claude Code's default model on this machine (Claude Opus 5.5). Judge: Claude Code's background model.
- **Command:** `claude plugin eval . --runs 1 --ablation none --scaffold -j 3 --allow-tools Write Edit Bash`
- **Runs:** 1 per case. One run is a smoke test, not a measurement: rerun with 3 or more before drawing conclusions.
- **Cost:** $1.60 for 5 cases, 170 seconds.

| Case | Score | Graders failed |
|---|---|---|
| `framing-gate` | 0.17 | Did not ask any framing question; wrote an HTML screen straight away; no UX Grandmaster skill (none exists yet). |
| `critique-seeded-transfer` | 0.85 | Missed the de-emphasized fee (judge 1 of 3); no critic subagent (none exists yet). Found 9 of 10 seeded issues. |
| `a11y-audit-transfer` | 0.86 | Did not run a measurement script. All content graders passed. |
| `funnel-payment-drop` | 0.80 | Did not run the funnel script. All content graders passed, including the Android finding and a data quality caveat. |
| `trigger-silence-coding` | 1.00 | None. |

### What this tells us

- **The model is already strong at checklist work.** Without any skill, it found 9 of 10 seeded critique issues, wrote correct contrast ratios (2.64:1 and 2.33:1, matching `uxg contrast` exactly) without running a tool, found an input border failure (1.32:1) that was not seeded, and diagnosed the funnel correctly.
- **The model skips process.** Asked to "design a money transfer screen" with no context, it built the screen without asking who it is for or how success is measured.
- **The graders that failed besides framing were the "used the plugin's tool or agent" graders.** Those are excluded from scoring when both arms run, so on their content graders these three cases already score close to 1.0 without the plugin. They cannot show what the plugin adds with this model.

### Second baseline: process cases (2026-11-19 and 2026-11-20)

Same setup, one run per case. Two cases first stopped on a usage limit ("You've hit your 5-hour limit") and were rerun after the reset; the table shows the rerun.

| Case | Score | Graders failed |
|---|---|---|
| `states-transaction-list` | 0.40 | No loading state, no error state; the states rubric failed. Only the empty state was present. |
| `leeward-confirm-screen` | 0.80 | Used primitive tokens (`--lw-color-…-NNN` or `--lw-space-N`) that the system forbids. No raw hex, no em dash, money rules followed. |
| `diverge-savings-directions` | 0.67 | The directions were not distinct in kind (judge 0 of 3). Downsides and the user's choice were fine. |
| `measure-payment-redesign` | 1.00 | None. |
| `framing-gate-onboarding` | 0.67 | Only the "skill fired" grader (no skill exists yet). It asked framing questions on its own. |
| `framing-gate-dashboard` | 0.67 | Same as above. |
| `quick-fix-button-label` | 1.00 | None. |

So without UX Grandmaster, the model frames very vague requests ("make the dashboard better") but not concrete-sounding ones ("design a transfer screen"); designs the happy path and an empty state but not loading or error; and drifts from a design system's token rules even when told to follow it.

### Changes made because of this run

1. New cases aimed at process, where the baseline is weak: covering all states, staying inside a design system, exploring distinct directions, and planning measurement.
2. Every case will also run on a smaller model, where checklist skills are more likely to matter.
3. Long critique files made the judge noisy (one grader split 2 to 1). Critique graders will move to shorter, more specific rubrics.
