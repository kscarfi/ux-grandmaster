---
name: handoff
description: Short command that prepares a developer handoff spec. Run it as /handoff, optionally with the screen or flow to hand off.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
  invocation: user
---

First check that `verifying-before-handoff` has passed for the named design; if not, run it. Then follow `preparing-handoff` and save the spec under `design/handoff/`.
