#!/usr/bin/env node
// Session-start hook. Prints a short, factual note so the agent knows UX
// Grandmaster is available. Output format depends on the client:
//   --format claude   Claude Code: JSON with hookSpecificOutput.additionalContext
//   --format portable Agent Plugins clients: JSON with additional_context
//   --format text     Plain text (any client that injects stdout)
// Keep the note well under the 10,000 character limit some clients apply.

const NOTE = `UX Grandmaster is installed. It is a design methodology: frame the problem, research, explore directions, design inside the team's design system, get an independent critique, prove accessibility, verify, hand off and measure.

For any task that designs, reviews, builds, researches or measures a user-facing product, screen, flow, component or UX copy, including a developer checking their own app, the skill "using-ux-grandmaster" describes how to size the task (quick fix, single screen, full project) and which skill to use. Unrelated tasks do not need it.

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
