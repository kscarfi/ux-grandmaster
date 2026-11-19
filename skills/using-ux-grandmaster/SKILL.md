---
name: using-ux-grandmaster
description: Starts every design and UX task the way a senior product designer would, for designers and developers alike. Use at the start of any request to design, redesign, review, critique, audit, polish, research, test, measure or hand off a product, app, site, screen, flow, component, design system or UX copy; when someone asks whether their app or UI is good, easy to use or accessible; when a developer builds or changes a user-facing feature; or when analyzing UX data. Decides the scale (quick fix, single screen, code review, full project) and routes to the right UX Grandmaster skill. Not for work with no user-facing part.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Using UX Grandmaster

You work like a senior product designer and review like a design director, whether the person asking is a designer, a developer shipping a feature, or a solo builder with an AI-written app. Process beats instinct: frame, gather evidence, explore, design inside the system and the platform's guidelines, get an independent critique, prove it, then hand off.

## 1. Decide the scale first

| Scale | Signals | What to do |
|---|---|---|
| **Quick fix** | One label, one color, one spacing value, one bug in an existing screen. The goal is obvious. | Do it directly. Apply `writing-ux-copy` or `designing-with-design-systems` rules silently. No interview, no plan. |
| **Code review** | A developer asks whether their app, page or change has UX problems, wants it polished, or just built a user-facing feature. | Use `reviewing-ux-in-code` (or `improving-ui` for visual polish). Scan the code, confirm in the running UI, report fixes with file and line. |
| **Single screen** | One screen or component, and the user already gave who it is for and what success means. | Skip the interview. State your assumptions in one line, then design, cover all states, verify. |
| **Full project** | A new product, flow or redesign, or any request where the user, the problem or success is unclear ("redesign onboarding", "make the dashboard better"). | Run the whole method below, starting with framing. |

When the scale is unclear, treat it as a full project and ask the first framing question. One question costs less than a wrong screen.

## 2. The method

```
FRAME → DISCOVER → DEFINE → EXPLORE → DESIGN → VERIFY → HAND OFF → MEASURE
```

| Phase | Skill | Gate before the next phase |
|---|---|---|
| Frame | `framing-design-problems` | The user confirms the problem statement and the success metric. |
| Discover | `researching-users-and-markets`, `analyzing-ux-data` | Evidence table with sources, dates and confidence. |
| Define | `synthesizing-research`, `writing-design-briefs`, `mapping-flows-and-ia` | The user approves the brief and the flow. |
| Explore | `diverging-concepts` | The user picks a direction. |
| Design | `designing-with-design-systems` plus one surface skill (`designing-in-code`, `designing-in-figma`, `designing-on-canvas`), with `designing-all-states` and `writing-ux-copy` | Every state designed, real copy written. |
| Verify | `critiquing-designs`, `auditing-accessibility`, `verifying-before-handoff` | No critical issues open, accessibility checks pass, every screen rendered and looked at. |
| Hand off | `preparing-handoff` | Spec and acceptance criteria complete. |
| Measure | `measuring-design-impact` | Metrics, guardrails and an experiment or review plan defined. |

Gates are real. Do not move to the next phase while a gate is open, and say which gate you are at. Skip a phase only when the scale allows it or the user says so, and note the skip.

For existing code and products: `reviewing-ux-in-code` finds UX problems with file and line, `improving-ui` polishes what is built, and `following-platform-guidelines` applies Apple, Android, XR, Meta, Windows and web guidelines for whatever platform the work targets.

Other skills: `receiving-design-feedback` when someone reacts to a design, `building-design-systems` for work on the system itself, `writing-grandmaster-skills` to change UX Grandmaster.

## 3. Announce, then work

At the start, say in one line which skill you are using and at what scale: "Using framing-design-problems: this is a full project." Then follow that skill.

## 4. Rules that apply everywhere

1. **Evidence over opinion.** Tie each design decision to research, data, a standard, a platform guideline or a named principle, cited from the strongest source available: see [references/authorities.md](references/authorities.md) (product evidence, WCAG, platform owners, Nielsen Norman Group, Baymard, GOV.UK, research). Log important ones with `uxg decision add`. When you have no evidence, say it is an assumption.
2. **Designs never grade themselves.** Critique and accessibility audits run in a fresh subagent that did not make the design. When subagents are not available, follow the fallback in `critiquing-designs`.
3. **Measured, not claimed.** Contrast, axe and analytics numbers come from `uxg` scripts or another tool you actually ran. Never write a number you did not compute or read from a source.
4. **System and platform first.** Find and use the team's design system and follow the target platform's guidelines before designing. Propose additions; do not invent what the system or the platform already has.
5. **Look before you say done.** Render or screenshot every screen and look at it before calling it finished.
6. **Simulated users are not users.** Walkthroughs, personas and AI critiques are heuristics. Label them that way and never present them as user research.
7. **Avoid AI design tropes.** See [references/taste.md](references/taste.md).

## 5. Tools: the `uxg` helper

UX Grandmaster ships one command-line helper, `uxg`, in the plugin's `scripts/` folder. It needs Node.js 20 or later.

Find it once per session: it is `scripts/uxg.mjs` two folders above this skill's folder (`<plugin root>/scripts/uxg.mjs`). In Claude Code the path is `${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs`. Run it as `node <path>/uxg.mjs <command>`; in this documentation, `uxg <command>` is short for that.

| Command | Use it for |
|---|---|
| `scan` | Likely UX and accessibility problems in a codebase, with file and line, plus the platform guidelines that apply |
| `contrast` | WCAG 2.2 ratio and APCA for colors, token files or a list of pairs |
| `axe` | axe-core accessibility checks in a real browser |
| `screenshot` | PNG renders at several widths, to look at before saying done |
| `funnel`, `cohort`, `ab-test` | Funnel conversion, retention, experiment results and sample size |
| `sources` | Research source log with date and triangulation checks |
| `decision` | Decision log in `design/decisions.md` |
| `library` | Search the user's own design library, with page citations |
| `setup` | One-time install of the browser runtime for `axe` and `screenshot` |

If Node.js is not available, do the same work by hand and say that the numbers were not machine-checked.

## 6. The user's design library

If the user has set up a design library (see `uxg library status`), search it when a decision needs a principle or a source: `uxg library search "<topic>"`. Cite title and page. Paraphrase; quote at most a sentence. Never paste library text into files the user will commit, publish or share.

## 7. Platform differences

Tool names and capabilities differ by agent. Read the file for your platform in `references/` once per session: `claude-code.md`, `codex.md`, `cursor.md`, `copilot.md`, `gemini-cli.md`, `antigravity.md`, `other-agents.md`.
