---
name: improving-ui
description: Makes an existing interface look and feel more professional with specific, principled changes - hierarchy, spacing, typography, color, alignment, consistency and states - without a redesign. Use when someone says their UI "looks off", "looks amateur", "needs polish", asks to make a page or app look better or more modern, or wants UI improvement ideas for something already built, including vibe-coded apps.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Improving UI

Most interfaces that "look off" break a few basic rules: no clear hierarchy, spacing without a system, too many sizes and colors, and missing states. Fix those in order, show before and after, and explain each change.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. See it first

Render the current UI and look at it: `uxg screenshot <url-or-file> --widths 360,1280`. Note the three things you see first, and whether they are the three most important things on the screen.

Check for a design system or tokens (`designing-with-design-systems`). Improvements go through the system: change or add tokens, do not scatter new values.

## 2. Work through the passes in order

Each pass fixes a class of problems. Do them in this order, because later passes depend on earlier ones.

1. **Hierarchy.** One primary action per view. Make the most important content stronger and everything else quieter: weight and color before size. Secondary text in a softer color that still passes contrast. (Refactoring UI, Wathan and Schoger; Practical UI, Dannaway.)
2. **Spacing.** Pick a scale (for example multiples of 4 or 8) and use only its values. More space between groups than inside them, so grouping is visible without borders. Give content room to breathe.
3. **Typography.** One or two typefaces, a small type scale, two or three weights. Body text at least 16px on the web (or the platform default), line length roughly 45 to 75 characters, comfortable line height. Left-align body text.
4. **Color.** A neutral base, one brand or accent color for actions, and semantic colors only for status (success, warning, error). Never color alone for meaning. Check every pair with `uxg contrast`.
5. **Alignment and consistency.** Align to a grid or to shared edges. Same component, same look, everywhere: buttons, inputs, cards, radii, shadows.
6. **Details.** Fewer borders (use spacing or background instead), consistent icon style and size, real images with consistent treatment, focus and hover states that are visible.
7. **States.** Empty, loading and error states designed with the same care (`designing-all-states`).

Avoid the patterns in [taste.md](../using-ux-grandmaster/references/taste.md).

## 3. Respect the platform

On iOS, Android, visionOS and other platforms, polish within the platform's conventions (`following-platform-guidelines`). Native components and system type styles usually look better than custom ones.

## 4. Deliver

- List the changes grouped by pass, each with the reason in one line.
- Apply them as small, reviewable edits, through tokens where possible.
- Re-render and show before and after screenshots at the same widths.
- Run `uxg contrast` on changed colors and `uxg axe` on the page.

If the problem is the flow or the structure rather than the surface, say so and suggest `reviewing-ux-in-code` or `critiquing-designs` instead of polishing a screen that should change.
