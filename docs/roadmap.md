# Road to 1.0

UX Grandmaster ships as one complete 1.0 release. This file tracks the build in order. Each phase ends with its checks passing, not with a claim.

## Phase 0: Foundation

- [x] License, code of conduct, security policy, contributing guide, changelog, build log
- [x] Platform research started ([platforms.md](platforms.md))
- [x] Public GitHub repository

## Phase 1: Evals before skills

- [x] First five cases: framing gate, seeded critique, accessibility audit, funnel diagnosis, trigger silence
- [ ] Eval cases for every core skill, 3 or more each, in `claude plugin eval` format
- [ ] More trigger calibration cases: skills fire on design work and stay silent on unrelated tasks
- [x] Fixtures written from scratch: a screen with seeded issues and an analytics CSV with a known answer
- [ ] Baseline run with a manifest-only plugin, so the no-plugin scores exist before any skill text

## Phase 2: Scripts

Node.js ES modules behind one entry point, `scripts/uxg.mjs`, each with tests (`node --test`), clear error messages and documented constants.

- [x] `contrast`: WCAG 2.2 ratio and APCA, for color pairs, token globs or a pairs file
- [x] `axe`: Playwright plus axe-core on a URL or local HTML
- [x] `screenshot`: renders a page at given viewport sizes
- [x] `funnel`, `cohort`, `ab-test`: analytics with sample ratio check, intervals and sample size
- [x] `sources`: research source log with date, staleness and triangulation checks
- [x] `decision`: appends a decision with its evidence to `design/decisions.md`
- [x] `library`: index and search the user's own design library ([library.md](library.md))
- [x] `setup`: installs the optional browser runtime for `screenshot` and `axe`
- [x] `scan`: finds likely UX and accessibility problems in web, SwiftUI, Compose, Flutter and React Native code, and detects the target platforms

## Phase 3: Agents

- [x] `design-critic`
- [x] `accessibility-auditor`
- [x] `research-scout`
- [x] `usability-walker`

## Phase 4: Skills

| Group | Skills |
|---|---|
| Bootstrap | `using-ux-grandmaster` (+ platform notes, authorities, taste guide in `references/`) |
| Frame and discover | `framing-design-problems`, `researching-users-and-markets`, `analyzing-ux-data` |
| Define | `synthesizing-research`, `writing-design-briefs`, `mapping-flows-and-ia` |
| Explore | `diverging-concepts` (with a local visual companion page) |
| Design | `designing-with-design-systems`, `designing-in-figma`, `designing-on-canvas`, `designing-in-code`, `designing-all-states`, `writing-ux-copy` |
| Verify | `critiquing-designs`, `auditing-accessibility`, `verifying-before-handoff`, `receiving-design-feedback` |
| Hand off and measure | `preparing-handoff`, `measuring-design-impact` |
| For developers and existing products | `reviewing-ux-in-code`, `improving-ui`, `following-platform-guidelines` |
| Systems and meta | `building-design-systems`, `writing-grandmaster-skills` |
| Short commands | `brief`, `research`, `critique`, `a11y`, `handoff`, `ux-check` |

Every skill states what to do when subagents, hooks or MCP tools are missing.

## Phase 5: Hooks

- [x] One session-start script (`hooks/session-start.mjs`) with output formats for Claude Code and Agent Plugins clients; under 1,000 characters of context
- [x] Always-on rule (`rules/AGENTS.md`) for Cursor and Antigravity, and a context file (`GEMINI.md`) for Gemini CLI, instead of a shared root `hooks.json` (see platforms.md)

## Phase 6: Platforms

- [ ] A manifest for every platform in [platforms.md](platforms.md), each checked against official docs on the day it is written
- [ ] Install tested on every platform that can be installed on this machine; the rest are marked as format-verified only

## Phase 7: Proof

- [ ] Full eval run with and without the plugin, on at least two models, with a pinned judge model
- [ ] `evals/RESULTS.md` written from the raw results, failures included, not edited

## Phase 8: Release

- [ ] Plugin icon
- [ ] `claude plugin validate --strict` and each platform's own validator pass
- [ ] Final README with install steps for every platform tested
- [ ] Tag `v1.0.0`, changelog entry, GitHub release
- [ ] Submission to plugin directories, only after Kemal approves

## Open questions

- **Screenshots inside evals:** the eval sandbox hides the home folder, where the browser runtime lives. Cases that need `uxg screenshot` or `uxg axe` need the runtime reachable from inside the sandbox.
