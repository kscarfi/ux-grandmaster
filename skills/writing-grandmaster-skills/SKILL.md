---
name: writing-grandmaster-skills
description: Adds or improves a UX Grandmaster skill with an eval-first loop. Use when the user wants to change how UX Grandmaster behaves, add a new design skill, fix a skill that fired wrongly or gave bad advice, or contribute to the UX Grandmaster repository.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Writing UX Grandmaster skills

A skill earns its place by changing what an agent does. Prove the change with an eval before and after.

## Loop

1. **Find the gap.** A prompt where agents do the wrong thing today. Write down the prompt and what a senior designer would do instead.
2. **Write the eval first.** In `evals/<case>/`: `prompt.md` with the realistic request, and `graders/` with one grader per expected behavior (regex or file checks where possible, short PASS and FAIL rubrics otherwise). Add fixtures under `evals/fixtures/`; write them from scratch.
3. **Run the baseline.** `claude plugin eval . --case <case> --scaffold --allow-tools Write Edit Bash`. The case should fail or score low without the change. If it already passes, the skill is not needed.
4. **Write the smallest skill that fixes it.** Only what the agent would not do on its own: the process, the gates, the checks.
5. **Run again**, with and without the plugin, on at least two models. Keep the change only if it improves the score and does not break other cases, including the trigger-silence cases.
6. **Record** the results in `evals/RESULTS.md`, unedited, and any AI mistakes in `docs/build-log.md`.

## Skill rules

- Folder and `name` match, lowercase with hyphens, gerund form: `critiquing-designs`.
- `description`: third person, what it does and when to use it, with the words users actually say. Under 1,024 characters.
- Frontmatter uses only portable fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
- `SKILL.md` under 500 lines; detail in `references/`, one level deep.
- Platform-neutral text: no tool names from one agent. Platform notes go in `skills/using-ux-grandmaster/references/<platform>.md`.
- Every skill says what to do when subagents, scripts or tools are missing.
- Original text only. Paraphrase principles and name the source.
- No numbers that were not computed or cited.
- Plain copy: short sentences, no em dashes, no hype words.
