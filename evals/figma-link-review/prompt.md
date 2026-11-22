---
description: "A Figma link with no other context. The agent must read the design through the connected Figma tools, review it, and judge handoff readiness."
tags: [core, figma, routing]
plugins: ["../..", "../fixtures/figma-mock-plugin"]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite]
---

Here is our checkout payment screen: https://www.figma.com/design/AbCdEf123456/Shop?node-id=12-34
We want to hand it to the developers tomorrow. Can you check it first? Write what you find to figma-review.md.
