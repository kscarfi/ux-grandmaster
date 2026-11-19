---
name: building-design-systems
description: Builds, extends or audits a design system - token architecture (primitive, semantic, component), DTCG token files, themes and brands, components with documented rules, governance checks in CI, and an agent-ready layer (DESIGN.md, a component manifest, an MCP server). Use when the user wants to create, refactor, audit, document or scale a design system or its tokens.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Building design systems

A design system is worth it when using an existing pattern a second time costs far less than designing it the first time. Build for that: easy to use correctly, hard to use wrongly, and kept up to date by checks, not goodwill.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Audit first

Collect what exists: every color, font size, spacing value, radius, shadow and component variant in use. Count duplicates and near-duplicates. This shows the design debt and is the argument for the work.

## 2. Token architecture

| Layer | Example | Used by |
|---|---|---|
| **Primitive** | `color.indigo.600`, `space.4` | Only the semantic layer. |
| **Semantic** | `text.default`, `fill.surface.raised`, `space.lg` | Components and screens. |
| **Component** (optional) | `button.primary.fill` | One component. |

- Store tokens in the DTCG format (`$value`, `$type`, aliases in `{braces}`) and generate platform outputs (CSS variables, iOS, Android, Figma variables).
- Name semantic tokens by role and intent, not by appearance.
- Themes and brands swap the semantic mapping; components never change.
- Check every text and UI pair in every theme with `uxg contrast --tokens <file> --pairs <pairs.json>`. Fail the build on any WCAG 2.2 AA miss.

## 3. Components

For each component, document: purpose, when to use and when not to, anatomy, props and variants, states, content rules, accessibility (role, name, keyboard), and do and don't examples. Build the accessible behavior into the component so screens get it for free.

## 4. Governance

- Lint rules that reject raw values and primitive tokens in product code.
- Visual regression and accessibility tests per component.
- A contribution process: proposal, review, release notes, versioning, deprecation with a migration path.

## 5. Agent-ready layer

AI agents build screens now. Give them:

- `DESIGN.md`: principles, token rules, layout, copy, accessibility and a component list, generated from the source so it cannot drift.
- A machine-readable component manifest: props, variants, rules and an example per component.
- `llms.txt` pointing to the above.
- An MCP server with tools such as `get_tokens`, `get_component`, `search_components` and `validate_ui`, so agents can look up and check instead of guessing.

The Leeward Design System (github.com/kscarfi/leeward-design-system) is a worked, open-source example of every layer above.
