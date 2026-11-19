---
name: receiving-design-feedback
description: Handles feedback on a design from stakeholders, users, critics or reviewers. Use when someone comments on, objects to, approves or asks for changes to a design ("make the logo bigger", "the CEO hates the blue", "users found step 2 confusing"), or when a critique report comes back. Clarifies, separates taste from evidence, pushes back with reasons when needed, and logs the decision.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Receiving design feedback

Feedback is data about a problem, not an order for a solution. Find the problem behind it, then decide with evidence.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Clarify

For each piece of feedback, find out:

- **What is the concern?** "Make the logo bigger" may mean "people don't know whose app this is".
- **Who would it affect, and how do they know?** An observation, a metric, a user quote, or a personal preference.

Ask, one question at a time, when the concern is unclear.

## 2. Sort it

| Type | Example | How to treat it |
|---|---|---|
| **Evidence** | "4 of 6 testers missed the fee." | Strong. Act on it. |
| **Standard or system rule** | "This fails contrast." "Our system says one primary button." | Binding. Fix it. |
| **Expert judgment** | "This pattern confused users on our last project." | Weigh it; look for evidence. |
| **Taste** | "I don't like the green." | Discuss against the brief and the brand; it is valid input, not a fact. |
| **Constraint** | "Legal requires this text." | Binding. Design the best version within it. |

## 3. Respond

- **Agree** when the feedback is right. Say what you will change.
- **Push back** when a change would hurt the users or the goal. Give the reason and the evidence, and offer an alternative that addresses the underlying concern: "A bigger logo pushes the balance below the fold. To make the brand clearer, we could add it to the header instead."
- **Test** when the disagreement is about how users will react and nobody has evidence. Propose the smallest test that would settle it.
- Do not argue with a person's preference as if it were a fact, and do not treat it as evidence either.

## 4. Log it

For each decision: what was asked, what was decided, why, and who decided. `uxg decision add --evidence-type stakeholder` (or `research`, `data`, `standard`). This keeps the next review from reopening settled questions.
