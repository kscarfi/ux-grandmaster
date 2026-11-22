---
name: designing-all-states
description: Designs every state of a screen or component, not just the happy path. Use whenever designing or building a screen, list, form, data view, dashboard or component, and when reviewing one. Covers default, loading, empty, error, success, disabled, partial and long content, first use, offline and permission states.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Designing all states

Users spend more time in the edge states than designers expect. A screen is not designed until each state that can happen is designed.

## The states

Go through the list for every screen and component. For each one, design it or write one line on why it cannot happen.

| State | Design question |
|---|---|
| **Default** | The normal case with realistic data. |
| **Loading** | What shows while data loads? Skeletons that match the final layout beat spinners for content; mark the region busy for assistive technology. Past about 10 seconds, show progress or a way out (Nielsen's response-time limits). |
| **Empty, first use** | Nothing here yet. Explain what will appear and offer the first action. |
| **Empty, no results** | A search or filter found nothing. Say so, show what was searched, offer to clear filters. |
| **Error** | Loading failed, saving failed, the network dropped. Say what happened in plain words, keep the user's input, offer a retry. Never show a raw error code alone. |
| **Partial** | Some data loaded, some failed. Show what is there and mark what is missing. |
| **Success** | The action worked. Confirm what happened and what comes next. |
| **Form submission** | Every form: validation per field, a submitting state that prevents double submits, success, and failure with retry. |
| **Disabled and read-only** | Why can't the user act, and how do they unlock it? Prefer explaining over a silently disabled button. |
| **Long content** | Long names, big numbers, many items, translated text, which often runs much longer than English. Truncate with care and keep the full value reachable. |
| **Permissions** | The user lacks access, or a system permission (camera, location, notifications) was refused. |
| **Offline** | What still works, what is queued, what is blocked. |

## In code

Make the states reachable so they can be seen and tested, for example a small state switcher in a prototype or one story per state in Storybook. Use the design system's own loading, empty and error components when it has them.

## Copy

Each state needs real copy, written with `writing-ux-copy`: what happened, then what to do. "We couldn't load your transactions. Check your connection and try again." Not "Error 500".

## Verify

`verifying-before-handoff` renders every state, not just the default.
