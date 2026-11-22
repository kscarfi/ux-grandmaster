---
name: operating-ai-in-design
description: Helps design and research teams adopt and run AI tools responsibly - choosing tools, writing usage policies, protecting user and company data, setting quality gates for AI output, building shared prompts, skills and agents, measuring whether AI helps, and handling disclosure, intellectual property and bias. Use when someone asks about AI in design workflows, AI policy for a design team, AIOps or AI operations for design, which AI tools to use, or how to keep AI-generated design work at a high standard.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Operating AI in design

AI speeds up design work only if its output is held to the same standard as human work, and if nobody leaks data to get there. Treat AI as a team member that needs onboarding, rules and review.

## 1. Map the work

List where AI is used or could be used, and the risk of each:

| Use | Examples | Main risk |
|---|---|---|
| Research | transcription, tagging, first-pass synthesis, desk research | Participant data exposure; invented findings |
| Design | generating screens, variants, copy, images | Generic or off-system output; IP of training data and images |
| Code | prototypes, front-end code | Accessibility and states skipped |
| Ops | summaries, documentation, tickets | Wrong details presented confidently |

## 2. Policy

A one-page policy the team can follow:

- **Approved tools** and what data may go into each (public, internal, confidential, personal data). Personal data from research or users never goes into unapproved tools.
- **Human review:** every AI output that reaches users, stakeholders or a decision is reviewed by a person who is accountable for it.
- **Quality gates:** generated designs pass `refining-generated-designs`, `critiquing-designs` and `auditing-accessibility`; generated research summaries are checked against the source material (`synthesizing-research`); numbers are recomputed with a tool.
- **Disclosure:** when to say that AI was used (for example in research reports, published images, or anything a client or user might assume was made by a person).
- **Intellectual property:** rules for generated images and copy, and checking licenses for training-data-sensitive uses.
- **Synthetic users:** AI personas and simulated interviews are for preparing research, never as evidence.

## 3. Shared building blocks

Collect what works so every designer benefits: prompts and skills for recurring tasks, design system context the AI can read (a DESIGN.md, a component manifest, an MCP server, see `building-design-systems`), and examples of good output. UX Grandmaster itself is one such layer; extend it with `writing-grandmaster-skills`.

## 4. Measure

Decide what "helps" means before rolling out: time saved on a defined task, rework rate, quality of output against the gates above, team satisfaction. Pilot with one team, measure, then decide. Use evals for anything you automate: a fixed set of tasks with expected results, run before and after a change.

## 5. Bias and inclusion

Check generated personas, images and copy for stereotypes and for who is missing. Include accessibility needs and non-default users in prompts and in review.
