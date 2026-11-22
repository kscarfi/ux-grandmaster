# Privacy

UX Grandmaster does not collect, store or send any data. It has no servers, no analytics and no telemetry.

## What runs where

- **Skills and agents** are instructions that your AI agent reads. They run inside your agent, under your agent's own privacy terms.
- **Web pages.** Some skills ask your agent to read official design guidelines (for example developer.apple.com, developer.android.com, w3.org, nngroup.com) using the web tools your agent already has, with your permission.
- **Design tools.** If you connect Figma or another design tool to your agent, the skills use that connection's tools to read the design. Before any write or publish action in such a tool, the agent asks you first.

The full edition on GitHub also includes the `uxg` scripts, which run only on your machine:

- `uxg setup` downloads Playwright, axe-core and a Chromium browser from the npm registry and Playwright's download servers into `~/.ux-grandmaster/runtime`.
- `uxg library` indexes design books and papers you choose into `~/.ux-grandmaster/library`. Nothing leaves your machine.
- `uxg figma` reads Figma files with a personal access token you set in your own shell (`FIGMA_TOKEN`). The token is sent only to `api.figma.com` and is never stored or printed.

The Claude directory edition contains skills and agents only, without these scripts.

## Contact

Questions or concerns: open an issue at https://github.com/kscarfi/ux-grandmaster/issues, or report privately through the repository's Security tab.
