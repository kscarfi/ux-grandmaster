# Critique checklist

Go through the sections in order. Write down every issue first; rank them afterwards. Sources are named so the principle can be checked; the wording here is our own.

## 1. Task and brief

- Can the target user complete the main job on this screen without help? Walk the steps.
- Does the screen answer the brief's goal, or something else?
- Is anything on the screen not needed for the job? Each extra element competes for attention.

## 2. Visual hierarchy

- What do you see first, second, third? Squint or blur the screenshot. It should match the order of importance for the job.
- One primary action per screen or section. Secondary actions look clearly weaker; destructive actions are distinct and need confirmation. (Practical UI, Adham Dannaway: three button weights; one primary action.)
- Hierarchy comes from weight, color and spacing, not only size. Emphasize by de-emphasizing the rest. (Refactoring UI, Wathan and Schoger.)
- Labels are a last resort: when a value is clear from its format or context, it may not need a label. (Refactoring UI.)
- Numbers that matter (amounts, prices, fees) are easy to find and never styled down.

## 3. Layout, grouping and spacing

- Related items are close together; unrelated items are further apart. Spacing between groups is clearly larger than inside them. (Gestalt proximity; Practical UI.)
- Items that look alike behave alike. (Gestalt similarity.)
- Spacing comes from a consistent scale, not arbitrary values.
- Alignment is consistent; avoid several competing alignments in one view.
- The layout holds at 360 px and at desktop width. Long names, large numbers and translated text do not break it.

## 4. Interaction

- **Fitts's law:** frequent and important targets are large and close to where the hand or pointer already is. Touch targets are at least 24 by 24 CSS px for WCAG 2.2 AA; 44 to 48 px is the common platform guidance.
- **Hick's law:** many equal choices slow decisions. Group, prioritize or progressively disclose.
- Every action gives feedback: pressed, loading, done, failed.
- Destructive or irreversible actions add friction: confirmation, undo, or a clear summary first.

## 5. Nielsen's ten usability heuristics

1. Visibility of system status
2. Match between the system and the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose and recover from errors
10. Help and documentation

Check each one explicitly. (Jakob Nielsen, Nielsen Norman Group.)

## 6. Forms

- Every field has a visible label. Placeholder text is not a label: it disappears when typing starts. (Practical UI.)
- Hints that explain the format sit before the field, not inside it.
- Fields are in one column, in a logical order, with only the fields that are needed.
- Field width matches the expected input.
- Errors say what went wrong and how to fix it, next to the field, and do not rely on color alone.
- Prefer radio buttons to a dropdown for a few options; prefer autocomplete for long lists.

## 7. Content and copy

- Labels describe outcomes: "Send ₺250", not "Submit".
- One term per concept, everywhere. "Transfer", "payment" and "send money" for the same action is a defect.
- Plain language, front-loaded: the important word first.
- Sentence case. No jargon, no internal codes in user-facing messages.
- Numbers, dates and currencies follow the user's locale.

## 8. People and cognition

- Working memory is small: do not make people remember information from one screen to use on another. (Susan Weinschenk, *100 Things Every Designer Needs to Know About People*.)
- Recognition is easier than recall: show options instead of asking people to type from memory.
- People scan; they do not read. Headings, short paragraphs and clear groups help.
- People make more mistakes under stress, and money, health and deadlines cause stress. Design for slips: confirmation, undo, clear summaries.
- Trust is judged on look and feel first. Inconsistency or sloppiness reads as risk.

## 9. States

Check that each of these is designed, not just the happy path: default, loading, empty, error, success, disabled, long content, first use, offline. (See `designing-all-states`.)

## 10. Design system

- Only the system's components and tokens are used. No raw colors, sizes or one-off components where the system has an answer.
- The system's own rules are followed (for example, how money, errors or status are shown).
- Gaps in the system are proposed as additions, not hacked locally.

## 11. Accessibility first pass

Contrast, names for icon-only controls, focus visibility, heading order, color as the only signal. The full audit is `auditing-accessibility`.
