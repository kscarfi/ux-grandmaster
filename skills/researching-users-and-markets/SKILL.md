---
name: researching-users-and-markets
description: Runs design research - desk and web research, competitive teardowns, and plans for interviews, surveys and usability tests. Use when the user asks to research a topic, users, a market or competitors, asks "how do others handle X", needs evidence before designing, or wants an interview guide or test plan. Searches from several angles, reads primary sources, triangulates key claims, dates everything and separates fact from inference.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Researching users and markets

Research is only as good as its sources. Every claim has a source, a date and a confidence level.

> **Measuring:** this edition has no helper scripts. Where a step says `uxg <command>`, do the same measurement with a tool you have (a short script you write, a browser or design tool check) and say how each number was produced. The full edition, with the `uxg` scripts, is at https://github.com/kscarfi/ux-grandmaster.

## 1. Start from the question

Write the research question and what decision it informs: "How do neobanks let people freeze a card, so we can decide where the control lives." Agree on it with the user if it is not obvious.

## 2. Desk and web research

1. **Plan angles.** Three to five different angles, for example: official product docs and help centers, app store pages and release notes, regulator and standards documents, independent research and articles, user discussions (forums, reviews).
2. **Search in parallel.** If subagents are available, give each angle to a `research-scout` subagent. Otherwise run the searches one angle at a time.
3. **Open and read.** Do not cite a search snippet. Open the page and read the relevant part.
4. **Prefer primary sources:** the product itself, its official docs, the original study or dataset. A blog post about a study is secondary.
5. **Triangulate key claims.** A claim the design depends on needs at least two independent sources, one of them primary.
6. **Date everything:** when the source was published or updated, and when you read it. Products change; say so when a source may be out of date.
7. **Log sources** as you go: `uxg sources add --claim <id> --url <url> --title <title> --summary <your words> --type primary|secondary --published <date> [--key]`. Run `uxg sources check` before reporting.
8. **Check the user's library** for principles and earlier research: `uxg library search "<topic>"`.

## 3. Competitive teardown

For each product: what it does for the job, the flow step by step (with screenshots if you can take them, dated), what works, what fails, and what is unknown. Compare in a table. Note that you saw the public version on a given date.

## 4. Planning primary research

When desk research cannot answer the question, plan research with real people:

- **Interviews:** goal, who to recruit and how many (five to eight per segment is a common starting point for interviews), screener questions, and a guide that starts broad and asks about past behavior ("Tell me about the last time you…"), not opinions about the future or leading questions ("Wouldn't it be easier if…").
- **Usability tests:** tasks written as goals, not instructions ("You want to stop your card being used" rather than "Tap Freeze"), success criteria per task, what to measure (success, time, errors), and moderator notes.
- **Surveys:** only for questions of "how many", with neutral wording, one idea per question and an "other" option.

You can draft guides and analyze transcripts. You cannot interview people. Never present simulated answers as user research.

## 5. Report

| Finding | Evidence | Sources | Confidence |
|---|---|---|---|

- **Confidence:** high (several independent primary sources agree), medium (one primary or several secondary), low (single secondary source, or inference).
- Separate what sources say from what you infer. Mark inference.
- End with open questions and what research would answer them.

Then use `synthesizing-research` to turn findings into insights.
