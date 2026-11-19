# Contributing to UX Grandmaster

Thanks for helping. UX Grandmaster is a design methodology for AI agents, so a contribution is judged the way a design is: by evidence.

## Ground rules

1. **Evals come first.** A new skill, or a change to how a skill behaves, needs an eval case that fails without the change and passes with it. See `evals/`.
2. **Original text only.** Do not paste text from books, articles or other plugins. Paraphrase the principle in your own words and name the source.
3. **No made-up numbers.** Every number in a skill, a doc or an eval result must come from a script, a cited source or a real run.
4. **Keep skills short.** The agent is already capable. A skill holds only what it would not do on its own: the process, the gates and the checks. Each `SKILL.md` stays under 500 lines; detail goes in `references/`.
5. **Platform-neutral skill text.** Skills never name one agent's tools. Platform differences live in `skills/using-ux-grandmaster/references/`.
6. **Plain copy.** Short sentences, no em dashes, no hype words.

## Workflow

1. Open an issue that describes the problem and the evidence for it.
2. Fork, branch, and write or update the eval case.
3. Make the change.
4. Run the checks:
   ```bash
   npm test
   ```
5. Open a pull request with the eval results before and after your change, unedited.

## Reporting a mistake the agent made

If UX Grandmaster led an agent to a wrong or harmful design decision, open an issue with the prompt, the output and what should have happened. These reports become eval cases.

## Code of conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md).
