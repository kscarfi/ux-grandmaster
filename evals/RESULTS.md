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

## 2026-11-20: Haiku run, aborted

- **Command:** the whole suite, `--ablation with-without --model claude-haiku-5-5 --judge-model claude-sonnet-5-5 -j 3`.
- **Outcome:** no usable results. Most runs and judge calls stopped with "You've hit your 5-hour limit". Scores of 0.00 from that run are errors, not measurements, and are not reported.
- **Change:** cases now run one at a time, and the loop stops at the first usage-limit message, so a limit leaves the finished cases intact.

## 2026-11-20: Haiku, eight core cases, with and without the plugin

- **Plugin state:** commit `5d6268a`.
- **Command:** per case, `claude plugin eval . --runs 1 --ablation with-without --model claude-haiku-5-5 --judge-model claude-sonnet-5-5 --scaffold --allow-tools Write Edit Bash "WebFetch(domain:developer.apple.com)" --case <case>`.
- **Cost:** $2.32 for 8 cases, both arms.

| Case | With | Without | Δ | Notes |
|---|---|---|---|---|
| `framing-gate` | 0.25 | 0.50 | -0.25 | The skill never loaded in the with-arm (0 skill calls); the agent built an HTML screen. |
| `states-transaction-list` | 1.00 | 0.40 | +0.60 | Without the plugin: no loading and no error state. |
| `critique-seeded-transfer` | 0.92 | 0.83 | +0.08 | No critic subagent in the with-arm. |
| `a11y-audit-transfer` | 1.00 | 1.00 | 0.00 | No measurement script in the with-arm. |
| `dev-review-vibe-app` | 0.86 | 0.86 | 0.00 | Both arms failed "prioritized"; no `uxg scan` in the with-arm. |
| `dev-review-visionos` | 1.00 | 1.00 | 0.00 | |
| `funnel-payment-drop` | 1.00 | 1.00 | 0.00 | |
| `leeward-confirm-screen` | 1.00 | 0.80 | +0.20 | Without the plugin: primitive tokens used. |

**Finding:** the smaller model rarely loaded the skills or used the plugin's tools by itself. The session-start note only said the skill existed.

**Change:** the note (and the always-on rule for Cursor and Antigravity, and `GEMINI.md`) now says that the first step for user-facing design, build, review or audit work is to load `using-ux-grandmaster`, that "design a screen" with no user context starts with framing, and that backend work does not use it.

### After the change (same day)

| Case | Model | Command | Result |
|---|---|---|---|
| `framing-gate` | Haiku | `--runs 2 --ablation none` | 1.00, 1.00 |
| `dev-review-vibe-app` | Haiku | `--runs 2 --ablation none` | 1.00, 0.88 (judge split 1 to 2 on "prioritized") |
| `framing-gate` | Haiku | `--ablation with-without` | with 1.00, without 0.50, Δ +0.50 |
| `trigger-silence-backend` | Haiku | `--ablation with-without` | with 1.00, without 1.00 |
| `trigger-silence-coding` | Haiku | `--ablation with-without` | with 1.00, without 1.00 |
| `quick-fix-button-label` | Haiku | `--ablation with-without` | with 1.00, without 1.00 |
| `trigger-silence-backend`, `quick-fix-button-label`, `framing-gate` | Opus | `--ablation none` | 1.00 each |

The stronger note fixed the framing gap on Haiku without making UX Grandmaster fire on backend, coding or one-line copy tasks.

## 2026-11-22: end-to-end run after the routing, tools, ops and quality-gate skills

- **Plugin state:** commit `6cdcf03` plus the gitleaks fix. 40 skills.
- **Runs:** one per arm. Opus: new cases with and without the plugin, older cases with the plugin only (regression check). Haiku: every case with and without. Judge: Claude Sonnet 5.5.

| Case | Opus with | Opus without | Haiku with | Haiku without |
|---|---|---|---|---|
| `routing-interview-notes` | 1.00 | 0.75 | 0.75 | 0.75 |
| `designops-embedded-team` | 0.50 | 0.50 | 0.50 | 0.50 |
| `collab-pm-cuts-states` | 1.00 | 1.00 | 1.00 | 1.00 |
| `artifact-landing-quality` | 1.00 | 0.80 | 0.80 | 0.80 |
| `figma-link-review` | error | n/a | error | n/a |
| `framing-gate` | 1.00 | | 1.00 | 0.50 |
| `framing-gate-onboarding` | 1.00 | | 1.00 | 1.00 |
| `framing-gate-dashboard` | 1.00 | | 1.00 | 0.50 |
| `states-transaction-list` | 1.00 | | 0.20 | 0.40 |
| `critique-seeded-transfer` | 0.92 | | 0.83 | 0.83 |
| `a11y-audit-transfer` | 0.86 | | 1.00 | 1.00 |
| `funnel-payment-drop` | 1.00 | | 1.00 | 1.00 |
| `diverge-savings-directions` | 1.00 | | 1.00 | 0.67 |
| `measure-payment-redesign` | 1.00 | | 1.00 | 0.67 |
| `quick-fix-button-label` | 1.00 | | 1.00 | 1.00 |
| `leeward-confirm-screen` | 1.00 | | 1.00 | 1.00 |
| `trigger-silence-coding` | 1.00 | | 1.00 | 1.00 |
| `trigger-silence-backend` | 1.00 | | 1.00 | 1.00 |
| `dev-review-vibe-app` | 1.00 | | 1.00 | 0.86 |
| `dev-review-visionos` | 1.00 | | 1.00 | 1.00 |

Open problems found by this run:

1. `figma-link-review` did not run: the case listed the repository root as a plugin, which the eval tool rejects. Fixed with `scripts/prepare-eval-harness.mjs`; the rerun then stopped on a usage limit before grading.
2. `designops-embedded-team` fails "focused-plan" in every arm: the grader or the skill needs work.
3. `states-transaction-list` on Haiku scored lower with the plugin (0.20 against 0.40). Not yet investigated.
4. `artifact-landing-quality`: no arm designs the waitlist form's success and error outcomes.
5. Opus did not dispatch the critic subagent, and did not run the contrast script in this run.

## 2026-11-22: after the fixes from the end-to-end run

Fixes: the bootstrap skill loads every skill in a chain before using it and states the states rule for single screens; advice is limited to three ranked changes in a fixed format; the quality gate and `designing-all-states` require form outcomes; the Figma case runs through `scripts/prepare-eval-harness.mjs`.

| Case | Model | Arms | With | Without | Δ |
|---|---|---|---|---|---|
| `states-transaction-list` | Haiku | both | 1.00 | 0.40 | +0.60 |
| `designops-embedded-team` | Haiku | both | 1.00 | 0.50 | +0.50 |
| `designops-embedded-team` | Opus | both | 1.00 | 0.50 | +0.50 |
| `artifact-landing-quality` | Opus | both | 1.00 | 0.80 | +0.20 |
| `figma-link-review` | Opus | with only | 1.00 | | |
| `figma-link-review` | Haiku | with only | 1.00 | | |

The Haiku states regression from the previous run (0.20 with the plugin) came from the agent naming `designing-all-states` without loading it; the trace showed no skill call after the router.
