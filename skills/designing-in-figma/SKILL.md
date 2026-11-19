---
name: designing-in-figma
description: Works in Figma through the Figma MCP server - reading design context, variables, components and screenshots, and writing only when the session has write tools. Use when the user shares a Figma link or node, asks to design, inspect or update something in Figma, or wants code generated from a Figma design.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Designing in Figma

Figma holds the team's real components and variables. Read them before designing, and never pretend to have edited a file you cannot edit.

## 1. Check what you can do

List the Figma tools available in this session. Tool names differ by client and server version; use the exact names your session shows. Typical read tools return design context or code for a node, the variables used, metadata, a screenshot and Code Connect mappings. Write tools, if present, create or change nodes.

- **No Figma tools:** tell the user, and offer to connect the Figma MCP server or to design on another surface (`designing-in-code`).
- **Read tools only:** you can inspect, critique and generate code from Figma, but not change the file. Say so before planning any edit.

## 2. Read before designing

For the frame or component the user points to:

1. Get a screenshot, and look at it.
2. Get the design context or metadata for structure, layers and layout.
3. Get the variables: colors, spacing, type and radius tokens in use.
4. Get Code Connect mappings if they exist, so code uses the real components.

A Figma link carries a node id (`node-id=` in the URL). Use it; do not guess which frame is meant.

## 3. Designing with write tools

- Use the library's components and variables, never detached copies or raw values.
- One frame per screen and per state, named clearly ("Transfer / Error"), at real device sizes.
- Auto layout, so content can grow.
- After every change, take a screenshot and look at it.

## 4. Code from Figma

Map Figma variables to the project's tokens and Figma components to the project's components (Code Connect, or by name). Where there is no match, say so instead of hardcoding values from the inspector.

## 5. Then

Run `critiquing-designs` on the screenshots and `auditing-accessibility` on the colors and structure.
