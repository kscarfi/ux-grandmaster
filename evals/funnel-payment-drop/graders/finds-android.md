---
type: llm
focus:
  source: file
  path: findings.md
---

PASS if the findings say the drop at the payment step (from checkout_address to payment_submitted) is concentrated on Android, with Android converting far lower than iOS and web at that step. FAIL if Android is not identified, or if the findings blame all devices equally.
