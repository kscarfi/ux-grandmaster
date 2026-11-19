---
type: llm
focus:
  source: file
  path: critique.md
---

PASS if the review criticizes the error handling: the IBAN problem is shown only by a red border (color alone), or the message 'Error 4012 occurred' does not say what went wrong and how to fix it, or the error is not tied to the field. FAIL if none of these are raised.
