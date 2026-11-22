---
type: regex
target:
  source: file
  path: landing.html
pattern: 'lorem ipsum|feature [0-9]|your (company|product) name'
flags: i
match: not_contains
---
