---
name: verifying-before-handoff
description: Proves a design is done before saying so. Use before telling the user that any screen, component, prototype or design change is finished, ready, fixed or working. Renders or screenshots every screen and state, looks at each image, and checks it against the brief, the design system, the critique and the accessibility audit. No "done" without evidence.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Verifying before handoff

"It should look right" is not evidence. Look at the output, then report what you saw.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Render everything

- **Code:** `uxg screenshot <file-or-url> --widths 360,768,1280`, plus `--theme dark` if the product has a dark theme. Use `--full-page` for long pages. Render each state (loading, empty, error) through whatever switch the page has.
- **Figma or canvas:** take a screenshot of every frame with the tool you have.
- If nothing can render on this platform, say so plainly and list what the user must look at themselves.

## 2. Look at each image

Open every screenshot and check, one by one:

- [ ] It matches the brief: the main job can be done on it.
- [ ] Nothing is cut off, overlapping, unstyled or scrolling sideways (the screenshot script reports sideways overflow).
- [ ] Real copy, no lorem ipsum, no placeholder data left behind.
- [ ] Every state required by `designing-all-states` exists and looks intended.
- [ ] Only design system components and tokens are used (search the code for raw hex values and pixel numbers).
- [ ] Console errors reported by the screenshot script are fixed.

## 3. Confirm the gates

- [ ] `critiquing-designs` ran on this version, with no open Critical issues and High issues fixed or deferred with the user's agreement.
- [ ] `auditing-accessibility` ran on this version and reports no AA failures.
- [ ] Decisions are logged in `design/decisions.md`.

If any check fails, fix it and repeat from step 1. Do not report "done with a few known issues" unless the user agreed to each one.

## 4. Report

Say what was verified and how, in a few lines:

> Verified at 360, 768 and 1280 px, light and dark: default, loading, empty and error states. Critique: 0 critical, 2 medium open (listed). Accessibility: meets WCAG 2.2 AA by `uxg contrast` and `uxg axe`; screen reader not tested.

Include the screenshot paths so the user can look too. Then go to `preparing-handoff`.
