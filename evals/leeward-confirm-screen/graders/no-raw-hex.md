---
type: regex
target:
  source: file
  path: confirm.html
pattern: '(?<![&\w])#[0-9a-f]{3,8}\b'
flags: i
match: not_contains
---
