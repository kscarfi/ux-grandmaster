#!/usr/bin/env node
// UX Grandmaster command-line helpers. Run `node scripts/uxg.mjs help` for the list.

const COMMANDS = {
  contrast: "WCAG 2.2 and APCA contrast for color pairs or a token file",
  library: "Index and search your own design library, with page citations",
  funnel: "Step conversion and drop-off from an event CSV, by segment",
  cohort: "Retention table by start week or month",
  "ab-test": "Read an A/B test (with sample ratio check) or plan its sample size",
  sources: "Log research sources and check dates, staleness and triangulation",
  decision: "Append a design decision with its evidence to design/decisions.md",
};

const [, , name, ...rest] = process.argv;

if (!name || name === "help" || name === "--help" || name === "-h") {
  const width = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
  console.log(
    [
      "Usage: uxg <command> [options]",
      "",
      "Commands:",
      ...Object.entries(COMMANDS).map(([k, v]) => `  ${k.padEnd(width)}  ${v}`),
      "",
      "Run `uxg <command> --help` for a command's options.",
    ].join("\n"),
  );
  process.exit(0);
}

if (!(name in COMMANDS)) {
  console.error(`Unknown command "${name}". Run \`uxg help\` for the list.`);
  process.exit(2);
}

try {
  const mod = await import(`./commands/${name}.mjs`);
  const { output, code } = await mod.run(rest);
  if (output) console.log(output);
  process.exit(code);
} catch (err) {
  const usage = err?.name === "UsageError" || err?.constructor?.name === "UsageError" || err?.code?.startsWith?.("ERR_PARSE_ARGS");
  console.error(`uxg ${name}: ${err.message}`);
  if (usage) console.error(`Run \`uxg ${name} --help\` for usage.`);
  process.exit(2);
}
