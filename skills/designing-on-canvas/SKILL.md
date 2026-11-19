---
name: designing-on-canvas
description: Rules for designing on a visual canvas such as Claude Design or another artboard tool - real device sizes, one artboard per screen and state, real controls, the design system installed, no fake device chrome. Use when the deliverable is a visual design or prototype on a canvas rather than code or Figma.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Designing on canvas

A canvas design should be something a team can build, not a poster of an app.

## Rules

1. **Install the system first.** Load the team's design system (tokens, components, fonts) into the canvas before drawing. If the canvas cannot hold it, use the closest tokens and say which ones.
2. **Real device sizes.** Use real viewport sizes, for example 360 or 390 by 844 for phones and 1280 or 1440 wide for desktop. Name the size on each artboard.
3. **One artboard per screen and per state.** Default, loading, empty and error are separate artboards, side by side, named "Screen / State".
4. **Real controls.** Buttons, inputs and lists look like the system's components and follow its sizes. No decorative pseudo-controls.
5. **No fake device chrome.** Do not draw status bars, notches, home indicators or browser bars unless the brief asks for a device mockup for presentation.
6. **Real copy and data.** Use `writing-ux-copy`. Realistic names, amounts and long content.
7. **Look at it.** Export or screenshot each artboard and check it before presenting.

Then run `critiquing-designs` and `auditing-accessibility` on the exported images.
