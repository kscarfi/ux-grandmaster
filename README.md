<p align="center"><img src="assets/icon.png" width="96" height="96" alt=""></p>

# UX Grandmaster

A design methodology for AI agents. With UX Grandmaster installed, your agent works the way a senior product designer works: it frames the problem before drawing, uses evidence, designs inside your design system and your platform's guidelines, gets an independent critique, measures accessibility instead of guessing, and checks everything it generates before you see it.

It is built for everyone who shapes a product with an AI agent:

- **Designers at every level**, from intern to head of design: framing, research, flows, design, critique, accessibility, handoff, measurement.
- **Developers and solo builders**, including people shipping AI-written apps: find UX and accessibility problems in your code with file and line, and fix them.
- **Researchers**: research plans, sourced desk research, synthesis with honest evidence counts, ResearchOps.
- **Design leaders**: DesignOps, team structure, hiring, career ladders, AI policy for design teams, presenting design's impact.

## What it does differently

Measured in the eval suite (one run per case, so read these as early signals; full results in [evals/RESULTS.md](evals/RESULTS.md)):

| Request | Without UX Grandmaster | With UX Grandmaster |
|---|---|---|
| "Design a money transfer screen for our banking app" | Built a screen at once, with no questions (Opus 0.17, Haiku 0.50) | Asked who it is for, what job and how success is measured, before designing (1.00 on both) |
| "Build the transaction history screen" (users and goal given) | List and empty state, no loading or error state (0.40 on Opus and Haiku) | All states designed, without stopping for an interview (1.00 on both) |
| "What did we learn?" with interview notes attached | Themes, with weaker evidence handling (Opus 0.75) | Insights tied to participants, with confidence and limits (Opus 1.00) |
| "Make a landing page" | No designed outcome for the waitlist form (Opus 0.80) | Validation, success and error states, through the quality gate (Opus 1.00) |
| "My 6 designers feel isolated and handoffs are messy" | A long list of good practices (0.50 on Opus and Haiku) | Three owned, measurable changes aimed at the two problems (1.00 on both) |
| A Figma link and "check it before handoff" | | Read the file through the Figma MCP server, found missing states, labels, fee visibility and system drift, and gave a handoff verdict (1.00 on Opus and Haiku, mocked server) |
| "Review this visionOS view" | Found the problems, did not cite Apple's guidelines (0.80) | Applied and cited Apple's visionOS guidance (1.00) |
| "Give me directions", "How should we measure this?" | Haiku 0.67 on each | Haiku 1.00 on each |

Where the model already does well, scores stay equal, and UX Grandmaster stays out of the way of backend, coding and one-line tasks.

## Install

Each command below was tested on the date in [docs/platforms.md](docs/platforms.md).

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

**OpenCode:** clone the repository and add its `skills` folder to `opencode.json`:

```json
{ "skills": ["/path/to/ux-grandmaster/skills"] }
```

**Cursor, VS Code agent plugins, Kiro and other Agent Skills clients:** the repository ships a Cursor manifest and an [Agent Plugins](https://agent-plugins.org) manifest; installs on these were not tested yet. Any agent that reads Agent Skills can load the `skills/` folder.

The helper scripts need [Node.js](https://nodejs.org) 20 or later. Rendering and axe checks also need a one-time `node scripts/uxg.mjs setup`, which installs Playwright and axe-core into `~/.ux-grandmaster/runtime`.

## How it works

You talk to your agent as usual. UX Grandmaster reads your message and anything you attach, then picks one skill or a chain of skills:

| You give it | It starts with |
|---|---|
| A vague design request | Framing questions, one at a time |
| A Figma link | Reading the file through the Figma MCP server (or the REST API), then critique, accessibility, copy, handoff or code |
| A Penpot, Sketch, Canva, Framer or other design tool link | The tools that are connected, then the same checks |
| A screenshot | An independent critique |
| Your app's code or a pull request | A UX review with file and line, then UI improvements |
| Interview notes or transcripts | Research synthesis with evidence counts |
| A CSV or analytics export | Funnel, cohort or experiment analysis, computed by script |
| A question about your team, process or career | DesignOps, leadership or career guidance, short and ranked |

Every project moves through the same phases, with a gate before each next step:

```
FRAME → DISCOVER → DEFINE → EXPLORE → DESIGN → VERIFY → HAND OFF → MEASURE
```

A one-line copy fix skips all of it. "Redesign our onboarding" starts at framing.

## Skills

| Area | Skills |
|---|---|
| Start and route | `using-ux-grandmaster` |
| Frame and discover | `framing-design-problems`, `researching-users-and-markets`, `analyzing-ux-data` |
| Define | `synthesizing-research`, `writing-design-briefs`, `mapping-flows-and-ia` |
| Explore | `diverging-concepts` |
| Design | `designing-with-design-systems`, `designing-in-code`, `designing-on-canvas`, `designing-all-states`, `writing-ux-copy`, `following-platform-guidelines` |
| Design tools | `designing-in-figma`, `working-with-design-tools` |
| Verify | `refining-generated-designs`, `critiquing-designs`, `auditing-accessibility`, `verifying-before-handoff`, `receiving-design-feedback` |
| Existing products and code | `reviewing-ux-in-code`, `improving-ui` |
| Hand off and measure | `preparing-handoff`, `measuring-design-impact` |
| Working with others | `collaborating-across-disciplines`, `presenting-design-work` |
| Operations | `running-design-operations`, `running-research-operations`, `operating-ai-in-design` |
| Leadership and growth | `leading-design-teams`, `growing-design-careers` |
| Design systems and meta | `building-design-systems`, `writing-grandmaster-skills` |

**Short commands:** `brief`, `research`, `critique`, `a11y`, `handoff`, `ux-check`. In Claude Code they run as `/ux-grandmaster:<name>`.

**Subagents for fresh eyes:** `design-critic`, `accessibility-auditor`, `research-scout`, `usability-walker`. A design is never graded by the agent that made it. On agents without subagents, the skills say so in the report and use a fresh-eyes checklist.

## Principles

1. **Process, not tips.** Workflows with gates, chosen automatically.
2. **Evidence over opinion.** Decisions trace to product evidence, WCAG, platform owners' guidelines, Nielsen Norman Group, Baymard, GOV.UK, research or named books, in that order of strength.
3. **Designs never grade themselves.** Critique and audits run in separate subagents.
4. **Measured, not claimed.** Contrast, axe and analytics numbers come from scripts.
5. **System and platform first.** Your design system and the platform's guidelines come before taste.
6. **Nothing generated is shown unrefined.** Pages, artifacts, canvases and decks pass a quality gate first.
7. **Simulated users are not users.** Walkthroughs and AI critiques are labeled as heuristics.

## The `uxg` helper

One command-line tool, `scripts/uxg.mjs`. The core commands have no dependencies.

| Command | What it does |
|---|---|
| `scan` | Likely UX and accessibility problems in web, SwiftUI, Jetpack Compose, Flutter and React Native code, with file and line, plus the platform guidelines that apply |
| `figma` | Reads a Figma file through the REST API: frames, text, the colors and type in use, and PNG exports |
| `contrast` | WCAG 2.2 ratio and APCA for color pairs, token files or a list of pairs |
| `axe` | axe-core WCAG 2.2 A and AA checks in a real browser |
| `screenshot` | Renders a page at several widths; reports sideways overflow and console errors |
| `funnel`, `cohort`, `ab-test` | Funnels by segment, retention, experiment results with a sample ratio check, sample size |
| `sources` | Research source log with date, staleness and triangulation checks |
| `decision` | Decision log in `design/decisions.md` |
| `library` | Searches your own design library, with page citations |
| `setup` | Installs the browser runtime for `axe` and `screenshot` |

```bash
node scripts/uxg.mjs scan path/to/your/app
```

## Platforms it knows

Web (WCAG 2.2, WAI-ARIA), Apple (iOS, iPadOS, macOS, watchOS, tvOS, visionOS, CarPlay), Android (phones, large screens, Wear OS, TV, cars, Android XR, AI glasses), Meta Horizon OS, Windows and Fluent, Flutter and React Native. Key numbers are quoted from the official pages with the date they were read, in [skills/following-platform-guidelines/references/platforms.md](skills/following-platform-guidelines/references/platforms.md).

## Figma and other design tools

With the Figma MCP server connected, UX Grandmaster reads frames, variables, components and comments, and with write access it designs using your library. Without it, set a personal access token with the `file_content:read` scope in `FIGMA_TOKEN` in your own shell, and `uxg figma` reads the file through the REST API. Penpot, Sketch, Canva, Framer, Webflow, Storybook and design system MCP servers work through whatever tools they expose.

## Your design library

Point UX Grandmaster at a folder of design books and papers you own, and it cites them by title and page while it works. The index stays on your machine and nothing is uploaded. See [docs/library.md](docs/library.md).

## Evals

The suite in [evals/](evals/) runs each case with and without UX Grandmaster using `claude plugin eval`, on Claude Opus 5.5 and Claude Haiku 5.5. Fixtures are original or MIT-licensed. Every run is recorded in [evals/RESULTS.md](evals/RESULTS.md) as it came out, including failures and mistakes in our own graders.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New behavior starts with an eval that fails without it. The build, including every mistake the AI builder made and how it was caught, is in [docs/build-log.md](docs/build-log.md).

## Credits

Principles are paraphrased with attribution from Jakob Nielsen and Nielsen Norman Group, Jeff Gothelf (*Lean UX*), Adham Dannaway (*Practical UI*), Adam Wathan and Steve Schoger (*Refactoring UI*), Susan Weinschenk, InVision's DesignBetter books, Peter Merholz and Kristin Skinner, W3C WAI, and the Apple, Google, Meta and Microsoft design guidelines. Examples and evals use the [Leeward Design System](https://github.com/kscarfi/leeward-design-system).

Designed and directed by [Kemal Salih Carfi](https://kscarfi.com). Built with Claude Code.

## License

[MIT](LICENSE)
