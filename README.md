<p align="center"><img src="assets/icon.png" width="96" height="96" alt=""></p>

# UX Grandmaster

A design methodology for AI agents. With UX Grandmaster installed, your agent stops jumping straight into screens: it frames the problem, gathers evidence, designs inside your design system and your platform's guidelines, gets an independent critique, proves accessibility with measurements, and only then hands off.

It is for everyone who ships a user interface with an AI agent: product designers, UX researchers, design leads, and developers, including solo builders checking an AI-written app before launch.

> Claude designs like a senior product designer and reviews like a Chief Design Officer.

## What changes

Measured with Claude Opus 5.5 in the eval suite, one run per case, so treat them as early signals:

| You ask | Without UX Grandmaster | With UX Grandmaster |
|---|---|---|
| "Design a money transfer screen for our banking app" | Built an HTML screen straight away, with no questions (score 0.17) | Asked who it is for, what job and how success is measured before designing (1.00) |
| "Build the transaction history screen" (with users and goal given) | Designed the list and an empty state, but no loading or error state (0.40) | Designed loading, empty and error states, without stopping for an interview (1.00) |
| "Review the UX of this visionOS view" | Found the problems, did not cite Apple's guidelines (0.80) | Applied and cited Apple's visionOS guidance (1.00) |
| "Is this page accessible?" | Correct findings, ratios worked out by hand | Same findings, ratios measured with `uxg contrast` (the tool-use grader only counts with the plugin) |

Where the model is already strong, the scores are equal: with and without the plugin it found the UX problems in an AI-built React app with file and line, and followed the Leeward design system's rules. It also stayed silent on unrelated coding and database tasks, as it should. The full results, including failures and mistakes in our own graders, are in [evals/RESULTS.md](evals/RESULTS.md).

## Install

Pick your agent. Each of these was tested on 2026-11-20 (see [docs/platforms.md](docs/platforms.md)).

**Claude Code**

```
/plugin marketplace add kscarfi/ux-grandmaster
/plugin install ux-grandmaster@ux-grandmaster
```

**Codex CLI**

```bash
codex plugin marketplace add kscarfi/ux-grandmaster
```

```bash
codex plugin add ux-grandmaster@ux-grandmaster
```

**GitHub Copilot CLI**

```bash
copilot plugin marketplace add kscarfi/ux-grandmaster
```

```bash
copilot plugin install ux-grandmaster@ux-grandmaster
```

**Gemini CLI**

```bash
gemini extensions install https://github.com/kscarfi/ux-grandmaster
```

**Qwen Code**

```bash
qwen extensions install https://github.com/kscarfi/ux-grandmaster
```

**Antigravity**

```bash
agy plugin install https://github.com/kscarfi/ux-grandmaster
```

**Factory Droid**

```bash
droid plugin marketplace add https://github.com/kscarfi/ux-grandmaster
```

```bash
droid plugin install ux-grandmaster@ux-grandmaster
```

**OpenCode:** clone the repository, then add its `skills` folder to `opencode.json`:

```json
{ "skills": ["/path/to/ux-grandmaster/skills"] }
```

**Cursor, VS Code agent plugins, Kiro and other agents that read Agent Skills:** the repository ships a Cursor manifest and an [Agent Plugins](https://agent-plugins.org) manifest, but installs on these were not tested yet. Any agent that reads Agent Skills can load the `skills/` folder.

The helper scripts need [Node.js](https://nodejs.org) 20 or later. Screenshots and axe checks also need a one-time `node scripts/uxg.mjs setup`, which installs Playwright and axe-core into `~/.ux-grandmaster/runtime`.

## How it works

```
FRAME → DISCOVER → DEFINE → EXPLORE → DESIGN → VERIFY → HAND OFF → MEASURE
```

The `using-ux-grandmaster` skill sizes each request (quick fix, code review, single screen or full project) and routes it. A button label gets fixed directly; "redesign our onboarding" starts with framing. Each phase has a gate, and the agent says which gate it is at.

| Phase | Skills |
|---|---|
| Frame | `framing-design-problems` |
| Discover | `researching-users-and-markets`, `analyzing-ux-data` |
| Define | `synthesizing-research`, `writing-design-briefs`, `mapping-flows-and-ia` |
| Explore | `diverging-concepts` |
| Design | `designing-with-design-systems`, `designing-in-code`, `designing-in-figma`, `designing-on-canvas`, `designing-all-states`, `writing-ux-copy`, `following-platform-guidelines` |
| Verify | `critiquing-designs`, `auditing-accessibility`, `verifying-before-handoff`, `receiving-design-feedback` |
| Hand off and measure | `preparing-handoff`, `measuring-design-impact` |
| Existing products and code | `reviewing-ux-in-code`, `improving-ui` |
| Systems and meta | `building-design-systems`, `writing-grandmaster-skills` |

Short commands: `brief`, `research`, `critique`, `a11y`, `handoff` and `ux-check` (in Claude Code, `/ux-grandmaster:ux-check`).

Four subagents give fresh eyes: `design-critic`, `accessibility-auditor`, `research-scout` and `usability-walker`. A design is never graded by the agent that made it; where an agent has no subagents, the skills say so in the report and use a fresh-eyes checklist.

## Principles

1. **Process, not tips.** Workflows with gates, triggered automatically.
2. **Evidence over opinion.** Decisions are traced to research, data, a standard, a platform guideline or a named principle, cited from the strongest source: product evidence, WCAG, platform owners, Nielsen Norman Group, Baymard, GOV.UK, research, then books.
3. **Designs never grade themselves.** Critique and audits run in separate subagents.
4. **Measured, not claimed.** Contrast, axe and analytics numbers come from scripts.
5. **System and platform first.** Your design system and your platform's guidelines before taste.
6. **Look before saying done.** Every screen is rendered and looked at.
7. **Simulated users are not users.** Walkthroughs and AI critiques are labeled as heuristics.

## The `uxg` helper

One command-line tool in `scripts/uxg.mjs`. The core commands have no dependencies.

| Command | What it does |
|---|---|
| `scan` | Finds likely UX and accessibility problems in web, SwiftUI, Jetpack Compose, Flutter and React Native code, with file and line, and lists the platform guidelines that apply |
| `contrast` | WCAG 2.2 ratio and APCA for color pairs, token files (CSS or DTCG) or a list of pairs |
| `axe` | axe-core WCAG 2.2 A and AA checks in a real browser |
| `screenshot` | Renders a page at several widths and reports sideways overflow and console errors |
| `funnel`, `cohort`, `ab-test` | Funnel conversion by segment, retention, experiment results with a sample ratio check, and sample size |
| `sources` | Research source log with date, staleness and triangulation checks |
| `decision` | Decision log in `design/decisions.md` |
| `library` | Searches your own design library, with page citations |
| `setup` | Installs the browser runtime for `axe` and `screenshot` |

```bash
node scripts/uxg.mjs scan path/to/your/app
```

## Platforms it knows

`uxg scan` and `following-platform-guidelines` cover web (WCAG 2.2, WAI-ARIA), Apple (iOS, iPadOS, macOS, watchOS, tvOS, visionOS, CarPlay), Android (phones, large screens, Wear OS, TV, cars, Android XR, AI glasses), Meta Horizon OS, Windows and Fluent, Flutter and React Native. Key numbers are quoted from the official pages with the date they were read, in [skills/following-platform-guidelines/references/platforms.md](skills/following-platform-guidelines/references/platforms.md).

## Your design library

Point UX Grandmaster at a folder of design books and papers you own, and it will cite them by title and page while it works. The index stays on your machine and nothing is uploaded. See [docs/library.md](docs/library.md).

## Evals

The suite in [evals/](evals/) runs each case with and without UX Grandmaster using `claude plugin eval`. Fixtures are original or MIT-licensed. Every run is recorded in [evals/RESULTS.md](evals/RESULTS.md), including the mistakes in our own graders.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New behavior starts with an eval that fails without it. The build, including every mistake the AI builder made and how it was caught, is logged in [docs/build-log.md](docs/build-log.md).

## Credits

- Inspired by the architecture of [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent, which gave coding agents a methodology. UX Grandmaster's text is original.
- Principles are paraphrased with attribution from Jakob Nielsen and Nielsen Norman Group, Jeff Gothelf (*Lean UX*), Adham Dannaway (*Practical UI*), Adam Wathan and Steve Schoger (*Refactoring UI*), Susan Weinschenk, W3C WAI, and the Apple, Google, Meta and Microsoft design guidelines.
- Examples and evals use the [Leeward Design System](https://github.com/kscarfi/leeward-design-system).

Designed and directed by [Kemal Salih Carfi](https://kscarfi.com). Built with Claude Code.

## License

[MIT](LICENSE)
