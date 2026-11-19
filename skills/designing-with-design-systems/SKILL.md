---
name: designing-with-design-systems
description: Designs inside the team's existing design system instead of inventing one. Use before designing or building any screen or component in a product that may have a design system, and whenever the user mentions tokens, components, a style guide, DESIGN.md, Figma variables or a design system MCP server. Finds and reads the system first, uses only its tokens and components, follows its rules, and proposes additions instead of hardcoding.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Designing with design systems

The design system is the team's decisions, already made. Use it before your own taste.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Find the system

Look, in this order, and stop when you find it:

1. A design system MCP server in your tools (tools named like `get_tokens`, `get_component`, `search_components`, `validate_ui`).
2. Agent docs in the project: `DESIGN.md`, `AGENTS.md`, `llms.txt`, a `design-system/` or `docs/` folder.
3. Token files: CSS custom properties, DTCG JSON (`$value`), Tailwind config, Style Dictionary sources, Figma variables.
4. A component library in the dependencies (`package.json`) and its docs or Storybook.
5. Figma: libraries, variables and components through the Figma tools, if available.

If you find none, ask the user once whether a system exists. If not, design with a small, explicit set of tokens (color roles, a spacing scale, a type scale, radii) and say that it is a temporary set.

## 2. Read before you design

Read the system's rules, not only its token list: principles, do and don't lists, how it handles money, errors, status, density and dark mode. Note anything that changes the design (for example "outgoing amounts are never red", "one primary button per screen").

## 3. Design only with the system

- **Components:** use the system's component for every need it covers. Check its props and variants before building something similar.
- **Tokens:** every color, space, radius, size, type style, shadow and duration comes from a semantic token. No raw hex, rgb or pixel values in components or screens.
- **Semantic over primitive:** use role tokens (`text-default`, `fill-surface-raised`) rather than palette steps (`blue-600`), unless the system says otherwise.
- **Themes:** do not write theme-specific overrides. If something looks wrong in dark mode, the token mapping is the fix.

## 4. When the system has a gap

Do not hardcode around it. Write a short proposal:

> **Proposed addition:** `Badge` tone `scheduled`. **Need:** scheduled transfers have no status style. **Uses:** transaction list, transfer details. **Closest existing:** `info` tone, rejected because it reads as a notice. **Tokens:** reuses `fill-info-subtle` and `text-info`.

Use the closest existing pattern in the meantime and mark it in the code.

## 5. Check

- If the system has a validator (a `validate_ui` tool, a lint rule), run it and fix every issue.
- Search your output for raw values: hex colors, `px` numbers outside tokens, font names.
- Run `uxg contrast` on any new color pair, in every theme.
- Log deviations from the system with `uxg decision add`.

For building or changing the system itself, use `building-design-systems`.
