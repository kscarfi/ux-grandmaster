# Evals

These cases prove, or disprove, that UX Grandmaster changes what an agent does. Each case runs with the plugin and without it, and the difference is what the plugin contributed.

The suite uses the `claude plugin eval` format from Claude Code: one folder per case, with `prompt.md`, `graders/*.md` and an optional `case.yaml`.

## Cases

| Case | What it checks |
|---|---|
| `framing-gate` | A vague request ("design a money transfer screen") leads to framing questions, not a finished screen. |
| `critique-seeded-transfer` | A review of a screen with 10 seeded problems. The score is the share of problems found, plus severity ranking and no invented details. |
| `a11y-audit-transfer` | A WCAG 2.2 AA audit of the same screen: measured contrast ratios, issues automated tools miss, an honest verdict and an honest scope. |
| `funnel-payment-drop` | A drop-off question on raw event data with a known answer built in: one device segment fails at the payment step, and a tracking change hides some events. |
| `trigger-silence-coding` | An unrelated coding task. UX Grandmaster must not fire. |
| `framing-gate-onboarding`, `framing-gate-dashboard` | Two more vague requests that must start with framing. |
| `quick-fix-button-label` | A one-line copy fix. It must be done directly, with no research process. |
| `states-transaction-list` | A well-framed screen. It must cover loading, empty and error states, and must not stop for an interview. |
| `leeward-confirm-screen` | A screen built inside the Leeward design system: semantic tokens only, no raw colors, and Leeward's money rules. |
| `diverge-savings-directions` | An open product question: 2 to 4 genuinely different directions with honest downsides, and the user picks. |
| `dev-review-vibe-app` | A solo developer asks for a UX check of an AI-built React app with seeded problems. Scored on located findings (file and line) and priorities. |
| `dev-review-visionos` | A visionOS SwiftUI view. Scored on applying Apple's visionOS guidance (60 pt hit regions, Dynamic Type, labels, look-and-pinch) rather than generic advice. |
| `trigger-silence-backend` | A database migration. UX Grandmaster must not fire, even though developers are now a target audience. |
| `measure-payment-redesign` | A measurement plan: primary and guardrail metrics, a correct sample size, and experiment hygiene. |

## Fixtures

- `fixtures/transfer-screen/index.html`: a transfer screen written for these evals, with seeded problems. The answer key lives only in the graders.
- `fixtures/checkout-funnel/generate.mjs`: writes `checkout-events.csv` from a fixed seed. The known truth is described at the top of the script.

- `fixtures/leeward/`: a snapshot of the MIT-licensed [Leeward Design System](https://github.com/kscarfi/leeward-design-system) docs and light theme tokens.
- `fixtures/quick-fix/form.html`: a one-field form.
- `fixtures/vibe-app/`: a small React app with typical AI-generated UX problems.
- `fixtures/vision-app/`: a visionOS SwiftUI view with platform problems.

Fixtures are original or MIT-licensed. No case study, client work or copyrighted book material is used.

## Run

From the repository root:

```bash
claude plugin eval . --scaffold --allow-tools Write Edit Bash --trust-plugin
```

- `--scaffold` copies each case's fixture into its empty workspace.
- `--allow-tools` lets the agent write its report and run scripts. Bash runs inside Claude Code's sandbox.
- Add `--model <model>` to pin the model under test, and `--judge-model <model>` to pin the judge.

Results go to `evals/results/`, which is not committed. Summaries, including failures, go to [RESULTS.md](RESULTS.md).
