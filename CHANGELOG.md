# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-11-22

### Added

- Routing by message and by attached input: Figma and design tool links, screenshots, code, transcripts, CSVs, PRDs, org charts and more, with skill chains (`skills/using-ux-grandmaster/references/routing.md`).
- `designing-in-figma` reads through the Figma MCP server or, without one, the REST API; `uxg figma` (outline, text, inventory, export).
- `working-with-design-tools` for Penpot, Sketch, Canva, Framer, Webflow, Storybook and design system MCP servers.
- `refining-generated-designs`: the quality gate for every generated page, artifact, canvas and deck.
- `running-design-operations`, `running-research-operations`, `operating-ai-in-design`, `collaborating-across-disciplines`, `presenting-design-work`, `leading-design-teams`, `growing-design-careers`.
- Network hosts declared in the Claude Code manifest; an OpenAI directory submission archive (`scripts/build-submission.mjs`).
- Eval cases for routing, DesignOps, collaboration, generated artifacts and Figma (with a mocked Figma MCP server).

### Changed

- The bootstrap skill now loads each skill in a chain before using it, keeps advice to three ranked changes, and states the states rule for single screens directly.
- Session note and always-on rules cover design tool links, research and design-team topics.

### Removed

- The Superpowers reference in the README.

## [1.0.0] - 2026-11-20

First public release.

### Added

- Repository foundation: license, code of conduct, security policy, contributing guide, build log and 1.0 build plan.
- `uxg` command-line helpers: `contrast`, `library`, `funnel`, `cohort`, `ab-test`, `sources`, `decision`, `screenshot`, `axe` and `setup`, with tests.
- Personal design library: index and search your own books and papers locally, with page citations.
- First eval cases and original fixtures.
- Skills for the whole method, four subagents and a session hook.
- For developers: `uxg scan` finds UX problems in code with file and line; `reviewing-ux-in-code`, `improving-ui` and `following-platform-guidelines` (Apple, Android, Android XR, Meta Horizon OS, Windows, web) skills; `ux-check` short command.
- Platform manifests for Claude Code, Agent Plugins clients, Cursor, Antigravity, Gemini CLI and Factory Droid, generated from one source.

[Unreleased]: https://github.com/kscarfi/ux-grandmaster/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/kscarfi/ux-grandmaster/releases/tag/v1.1.0
[1.0.0]: https://github.com/kscarfi/ux-grandmaster/releases/tag/v1.0.0
