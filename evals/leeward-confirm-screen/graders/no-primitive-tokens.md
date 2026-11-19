---
type: regex
target:
  source: file
  path: confirm.html
pattern: 'var\(--lw-(color-[a-z]+-[0-9]{2,3}|space-[0-9]+)\s*[,)]'
flags: i
match: not_contains
---
