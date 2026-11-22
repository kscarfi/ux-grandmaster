---
name: refining-generated-designs
description: The quality gate every AI-generated design output passes before anyone sees it - HTML pages, artifacts, prototypes, Claude Design canvases, Figma frames, slides, mockups and components. Use whenever the agent has generated or changed a visual design or UI, before presenting it, sharing it, publishing it or calling it done. Renders it, checks it against the brief, the design system, platform guidelines, states, accessibility and taste, fixes what fails, and shows the result.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Refining generated designs

Generated designs fail in predictable ways: they look plausible at first glance, then break on real content, ignore the design system, skip states and lean on visual clichés. Nothing generated reaches the user until it passes this gate.

> **Measuring:** this edition has no helper scripts. Where a step says `uxg <command>`, do the same measurement with a tool you have (a short script you write, a browser or design tool check) and say how each number was produced. The full edition, with the `uxg` scripts, is at https://github.com/kscarfi/ux-grandmaster.

## 1. Render and look

- **HTML, artifacts and prototypes:** `uxg screenshot <file-or-url> --widths 360,768,1280` (add `--theme dark` when supported) and open each image.
- **Figma, Claude Design and other canvases:** take a screenshot of every frame with the tool you have.
- **Slides and documents:** render or export each page.

If it cannot be rendered, say so and list what the user must look at.

## 2. Gate checklist

Go through every item. Fix failures, then render again.

**Fit**
- [ ] It answers the brief: the main job can be done, nothing important is missing.
- [ ] It follows the design system (`designing-with-design-systems`): system components and tokens, no raw colors or one-off sizes.
- [ ] It follows the platform's conventions (`following-platform-guidelines`).

**Content**
- [ ] Real copy written with `writing-ux-copy`. No lorem ipsum, no "Feature 1", no placeholder names.
- [ ] Realistic data: long names, large and small numbers, an empty list, not only perfect demo data.
- [ ] Numbers, dates and currency formatted for the locale.

**Layout and states**
- [ ] Holds at 360 px and at desktop width; nothing overlaps, is cut off or scrolls sideways.
- [ ] States are designed (`designing-all-states`): loading, empty, error, success at minimum where they can occur.
- [ ] Every form has designed outcomes: field validation messages, a submitting state, a success message that says what happens next, and an error message with a way to retry. A form that does nothing visible on submit fails this gate.
- [ ] Clear hierarchy: the most important thing is seen first; one primary action per view.

**Accessibility**
- [ ] `uxg contrast` passes for every text and UI color pair; `uxg axe` passes for coded output.
- [ ] Every control has a visible label or an accessible name; focus is visible; color is never the only signal.

**Taste**
- [ ] None of the patterns in [taste.md](../using-ux-grandmaster/references/taste.md): no default gradients, glass cards, emoji icons, three identical feature cards, fake device chrome, hype copy.
- [ ] Consistent spacing scale, radii, icon style and type scale.

## 3. Fresh eyes for anything that matters

For a screen, flow or page that the user will build on, share or present, run `critiquing-designs` (independent reviewer) on the refined version. Fix Critical and High issues.

## 4. Present

Show the final renders and say in two or three lines what was checked and what changed during refinement. If anything could not be checked, say which.
