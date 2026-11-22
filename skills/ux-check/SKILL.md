---
name: ux-check
description: Short command for a fast UX and accessibility check of the code in this project or the current change. Run it as /ux-check, optionally with a folder, file or URL. Made for developers who want to find UX problems before shipping.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
  invocation: user
---

Follow the `reviewing-ux-in-code` skill on the target given with this command. With no target, review the current change (`git diff` against the main branch) if there is one, otherwise the whole project. Keep it fast: run `uxg scan`, confirm the candidates in the code, check the platform guidelines, and report the top fixes first with file and line. Offer to apply them.
