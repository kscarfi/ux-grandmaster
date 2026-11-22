---
name: designing-in-figma
description: Works with Figma files through the Figma MCP server or, when no server is connected, the Figma REST API - reading frames, layers, text, variables, components, comments and screenshots, then running the right UX Grandmaster work on them (critique, accessibility, copy review, design system audit, handoff, code). Use whenever the user shares a figma.com link, mentions a Figma file, frame, FigJam board or Slides deck, or asks to design, inspect, review or update something in Figma.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Designing in Figma

Figma holds the team's real components, variables and decisions. Read them before judging or designing, and never claim to have edited a file you cannot edit.

> **Measuring:** this edition has no helper scripts. Where a step says `uxg <command>`, do the same measurement with a tool you have (a short script you write, a browser or design tool check) and say how each number was produced. The full edition, with the `uxg` scripts, is at https://github.com/kscarfi/ux-grandmaster.

## 1. Find your access, in this order

1. **Figma MCP server.** Look for Figma tools in this session. Use the exact names your session lists. Figma's official server (checked 2026-11-22) offers read tools such as `get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`, `get_comments`, `search_design_system`, `get_code_connect_map` and `get_figjam`, and, on the remote server, write tools such as `use_figma`, `create_new_file`, `upload_assets` and `generate_diagram`. Availability differs between the remote and desktop servers and by plan.
2. **No Figma server:** ask for screenshots or an export, and say what you cannot see (layers, variables, components).

A Figma link carries the file key and often a node id (`node-id=12-34`, which is `12:34` in the API). Use them; do not guess which frame is meant.

## 2. Read before acting

For the frames in question: a screenshot (look at it), the structure (metadata or outline), the variables and styles in use, components and Code Connect mappings, and open comments. Comments often hold the real requirements and unresolved decisions.

## 3. Route to the work

Say what you can do with what you read, and start the matching skill. When the request is open ("take a look at this"), propose the two or three most useful next steps:

| What the user wants | Skills |
|---|---|
| Feedback on a design | `critiquing-designs` with the screenshots |
| Accessibility | `auditing-accessibility`: contrast with `uxg contrast` on the colors from the variables or the inventory, plus structure and text sizes |
| Copy review | `writing-ux-copy` on the text layers |
| Missing states | `designing-all-states` against the frames that exist |
| Design system drift | `designing-with-design-systems`: raw colors and one-off sizes from the inventory, detached components |
| Platform fit | `following-platform-guidelines` for the target device |
| Developer handoff | `preparing-handoff`, using variables, components and Code Connect |
| Code from the design | `designing-in-code`, mapping variables to tokens and components through Code Connect or by name |
| A flow or diagram in FigJam | `mapping-flows-and-ia` |

## 4. Designing with write tools

Only when the session has write tools and the user asked for changes:

- Use the library's components and variables, never detached copies or raw values. Search the design system first.
- One frame per screen and per state, named "Screen / State", at real device sizes, with auto layout.
- After every change, take a screenshot and look at it. Then pass it through `refining-generated-designs` before showing it.

## 5. Other design tools

For Penpot, Sketch, Canva, Framer, Claude Design and other tools connected through MCP, use `working-with-design-tools`. The same order applies: find the tools, read, look, then route.
