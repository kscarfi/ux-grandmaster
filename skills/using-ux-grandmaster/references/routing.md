# Routing

Pick skills from what the person says and from what they give you. Many requests need a chain of skills, run in order. Announce the chain in one line ("Using reviewing-ux-in-code, then improving-ui"), then follow it.

## By what is attached or linked

Look at every file, link and paste first. The input often decides the route better than the words.

| Input | Start with | Then, as needed |
|---|---|---|
| A figma.com link, Figma file or FigJam board | `designing-in-figma` | the skill for the user's goal: critique, accessibility, copy, handoff, code |
| A link or tool from Penpot, Sketch, Canva, Framer, Webflow, Storybook or another design tool | `working-with-design-tools` | same as Figma |
| A screenshot or image of a UI | `critiquing-designs` | `auditing-accessibility`, `improving-ui` |
| A URL of a live site or app | `reviewing-ux-in-code` (render it with `uxg screenshot`, run `uxg axe`) | `critiquing-designs`, `auditing-accessibility` |
| A code repository, pull request or diff with UI | `reviewing-ux-in-code` | `improving-ui`, `following-platform-guidelines` |
| Interview notes, transcripts, usability test notes, survey answers, support tickets, app reviews | `synthesizing-research` | `writing-design-briefs` |
| A CSV, analytics export or event log | `analyzing-ux-data` | `measuring-design-impact` |
| A/B test numbers | `analyzing-ux-data` (`uxg ab-test`) | `measuring-design-impact` |
| A PRD, brief, ticket or requirements doc | `framing-design-problems` (check it against the framing questions) | `writing-design-briefs`, `mapping-flows-and-ia` |
| A design spec or handoff doc | `preparing-handoff` (check completeness) | `designing-all-states` |
| Token files, a DESIGN.md, a component library | `designing-with-design-systems` or `building-design-systems` | `auditing-accessibility` (`uxg contrast --tokens`) |
| A list of UI strings, a copy deck, a locale file | `writing-ux-copy` | |
| A user flow, sitemap or journey | `mapping-flows-and-ia` | `critiquing-designs` |
| An org chart, team plan or job description | `leading-design-teams` | `growing-design-careers`, `running-design-operations` |
| A portfolio or case study | `growing-design-careers` | `presenting-design-work` |
| A slide deck or presentation | `presenting-design-work` | `refining-generated-designs` |
| A research plan, consent form or screener | `running-research-operations` | `researching-users-and-markets` |

## By what the person says

| They say something like | Chain |
|---|---|
| "Design a …" with no context | `framing-design-problems` → `writing-design-briefs` → `diverging-concepts` → design skills → verify |
| "Build the … screen" with users and goal given | `designing-with-design-systems` + `designing-in-code` + `designing-all-states` + `writing-ux-copy` → `refining-generated-designs` → `critiquing-designs` → `auditing-accessibility` |
| "Check my app", "is my UI good", "find UX bugs", "polish this" | `reviewing-ux-in-code` → `improving-ui` |
| "Review", "critique", "feedback on this design" | `critiquing-designs` (+ `following-platform-guidelines` when a platform is known) |
| "Is this accessible", "WCAG", "a11y" | `auditing-accessibility` |
| "Why do users drop off", "did the test win" | `analyzing-ux-data` |
| "How should we measure", "KPIs", "A/B test plan" | `measuring-design-impact` |
| "Research …", "how do competitors …" | `researching-users-and-markets` → `synthesizing-research` |
| "Give me ideas", "options", "directions" | `diverging-concepts` |
| "User flow", "IA", "navigation" | `mapping-flows-and-ia` |
| "What should this button say", "error message" | `writing-ux-copy` |
| "Our design system …", "tokens" | `designing-with-design-systems` or `building-design-systems` |
| "For Vision Pro / Android XR / Quest / watch / TV / car" | `following-platform-guidelines` + the design or review skills |
| "Hand off", "spec", "acceptance criteria" | `verifying-before-handoff` → `preparing-handoff` |
| "The PM / developers / stakeholders …", "how do I work with …" | `collaborating-across-disciplines` |
| "Present", "pitch", "convince leadership" | `presenting-design-work` |
| "Stakeholder said …", "they want changes" | `receiving-design-feedback` |
| "DesignOps", "our design process", "rituals", "tooling" | `running-design-operations` |
| "ResearchOps", "recruiting participants", "research repository" | `running-research-operations` |
| "AI policy", "AI tools for our team", "AIOps" | `operating-ai-in-design` |
| "Build / structure / hire a design team", "design maturity" | `leading-design-teams` |
| "Career", "promotion", "portfolio", "interview", "ladder" | `growing-design-careers` |

## Always

- Anything generated and visual passes `refining-generated-designs` before it is shown.
- A design is not called done before `verifying-before-handoff`.
- When the request is open ("take a look at this"), say what you can do with what was given and propose the two or three most useful next steps.
