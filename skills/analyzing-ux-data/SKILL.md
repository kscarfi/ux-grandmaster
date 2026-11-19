---
name: analyzing-ux-data
description: Analyzes product and UX data correctly, with computed numbers and stated caveats. Use when the user shares analytics, event logs, CSV exports, survey numbers or A/B test results, or asks why users drop off, where a funnel leaks, how retention looks, or whether a test won. Computes funnels, cohorts and experiment results with scripts, checks segments, and runs a pitfall checklist before concluding.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Analyzing UX data

Numbers are computed, not estimated, and every conclusion says how sure it is.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Understand the data first

Look at the file before analyzing: columns, row count, date range, one row per what (event, user, session), missing values, duplicates. Write this down in two or three lines. Ask what each column means if it is not clear.

## 2. Compute with scripts

| Question | Command |
|---|---|
| Where do people drop off? | `uxg funnel events.csv --steps a,b,c --time timestamp --segment device` |
| Do people come back? | `uxg cohort activity.csv --period week` |
| Did the test win? | `uxg ab-test --control <users>,<conversions> --variant <users>,<conversions>` |
| How many users does a test need? | `uxg ab-test --plan --baseline <rate> --mde <change>` |

For anything else, write a small script and keep it with the analysis so it can be rerun. Do not compute in your head.

## 3. Look for the segment

An average hides the story. Split the key step by device, platform, country, new versus returning, traffic source and app version. Report the segment that differs, with intervals, and its size. Small segments swing a lot.

## 4. Pitfall checklist

Before concluding, check each one and say what you found:

- [ ] **Tracking changes:** did an event start, stop or change during the period? Look for users who appear at a later step without an earlier one, and sudden jumps on one date.
- [ ] **Simpson's paradox:** does the effect reverse or vanish when split by another column?
- [ ] **Survivorship:** are you only seeing users who got far enough to be logged?
- [ ] **Sample ratio mismatch:** in a test, is the split what was planned? (`uxg ab-test` checks it.)
- [ ] **Novelty and seasonality:** does the effect fade over time, or match a calendar pattern?
- [ ] **Multiple comparisons:** many segments or metrics tested at once will produce some false winners.
- [ ] **Correlation is not cause:** the data shows where and for whom, rarely why.

## 5. Report

- **Answer first:** one or two sentences that answer the question.
- **Evidence:** the key numbers with intervals and counts, from the script output.
- **Caveats:** what the pitfall checklist found.
- **What it does not show:** usually the why.
- **Next step:** how to learn the why (usability test, session replays, error logs, a survey), or the experiment to run.

Mark interpretation as interpretation. Log important conclusions with `uxg decision add --evidence-type data`.
