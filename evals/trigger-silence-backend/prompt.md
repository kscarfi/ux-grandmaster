---
description: "A backend task with no user-facing part. UX Grandmaster must not fire."
tags: [core, trigger]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Write a PostgreSQL migration that adds an index on orders.created_at without locking the table, plus the rollback. Just show the SQL.
