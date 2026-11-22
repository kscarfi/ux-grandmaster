---
name: auditing-accessibility
description: Audits a design or built UI against WCAG 2.2 level AA with measured evidence and an honest scope. Use when the user asks whether something is accessible, for an a11y or WCAG check, before handoff of any screen, and when colors, tokens, forms or interactive components change. Runs contrast and axe checks as scripts, adds the manual checks machines miss, and reports pass or fail per criterion.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Auditing accessibility

WCAG 2.2 AA is the floor, not the goal. Every pass and fail in the audit is backed by a measurement or an observation someone can repeat.

> **Measuring:** this edition has no helper scripts. Where a step says `uxg <command>`, do the same measurement with a tool you have (a short script you write, a browser or design tool check) and say how each number was produced. The full edition, with the `uxg` scripts, is at https://github.com/kscarfi/ux-grandmaster.

## 1. Dispatch the auditor

Start the `accessibility-auditor` subagent with: the files or URL, the brief (who uses it, on which devices), the design system tokens if any, and this task: "Audit against WCAG 2.2 AA. Return pass, fail or not tested per criterion, with evidence."

In Claude Code, use the Agent or Task tool with subagent type `ux-grandmaster:accessibility-auditor`. Use the fallback only when no subagent tool exists.

**No subagents?** Run the steps below yourself, and say at the top of the report that the designer audited their own work.

## 2. Measure

Run what can be run. Report the tool, its version and the settings.

| Check | How |
|---|---|
| Color contrast (1.4.3, 1.4.11) | `uxg contrast <fg> <bg>` per pair, or `uxg contrast --tokens <file> --pairs <pairs.json>` for every pair that appears in the UI. Text 4.5:1, large text and non-text parts 3:1. Check every theme. |
| Automated rules | `uxg axe <file-or-url>` at 1280 px and again at `--width 360`. Needs a browser tool. |
| Reflow (1.4.10) | `uxg screenshot <file-or-url> --widths 320`: content readable with no sideways scrolling. |

Translucent colors are measured over their real background (`--backdrop`). Never estimate a ratio by eye. If a tool cannot run, mark the check "not tested", not "pass".

## 3. Check by hand what machines miss

Automated tools find a minority of issues. Check these by reading the code and the rendered page:

- **Labels (1.3.1, 3.3.2):** every input has a visible label. A placeholder alone fails, even when axe accepts it as a name.
- **Names (4.1.2):** every icon-only control has an accessible name that says what it does.
- **Use of color (1.4.1):** errors, status and links are not signaled by color alone.
- **Errors (3.3.1, 3.3.3):** the error names the field, says what is wrong and how to fix it, and is announced.
- **Keyboard (2.1.1, 2.4.3, 2.4.7, 2.4.11):** everything works with a keyboard, in a logical order, with a visible focus indicator that is not hidden behind other content.
- **Target size (2.5.8):** targets are at least 24 by 24 CSS px, or have enough space around them.
- **Structure (1.3.1, 2.4.6):** one h1, headings in order, lists for lists, landmarks.
- **Motion (2.3.1, 2.2.2):** nothing flashes more than three times a second; moving content can be paused. Respecting reduced-motion settings (2.3.3) is AAA but expected.
- **Dragging (2.5.7) and authentication (3.3.8):** dragging has a single-pointer alternative; login does not require a memory or puzzle test.
- **Consistent help (3.2.6) and redundant entry (3.3.7):** help is in the same place; users are not asked twice for the same data.

## 4. Report

Start with the verdict in one line: **Meets WCAG 2.2 AA**, **Does not meet WCAG 2.2 AA**, or **Not determined** (when key checks could not run).

Then a table:

| Criterion | Result | Evidence | Fix |
|---|---|---|---|
| 1.4.3 Contrast (Minimum) | Fail | `.fee` #a6aab0 on #ffffff is 2.33:1, needs 4.5:1 (`uxg contrast`) | Use a text token that passes, such as … |

- Results are **Pass**, **Fail** or **Not tested**. Never mark a criterion as passing because nothing was found when it was not checked.
- List what was not tested and why: screen reader output, real devices, zoom to 400%, user testing with disabled people. Recommend who should test it.
- APCA values are informational; WCAG 2.2 ratios decide pass or fail.

## 5. Gate

Any AA failure on a core flow is a Critical issue: fix it, then measure again. Report the before and after numbers.
