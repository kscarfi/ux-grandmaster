# Road to 1.0

UX Grandmaster ships as one complete 1.0 release. This file tracks the build in order. Each phase ends with its checks passing, not with a claim.

## Phase 0: Foundation

- [x] License, code of conduct, security policy, contributing guide, changelog, build log
- [x] Platform research started ([platforms.md](platforms.md))
- [x] Public GitHub repository

## Phase 1: Evals before skills

- [ ] Eval cases for every core skill, 3 or more each, in `claude plugin eval` format
- [ ] Trigger calibration cases: skills fire on design work and stay silent on unrelated tasks
- [ ] Fixtures written from scratch: screens with seeded issues, token files with known contrast pairs, analytics CSVs with known answers
- [ ] Baseline run with a manifest-only plugin, so the no-plugin scores exist before any skill text

## Phase 2: Scripts

Node.js ES modules, each with tests (`node --test`), clear error messages and documented constants.

- [ ] `contrast`: WCAG 2.2 ratio and APCA, for color pairs or a token file
- [ ] `axe-check`: Playwright plus axe-core on a URL or local HTML
- [ ] `screenshot`: renders a page at given viewport sizes
- [ ] `funnel`, `cohort`, `ab-test`: analytics with sample ratio check, effect sizes and confidence intervals
- [ ] `source-log`: template and validator for research sources
- [ ] `decision-log`: appends a decision with its evidence to `design/decisions.md`

## Phase 3: Agents

- [ ] `design-critic`
- [ ] `accessibility-auditor`
- [ ] `research-scout`
- [ ] `usability-walker`

## Phase 4: Skills

| Group | Skills |
|---|---|
| Bootstrap | `using-ux-grandmaster` (+ `references/<platform>-tools.md`) |
| Frame and discover | `framing-design-problems`, `researching-users-and-markets`, `analyzing-ux-data` |
| Define | `synthesizing-research`, `writing-design-briefs`, `mapping-flows-and-ia` |
| Explore | `diverging-concepts` (with a local visual companion page) |
| Design | `designing-with-design-systems`, `designing-in-figma`, `designing-on-canvas`, `designing-in-code`, `designing-all-states`, `writing-ux-copy` |
| Verify | `critiquing-designs`, `auditing-accessibility`, `verifying-before-handoff`, `receiving-design-feedback` |
| Hand off and measure | `preparing-handoff`, `measuring-design-impact` |
| Systems and meta | `building-design-systems`, `writing-grandmaster-skills` |
| Short commands | `brief`, `research`, `critique`, `a11y`, `handoff` |

Every skill states what to do when subagents, hooks or MCP tools are missing.

## Phase 5: Hooks

- [ ] One session-start script that serves both Claude Code (`hooks/hooks.json`) and Agent Plugins clients (`hooks.json`), and keeps injected context under 10,000 characters

## Phase 6: Platforms

- [ ] A manifest for every platform in [platforms.md](platforms.md), each checked against official docs on the day it is written
- [ ] Install tested on every platform that can be installed on this machine; the rest are marked as format-verified only

## Phase 7: Proof

- [ ] Full eval run with and without the plugin, on at least two models, with a pinned judge model
- [ ] `evals/RESULTS.md` written from the raw results, failures included, not edited
- [ ] End-to-end examples in `examples/`

## Phase 8: Release

- [ ] Plugin icon
- [ ] `claude plugin validate --strict` and each platform's own validator pass
- [ ] Final README with install steps for every platform tested
- [ ] Tag `v1.0.0`, changelog entry, GitHub release
- [ ] Submission to plugin directories, only after Kemal approves

## Open questions

- **Leeward:** the plan uses the Leeward design system for examples and evals, but it is not in this repository yet.
