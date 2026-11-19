---
type: llm
focus:
  source: file
  path: findings.md
---

PASS if the findings raise at least one data quality check, such as: some users have events without a view_product event, web returning users seem undercounted, events may be missing after a tracking change, or the need to check tracking before trusting the numbers. FAIL if no data quality caveat appears.
