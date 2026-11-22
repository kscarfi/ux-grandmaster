---
name: framing-design-problems
description: Frames a design problem before any design work, the way a design lead would. Use when a request to design, redesign or improve something leaves the users, the problem, the evidence or the success measure unclear, such as "redesign our onboarding", "design a transfer screen" or "make the dashboard better". Interviews the user one question at a time, then plays back a problem statement and a success metric for confirmation.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Framing design problems

A screen built on the wrong problem is waste, however good it looks. Before any design, get to a problem statement and a success metric the user has confirmed.

Do not design, sketch, list components or write code during framing. Not even a "quick first draft".

## 1. Find out what you already know

Read what is already available before asking: the request itself, files in the project (briefs, research, analytics, `design/decisions.md`, a design system), and earlier messages. Do not ask for anything you can find.

## 2. Ask one question at a time

Ask the most important unknown first, wait for the answer, then ask the next. Offer likely answers as options when that makes answering faster, and always allow a free answer. Stop when the statement in step 3 can be filled in; four to six questions is typical.

Work through these in roughly this order, skipping what is already known:

| Topic | Example question |
|---|---|
| Who | Who uses this, and in what situation? Are there groups with different needs? |
| Job | What are they trying to get done when they reach this? |
| Problem and evidence | What is going wrong today, and how do you know? (data, support tickets, research, a hunch) |
| Why now | Why is this a priority now? What happens if nothing changes? |
| Constraints | Platform, design system, deadline, regulation, technical limits, things that must not change. |
| Success | How will we know it worked? Which number moves, by how much, by when? |
| Scope | What is in, what is explicitly out? |

If the evidence is only a hunch, say so kindly and note that the first step may be research, not design.

## 3. Play it back

Write the framing in this shape and ask the user to correct it. Keep it short.

> **Problem.** [Product] is meant to help [users] [do the job]. We see [the problem], based on [evidence]. This causes [the cost to users and to the business].
>
> **Goal.** How might we [outcome for the user] so that [measurable change]?
>
> **Success metric.** [Metric] moves from [baseline] to [target] by [date]. Guardrail: [metric that must not get worse].
>
> **Constraints.** [list]
>
> **Out of scope.** [list]
>
> **Assumptions to test.** We believe [assumption]. We will know we are right when we see [signal].

The problem part should not name a solution. "Users need a new button" is a solution; "users cannot find how to freeze their card" is a problem.

The assumption format follows the hypothesis statements in Jeff Gothelf's *Lean UX*: a belief paired with the evidence that would confirm it.

## 4. Gate

Move on only when the user confirms the problem statement and the success metric. Then:

- If the evidence is weak, go to `researching-users-and-markets` or `analyzing-ux-data`.
- If the evidence is solid, go to `writing-design-briefs`.

Record the confirmed framing in the project, for example `design/brief.md`, so later steps and other agents can read it.

## When the user wants to skip framing

If the user says "just design it", respect that. State your assumptions about users, job and success in three lines, mark them as assumptions, and continue. Add them to the decision log as `--evidence-type assumption` with a `--revisit` condition.

## When there is no way to ask

If you are running without a person to answer (a batch job, an automated run), do not invent answers. Write the questions you would ask, state the assumptions you will use instead, and keep the design minimal until those assumptions are confirmed.
