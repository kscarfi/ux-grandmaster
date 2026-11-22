# Privacy

The published version of this policy is at https://kscarfi.github.io/ux-grandmaster/privacy/.

UX Grandmaster does not collect, store or send any data. It has no servers, no analytics and no telemetry.

## Personal data

Some skills read content you give your agent that can contain personal data, for example interview notes with participant details, or comments in a design file with author names. UX Grandmaster does not store this content anywhere. The skills tell the agent to remove personal data from findings it shares and not to put research participant data into tools that are not approved for it.

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
