---
name: preparing-handoff
description: Prepares a developer handoff spec that leaves nothing to guess. Use when a design is verified and ready for engineering, when the user asks for specs, redlines, acceptance criteria or a handoff document, or before a ticket is written for a design. Covers layout, tokens, component props, states, interactions, responsive rules, edge cases, accessibility notes, analytics events and acceptance criteria per screen.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Preparing handoff

A good handoff answers the developer's questions before they ask them. Write it from the verified design, not from memory.

## Before

`verifying-before-handoff` has passed for this version. If not, do that first.

## Spec per screen

1. **Purpose:** one line, linked to the brief.
2. **Screenshots:** every state, at mobile and desktop widths, with file paths.
3. **Layout:** structure, spacing tokens between sections, max widths, grid.
4. **Components:** each design system component with its props and variants. Anything new is marked as a proposed addition.
5. **Tokens:** color, type, space, radius and motion tokens used. No raw values.
6. **States:** default, loading, empty, error, success, disabled, long content, with copy for each.
7. **Interactions:** what each control does, transitions and their duration tokens, focus order, keyboard shortcuts.
8. **Responsive rules:** what changes at each breakpoint and why.
9. **Edge cases:** long and short content, zero and huge numbers, slow network, permissions, offline.
10. **Accessibility:** names for icon-only controls, heading structure, announcements for dynamic changes, focus management in dialogs, results of the audit.
11. **Copy:** the copy table from `writing-ux-copy`.
12. **Analytics:** the events from `measuring-design-impact`.

## Acceptance criteria

Write testable criteria in Given, When, Then form, including at least one for an error state and one for accessibility:

> Given the IBAN is too short, when the user leaves the field, then the field shows "This IBAN is too short. Check it and try again." below it, and screen readers announce the message.

## Format

Save as `design/handoff/<screen>.md`, or in the team's ticket or docs system. Link decisions from `design/decisions.md` that a developer might question.
