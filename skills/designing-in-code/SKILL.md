---
name: designing-in-code
description: Designs screens and prototypes directly in code - semantic HTML, CSS and React - with design tokens, real controls and responsive layout from 360 px up. Use when the deliverable is HTML, CSS, React, Vue, Svelte, SwiftUI-like markup or any coded prototype or UI, and when a design must be turned into working front-end code.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Designing in code

Code is a design surface. Build it so it looks right, works for everyone and survives real content.

## 1. Before writing code

- Follow `designing-with-design-systems`: use the project's components and tokens.
- Follow `designing-all-states`: plan every state now, not later.
- Match the project's stack and conventions. Do not add a framework for one screen.

## 2. Structure

- Semantic elements: `button` for actions, `a` for navigation, `label` tied to every input, `h1` to `h6` in order, lists for lists, `main`, `nav` and `header` landmarks.
- Real controls, not styled `div`s. If a custom control is needed, give it the right role, name, state and keyboard behavior.
- Icon-only buttons get an accessible name. Decorative icons get `aria-hidden="true"`.
- The page has a language (`lang`) and a meaningful `title`.

## 3. Style

- Tokens as CSS custom properties, `var(--…)`. No raw colors, sizes or font names in components.
- Mobile first: design at 360 px, then widen. Use flexible layouts (grid, flex, `min()`, `clamp()`), not fixed widths.
- Visible focus styles, never `outline: none` without a replacement.
- Respect `prefers-reduced-motion` and, when the product supports it, `prefers-color-scheme`.
- Touch targets of at least 44 by 44 px where the platform expects it; never below 24 by 24 CSS px.
- Text can be resized to 200% without loss.

## 4. Content

- Real copy from `writing-ux-copy`. Realistic data: long names, large amounts, empty lists.
- Numbers in tables and amounts use tabular figures.
- Dates, numbers and currency are formatted with `Intl` for the locale.

## 5. Make states reachable

Add a simple way to see each state: a state switcher in a prototype, URL parameters, or one story per state. The person reviewing must be able to see loading, empty and error without editing code.

## 6. Check

- `uxg screenshot <file> --widths 360,768,1280` and look at the images.
- `uxg axe <file>` and `uxg contrast` for new color pairs.
- Then `critiquing-designs` and `verifying-before-handoff`.
