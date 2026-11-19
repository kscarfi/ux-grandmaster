---
name: writing-design-briefs
description: Writes a design brief that a designer or another agent can execute without guessing. Use after framing or research, when the user asks for a brief, a problem definition, requirements for a design, or a handover of a design task. Covers problem, users, jobs, evidence, success metrics, constraints, scope, out of scope, risks and open questions, shown in short parts for approval.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Writing design briefs

A brief is a contract about the problem, not the solution. Someone who reads only the brief should be able to design the right thing.

## Sections

1. **Problem:** the confirmed problem statement from framing, with its evidence.
2. **Users and context:** who, in what situation, on which devices, with which constraints (skills, stress, accessibility needs).
3. **Jobs to be done:** "When [situation], I want to [motivation], so I can [outcome]."
4. **Evidence:** the insights that matter, with confidence and links to sources.
5. **Success:** primary metric with baseline and target; guardrails.
6. **Constraints:** platform, design system, technical limits, legal and regulatory needs, deadline.
7. **Scope:** what is in. **Out of scope:** what is explicitly not part of this work.
8. **Principles for this work:** three or four tie-breakers, for example "Honest numbers over a clean look".
9. **Risks and assumptions:** what could make this wrong, written as testable assumptions.
10. **Open questions:** with an owner for each.

Keep the whole brief to about one page. Link to detail instead of copying it in.

## Approval

Show the brief in short parts (problem and users first, then success and scope, then the rest) and ask for corrections after each. Revise until the user approves it. Save the approved version as `design/brief.md`.

## Gate

No design work starts until the brief is approved. If the user wants to move faster, agree on the problem, success and scope sections at minimum, and mark the rest as open.

Next: `mapping-flows-and-ia` for multi-step work, or `diverging-concepts`.
