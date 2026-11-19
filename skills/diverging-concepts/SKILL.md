---
name: diverging-concepts
description: Explores 2 to 4 genuinely different design directions before committing to one. Use when the user asks for ideas, options, concepts, directions or approaches, when a brief could be solved in very different ways, or before designing any new feature or flow at full-project scale. Each direction sits on a named axis, stays low fidelity, and comes with an honest downside. The user picks.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Diverging concepts

The first idea is rarely the best one, and three versions of the first idea are still one idea. Diverge on purpose, then let the user converge.

## 1. Pick the axis

Find the decision that most changes the solution, and make the directions differ on it. Examples:

- **How much the product does for the user:** fully automatic, suggested, manual.
- **Where it lives:** inside an existing flow, a new dedicated place, outside the app (notifications, email, widgets).
- **What drives behavior:** goals, rules, social comparison, rewards, defaults.
- **Who it is for first:** new users, power users, a specific segment.

Name the axis in one line: "These differ on how much we automate saving."

## 2. Write 2 to 4 directions

For each direction:

| Part | Content |
|---|---|
| Name | Two to four words. |
| Idea | One or two sentences. |
| How it feels | The main flow in three or four steps, or a rough sketch. |
| Works best for | Which users and situations. |
| Downside | A real cost: effort for users, build cost, trust, privacy, regulation, who it fails. Every direction has one. |
| What we would test first | The riskiest assumption, as "We believe … We will know when …". |

Keep it low fidelity: words, flows and rough wireframes, not polished screens. Polish makes people judge the finish instead of the idea.

## 3. Show them so they can be compared

Put the directions side by side. If you can make files, a single local HTML page with one column per direction works well as a visual companion; open it with `uxg screenshot` to check it renders. On a design canvas or in Figma, use one frame per direction, side by side.

## 4. No rigged votes

- Do not make one direction obviously weaker to push another.
- You may recommend one. Say why, and what you would lose by choosing it.
- A hybrid is fine as a fourth option only if it is a real direction, not "all of the above".

## 5. Gate

Ask the user to pick a direction, combine specific parts, or ask for another round. Do not design one direction in detail before they choose. Log the choice and the reason with `uxg decision add`.
