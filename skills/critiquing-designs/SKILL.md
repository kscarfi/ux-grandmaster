---
name: critiquing-designs
description: Gets an independent, severity-ranked critique of a design from a reviewer who did not make it. Use when the user asks to review, critique or give feedback on a screen, flow, mockup, prototype, Figma frame or built UI, and after designing anything, before calling it done. Covers hierarchy, layout, Gestalt grouping, Nielsen's heuristics, Fitts's and Hick's laws, consistency, content and states. Critical issues block progress.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Critiquing designs

A designer cannot see their own blind spots. The critique comes from fresh eyes, is ranked by severity, and every issue comes with a principle and a fix.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Gather what the reviewer needs, and nothing else

- **The design, as the user would see it.** Rendered screenshots at mobile and desktop widths (`uxg screenshot <file-or-url>`), Figma screenshots, or the files themselves. Prefer images over code: users see pixels.
- **The brief:** who it is for, the job, the success metric (from `design/brief.md` or the framing).
- **The design system,** if there is one: where its rules live (DESIGN.md, docs, tokens).
- **The user's library,** if set up: the reviewer may search it with `uxg library search`.

Do **not** pass your own reasoning, your design rationale or what you think is good about it. The reviewer judges the result, not the intent.

## 2. Dispatch the reviewer

Start the `design-critic` subagent with the material above and this task: "Critique this design against the brief. Return the severity-ranked table described in your instructions."

Check your tools for a way to start a subagent (in Claude Code it is the Agent or Task tool, with subagent type `ux-grandmaster:design-critic`). If one exists, use it. The fallback below is only for platforms with no subagents; choosing it when a subagent is available defeats the point of the critique.

If the reviewer reads code, also ask it to check the states it cannot see in screenshots (loading, empty, error, long content).

**No subagents on this platform?** Run the critique yourself with the fresh-eyes protocol:

1. Put your design rationale aside. Reread only the brief.
2. Look at the screenshots, not the code, for at least one pass.
3. Go through [references/checklist.md](references/checklist.md) in order, section by section, writing down every issue before judging any of them.
4. At the top of the report, state: "Self-review with the fresh-eyes protocol. No independent reviewer was available."

## 3. Report format

| # | Severity | Issue | Where | Principle | Fix |
|---|---|---|---|---|---|

Severity scale:

| Severity | Meaning |
|---|---|
| **Critical** | Blocks the main task, risks money, data or safety, misleads the user, or fails WCAG 2.2 AA on a core flow. Must be fixed before moving on. |
| **High** | Causes errors, confusion or slowdowns for many users. Fix before handoff. |
| **Medium** | Friction or inconsistency that a careful user works around. |
| **Low** | Polish. |

Rules for the report:

- Order by severity, most severe first.
- One issue per row. Point to the exact place ("the fee line under the amount", not "the text").
- Name the principle: a heuristic, a law, a WCAG criterion, a design system rule or a cited source. "I don't like it" is not a principle.
- The fix is concrete: what to change, to what.
- Separate standards from opinions. A WCAG failure or a broken system rule is a fact; a layout preference is a recommendation. Label recommendations as such.
- Do not invent: describe only what is in the design. Numbers such as contrast ratios come from a tool you ran.
- End with what works well, in two or three lines, so it is kept in the next iteration.

## 4. Gate

- **Any Critical issue open:** stop. Fix it, then run the critique again on the new version.
- **High issues:** fix them, or get the user's explicit agreement to defer each one, and log that with `uxg decision add`.
- Then continue to `auditing-accessibility` and `verifying-before-handoff`.

When a stakeholder or the user responds to the critique, use `receiving-design-feedback`.
