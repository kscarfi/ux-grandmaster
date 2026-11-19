---
type: llm
focus:
  source: file
  path: audit.md
---

PASS if the audit reports that the inputs have no visible labels and rely on placeholder text (WCAG 3.3.2 Labels or Instructions, or 1.3.1). FAIL otherwise. Note: automated tools often treat a placeholder as an accessible name, so this issue is only found by a manual check.
