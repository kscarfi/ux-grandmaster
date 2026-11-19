---
name: reviewing-ux-in-code
description: Finds UX and accessibility problems in an app's source code and running UI, for developers as much as designers. Use when someone asks to check, review, audit or improve the UX or UI of their app, site, prototype or pull request, asks "is my app easy to use", "what's wrong with my UI", "polish this", or has just built a user-facing feature (including vibe-coded apps). Works for web, iOS, visionOS, watchOS, macOS, Android, Wear OS, Android XR, Meta Quest, Flutter and React Native. Reports problems with file and line, the principle behind each, and a fix.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Reviewing UX in code

Most UX problems are visible in the code before anyone sees the screen: a missing loading state, a button with no label, an error message that shows a stack trace. Find them where they live, with file and line, then confirm them in the running app.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Scope it

Ask at most one question if it is unclear: the whole app, one feature, or the current change (`git diff`)? Default to the current change when there is one, otherwise the main user flows.

Find out who uses the app and for what, from the README, the code, or one question. "A budgeting app for freelancers" changes what matters.

## 2. Scan

Run `uxg scan <folder>` (add `--json` to process the results). It:

- detects the platforms (web, Apple platforms, Android and its form factors, XR headsets, Flutter, React Native) and lists their official guidelines;
- flags candidates: missing labels and names, placeholder labels, click handlers on non-buttons, removed focus outlines, disabled zoom, tiny text, raw errors shown to users, missing loading, error and empty states, destructive actions without confirmation, small touch targets, fixed font sizes, and more (`uxg scan --rules` lists them).

Every scan finding is a candidate. Open the file, read the context, and keep it only if it is real. Note false positives in one line so the user trusts the rest.

## 3. Read the code for what a scanner cannot see

Walk the main user flows through the code (routes, screens, components, form handlers):

- **Flow:** how many steps to the main job? Any dead ends, missing back or cancel, lost input on error?
- **States:** for each data view, are loading, empty, error, and long content handled? (`designing-all-states`)
- **Feedback:** does every action show progress, success or failure?
- **Forms:** labels, input types and autocomplete, validation timing, error messages next to fields.
- **Copy:** collect user-facing strings. Vague labels, jargon, blame, inconsistent terms? (`writing-ux-copy`)
- **Consistency:** the same thing looks and behaves the same everywhere; components are reused, not copied.
- **Design system or tokens:** are there tokens or a component library? Count raw colors and one-off sizes.

## 4. Check the platform's guidelines

Use `following-platform-guidelines` for every platform the scan detected. Platform rules (target sizes, navigation patterns, typography, gestures, spatial comfort in XR) are findings like any other, cited to the official page.

## 5. Look at it running

If the app can run locally, render it and look: `uxg screenshot <url> --widths 360,768,1280`, `uxg axe <url>`. Check the scan's candidates on screen, and look for what code cannot show: visual hierarchy, crowding, alignment, contrast in context. For native apps, use the simulator or emulator screenshots you can take, or ask the user for them.

If nothing can run, say the review is code-only.

## 6. Get fresh eyes

For anything beyond a small change, pass the screenshots and the list of flows (not your conclusions) to the `design-critic` subagent, as in `critiquing-designs`. Merge its findings with yours.

## 7. Report

Lead with the few issues that matter most. Developers act on short lists.

> **Top fixes**
> 1. **[High] Payment errors show raw API messages** (`src/checkout/Pay.tsx:88`). Users see "TypeError: failed to fetch" and do not know what to do. Principle: Nielsen heuristic 9. Fix: map errors to plain messages with a retry; log the detail.

Then the full table:

| # | Severity | Issue | Where | Principle or guideline | Fix |
|---|---|---|---|---|---|

- Severity follows `critiquing-designs` (Critical, High, Medium, Low).
- "Where" is `file:line`, or the screen and element when found visually.
- Cite the source: a WCAG criterion, a Nielsen heuristic, a platform guideline page, or a named principle. See [references/authorities.md](../using-ux-grandmaster/references/authorities.md).
- Separate standards (WCAG, platform requirements) from recommendations.
- Add **quick wins**: fixes under an hour with visible impact, such as labels, empty states, error copy and focus styles.

## 8. Offer to fix

Offer to apply the fixes, highest severity first, as small separate changes. After fixing, run `uxg scan` again and show the before and after counts, and re-take the screenshots. For visual polish beyond fixes, use `improving-ui`.
