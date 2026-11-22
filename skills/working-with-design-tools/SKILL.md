---
name: working-with-design-tools
description: Works with any design tool connected through MCP or an API - Penpot, Sketch, Canva, Framer, Webflow, Storybook, Claude Design, design system servers and others - by discovering what the tools can read and write, then applying the right UX Grandmaster skill to what they return. Use when the user mentions or links a design tool other than Figma, when design tools appear in the session's tool list, or when a design system or component library is exposed through MCP.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Working with design tools

Design tools change faster than any list of their features. Work from what the connected tools actually offer, not from memory.

## 1. Discover

List the tools in this session that belong to the design tool (their names usually carry the tool or server name). For each, note from its description whether it:

| Capability | Typical tool names |
|---|---|
| Lists files, pages, boards or frames | `list_*`, `get_files`, `get_pages` |
| Reads structure and layers | `get_*_context`, `get_metadata`, `get_tree`, `get_document` |
| Reads tokens, variables or styles | `get_variables`, `get_tokens`, `get_styles` |
| Reads components and their props | `get_component`, `search_components`, `search_design_system` |
| Renders an image | `get_screenshot`, `export_*`, `render_*` |
| Validates UI against rules | `validate_ui`, `lint_*` |
| Writes or edits | `create_*`, `update_*`, `use_*`, `generate_*`, `publish_*` |

Tell the user in one line what you can and cannot do with this connection. If a capability is missing, ask for an export or screenshot instead.

Examples of tools people connect (check the tools you actually have): Figma (see `designing-in-figma`), Penpot, Sketch (local Mac app), Canva, Framer, Webflow, Storybook, Zeroheight, and design system servers such as Leeward's, which offer `get_tokens`, `get_component`, `search_components` and `validate_ui`.

## 2. Read and look

Get a rendered image of what you are judging and look at it. Get the tokens and components in use. Read comments or notes when the tool has them.

## 3. Route

Use the same routing as `designing-in-figma`: critique, accessibility, copy, states, design system drift, platform fit, handoff or code. When the user's request is open, propose the two or three most useful next steps.

## 4. Writing

Only when the user asked for changes and a write tool exists:

- Use the tool's library components and tokens; search before creating.
- Make one change at a time, render it, look at it.
- Publishing (a site, a page, a public design) affects real people: confirm with the user before any publish or share action.
- Pass every result through `refining-generated-designs` before showing it.

## 5. Claude Design and other AI canvases

Treat generated canvases like any other design: install or reference the design system first (`designing-on-canvas`), then refine (`refining-generated-designs`), critique (`critiquing-designs`) and audit (`auditing-accessibility`) before presenting.
