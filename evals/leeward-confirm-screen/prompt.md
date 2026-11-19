---
description: "Build a screen inside an existing design system. Checks that the system is read and obeyed, not reinvented."
tags: [core, design-system]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent, AskUserQuestion, TodoWrite]
---

Our design system is in the leeward folder (DESIGN.md and the theme CSS). Build the confirmation step of a money transfer as confirm.html, mobile first, in plain HTML and CSS that links leeward/leeward.light.css: the user checks the recipient, the amount and the fee, then confirms. Follow the design system.
