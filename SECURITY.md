# Security policy

## Supported versions

Only the latest release gets security fixes.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through the repository's **Security** tab, using **Report a vulnerability**. Include:

- What the problem is and where it is (file, script, hook or skill)
- Steps to reproduce it
- What an attacker could do with it

You will get a first reply within 7 days. Once a fix is ready, it ships in a tagged release and the advisory is published with credit to you, unless you ask to stay anonymous.

## Scope

UX Grandmaster ships skills (Markdown), hook scripts and helper scripts that run on your machine. Problems we treat as security issues:

- A hook or script that runs commands it should not, or reads files outside the project or the plugin folder
- A skill that tells the agent to send your data to an outside service without asking you
- Secrets committed to the repository
