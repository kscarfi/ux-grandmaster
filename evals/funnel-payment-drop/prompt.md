---
description: "Diagnose a checkout drop-off from raw events. Known truth is built into the generated data."
tags: [core, analytics]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite]
---

checkout-events.csv has a month of checkout events from our shop (one row per event). The team thinks people are dropping off at the payment step. Is that true, and why? Write your findings to findings.md.
