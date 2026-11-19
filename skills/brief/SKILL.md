---
name: brief
description: Short command that starts framing and a design brief. Run it as /brief (or with your agent's plugin prefix) when you want UX Grandmaster to interview you about a design problem and produce an approved brief.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
  invocation: user
---

Follow the `framing-design-problems` skill with the user's request (and any text given with this command). When the user confirms the problem statement and success metric, continue with `writing-design-briefs` and save the approved brief to `design/brief.md`.
