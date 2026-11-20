#!/usr/bin/env node
// Session-start hook. Prints a short, factual note so the agent knows UX
// Grandmaster is available. Output format depends on the client:
//   --format claude   Claude Code: JSON with hookSpecificOutput.additionalContext
//   --format portable Agent Plugins clients: JSON with additional_context
//   --format text     Plain text (any client that injects stdout)
// Keep the note well under the 10,000 character limit some clients apply.

const NOTE = `UX Grandmaster is installed: a design methodology plugin (frame, research, explore, design inside the design system and platform guidelines, independent critique, measured accessibility, verify, hand off, measure).

How it is used in this session: when a request involves designing, building, reviewing, critiquing, auditing or polishing anything a user sees (a screen, page, flow, component, app or UX copy), or analyzing UX data, the first step is to load the "using-ux-grandmaster" skill with the skill tool, before writing any design, code or review. That skill sizes the task and names the next skill. A request like "design a screen" with no information about its users counts: it starts with framing questions, not a finished screen. Requests with no user-facing part (backend, data pipelines, infrastructure) do not use it.

Short commands: brief, research, critique, a11y, handoff, ux-check (a fast UX check of the code, for developers).`;

const arg = process.argv.indexOf("--format");
const format = arg !== -1 ? process.argv[arg + 1] : "claude";

if (format === "text") {
  process.stdout.write(NOTE + "\n");
} else if (format === "portable") {
  process.stdout.write(JSON.stringify({ additional_context: NOTE }));
} else {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: NOTE } }),
  );
}
