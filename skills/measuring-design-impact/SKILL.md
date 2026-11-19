---
name: measuring-design-impact
description: Plans how to measure whether a design change worked. Use when the user asks how to measure, test, validate or track a design or redesign, when defining success metrics, KPIs, guardrails or an A/B test, and at the end of any full design project. Produces primary and guardrail metrics, instrumentation events, an experiment design with a computed sample size, and a review date.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Measuring design impact

A design is a hypothesis until the numbers say otherwise. Decide how you will judge it before it ships, so the result cannot be argued into a success afterwards.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Metrics

| Kind | What it is | Example for a payment step |
|---|---|---|
| **Primary** | The one number the change is meant to move, tied to the brief's success metric. | Share of users who reach the payment step and complete payment. |
| **Guardrails** | Numbers that must not get worse. | Payment errors, refunds, support contacts, time to pay, average order value. |
| **Diagnostics** | Numbers that explain why the primary moved. | Field errors per field, back taps, retries. |

Define each one exactly: numerator, denominator, time window, and who is counted. "Conversion" is not a definition.

## 2. Instrumentation

List the events needed, with names and properties, and check they exist before launch:

| Event | When it fires | Properties |
|---|---|---|
| `payment_step_viewed` | The payment step renders | `variant`, `device`, `method_count` |

Note any tracking change in the same period: it can fake a result.

## 3. Choose the method

- **A/B test** when traffic allows and the change can be split. Compute the sample size, do not guess it:

  ```bash
  uxg ab-test --plan --baseline 0.59 --mde 0.03
  ```

  State the baseline, the minimum detectable effect (absolute or `--relative`), alpha and power. Translate the result into duration from real daily traffic, rounded up to whole weeks.
- **Before and after** when a test is impossible. Compare equal periods, watch for seasonality and other launches, and say that the evidence is weaker.
- **Qualitative** when traffic is too low: task success and time in moderated usability tests, with the number of participants stated.

## 4. Rules for the test

- Fix the duration or stop rule before starting. Do not stop when it first looks significant.
- Check the sample ratio first. `uxg ab-test --control <n>,<conversions> --variant <n>,<conversions>` stops on a mismatch.
- Run whole weeks. Watch for novelty effects in the first days.
- Pre-register segments you will look at (for example device). Treat other segment findings as new hypotheses.
- Report effect size with its interval, not only a p-value.

## 5. Output

A short plan: hypothesis, metrics with definitions, events, method, sample size and duration, decision rule ("ship if the primary improves and no guardrail worsens beyond X"), and a review date. Save it in the project, for example `design/measurement-plan.md`.

To read the results later, use `analyzing-ux-data`.
