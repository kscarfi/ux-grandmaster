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

## 2026-11-20: first run with the skills

- **Plugin state:** commit `9d7e230` (27 skills, 4 agents, session hook). Some later files (platform manifests, CI) were added while the run was going; they do not change what Claude Code loads.
- **Command:** `claude plugin eval . --runs 1 --ablation none --scaffold -j 2 --allow-tools Write Edit Bash`. One run per case: a smoke test, not a measurement.
- **Cost:** $4.58 for 12 cases, 526 seconds.

| Case | Without skills | With skills | Graders failed with skills |
|---|---|---|---|
| `framing-gate` | 0.17 | 1.00 | None. |
| `framing-gate-onboarding` | 0.67 | 1.00 | None. |
| `framing-gate-dashboard` | 0.67 | 1.00 | None. |
| `states-transaction-list` | 0.40 | 1.00 | None. |
| `critique-seeded-transfer` | 0.85 | 0.92 | No critic subagent dispatched. |
| `a11y-audit-transfer` | 0.86 | 1.00 | None. Ran the measurement script. |
| `funnel-payment-drop` | 0.80 | 0.80 | Did not run `uxg funnel` (it wrote its own Python script). |
| `diverge-savings-directions` | 0.67 | 0.67 | One direction's downside was judged weak (judge 1 of 3); the distinct-directions grader now passed. |
| `measure-payment-redesign` | 1.00 | 1.00 | None. |
| `quick-fix-button-label` | 1.00 | 1.00 | None. The skills did not add process to a one-line fix. |
| `leeward-confirm-screen` | 0.80 | 0.80 | "Primitive tokens" grader. This grader was wrong: see below. |
| `trigger-silence-coding` | 1.00 | 1.00 | None. |

The "without skills" column comes from the two baseline runs above, so the two columns were not run at the same time. Scores for graders that only make sense with the plugin (skill fired, subagent used, script used) are included in both columns here, which favors the plugin column; the next run uses `--ablation with-without`, which excludes them.

### What the traces showed

Rerunning two cases with `--keep-temp` showed why two process graders failed:

1. **Critique:** the skill loaded, but the model chose the "no subagents" fallback although the `design-critic` agent was available. In this Claude Code version the subagent tool is called `Task`, while the grader looked for `Agent`. Fixes: the skill now says to use a subagent whenever one exists and names the tool; the grader checks for the subagent type in the trace instead of a tool name.
2. **Funnel:** the skill loaded, then the model ran `which uxg`, did not find it, and wrote its own Python script. Fix: every skill that uses `uxg` now gives the exact command, `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs"`, and the relative fallback path.
3. **Leeward:** the "no primitive tokens" grader matched `--lw-space-2xs` and `--lw-space-3xl`, which are valid semantic tokens in Leeward. Both the baseline and the plugin run may have been marked down wrongly. The pattern now matches only numeric primitives such as `--lw-space-4` and palette steps such as `--lw-color-indigo-600`.

## 2026-11-20: developer cases, with and without the plugin

- **Plugin state:** working tree after commit `e225edc` minus the icon, with the `uxg` path fix, the critique subagent fix and the corrected Leeward grader.
- **Command:** `claude plugin eval . --runs 1 --ablation with-without --scaffold --allow-tools Write Edit Bash "WebFetch(domain:developer.apple.com)" --case <case>`. Graders that only make sense with the plugin are excluded from both scores.
- **Model:** Claude Opus 5.5 (Claude Code default). One run per arm.

| Case | With | Without | Δ | Notes |
|---|---|---|---|---|
| `dev-review-vibe-app` | 1.00 | 1.00 | 0.00 | Both found the seeded problems with file and line. |
| `dev-review-visionos` | 1.00 | 0.80 | +0.20 | Without the plugin, the review did not cite Apple's guidelines. |
| `leeward-confirm-screen` | 1.00 | 1.00 | 0.00 | With the corrected grader, both followed Leeward's token and money rules. |
| `trigger-silence-backend` | 1.00 | 1.00 | 0.00 | No UX Grandmaster skill fired on a database migration. |

With the strongest model, the plugin's measurable effect is on process (framing, states, citing platform guidance, using measurement tools), not on spotting problems the model already sees. The next run uses a smaller model.
