---
type: regex
target:
  source: file
  path: form.html
pattern: '<button[^>]*>\s*(?!submit\s*<)[^<]{2,40}</button>'
flags: i
---
