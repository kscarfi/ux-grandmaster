---
name: synthesizing-research
description: Turns raw research into insights a team can act on. Use when the user has interview notes, transcripts, usability test results, survey answers, support tickets, reviews or desk research to make sense of, or asks for themes, insights, personas, jobs to be done or "how might we" opportunities. Produces atomic observations, clusters, insight statements with evidence counts and confidence, and ranked opportunities.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Synthesizing research

Synthesis is where research turns into decisions, and where bias creeps in. Keep every insight tied to the evidence behind it.

## 1. Atomic observations

Break the material into single observations, one fact per line, each with its source:

| ID | Observation | Source | Participant or segment |
|---|---|---|---|
| O12 | Checked the fee twice before sending | P4 interview, 12:40 | New user |

Keep quotes short and exact. Do not merge or interpret yet.

## 2. Cluster

Group observations by what they mean, not by where they came from. Name each cluster as a short statement in the user's terms. Let the groups come from the data; do not start from the categories you expected.

## 3. Insight statements

For each important cluster:

> **Insight:** [what we learned about people] **because** [the reason behind it] **so** [what it means for the design].
>
> Evidence: 6 observations from 4 of 8 participants (O3, O7, O12, …). Confidence: medium.

- Count evidence honestly: participants, not mentions.
- Confidence: high (most participants, several methods), medium (a pattern in one method), low (a few people, or one striking story).
- Note contradicting evidence. An insight with no counter-evidence was probably not looked for.

## 4. Opportunities

Turn insights into "How might we" questions that open the space without naming a solution: "How might we let people trust the fee before they send?" Rank them by impact on the success metric and by strength of evidence, and say what you would do first.

## 5. Optional artifacts

Personas, journey maps and jobs-to-be-done statements are useful only when built from the observations above. Mark any part that is assumed rather than observed.

## Rules

- Synthetic data is not research. If some input was generated (AI personas, simulated interviews), label it and keep it out of the evidence counts.
- Do not let the loudest participant become the whole story.

Then continue to `writing-design-briefs`.
