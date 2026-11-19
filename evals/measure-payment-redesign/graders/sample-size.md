---
type: llm
focus: last_message
---

PASS if the reply states a minimum detectable effect and the users needed per variant for it. For reference, from a 59% baseline with a two-sided test at alpha 0.05 and 80% power: +2 points needs 9,418 per variant, +3 points 4,168, +5 points 1,486 (computed with `uxg ab-test --plan`). Numbers within 10% of these, for the effect the reply chose, pass. FAIL if no sample size is given, or it is far off.
