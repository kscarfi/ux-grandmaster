---
name: writing-ux-copy
description: Writes and reviews interface copy - button labels, form labels, hints, errors, empty states, confirmations, notifications and onboarding text. Use whenever a design needs words, when the user asks what a button or message should say, and when reviewing copy. Writes outcome-based labels, helpful errors and consistent terms, in the product's voice, ready for translation.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Writing UX copy

Interface words are part of the design, not filler added at the end. Write real copy while designing.

## 1. Find the voice

Look for the product's voice and terminology first: a content guide, the design system's copy rules, existing screens. Use its words for its concepts. If there is no guide, write plain, calm and direct, in second person.

## 2. Rules

**Labels and buttons**
- Say what happens: "Send ₺250", "Freeze card", "Save changes". Not "Submit", "OK" or "Yes".
- Start with a verb. Keep it to a few words.
- Destructive actions name the thing destroyed: "Delete account", not "Confirm".
- Dialog titles can be questions that the buttons answer: "Freeze your card?" with "Freeze card" and "Cancel".

**Form fields**
- Every field has a visible label naming the data: "Email address".
- Hints say format or why it is needed, before the field: "We send the receipt here."
- Do not use "my" in labels ("My email"); the interface is speaking to the user.

**Errors**
- Say what happened and what to do, next to the problem: "This IBAN is too short. Check it and try again."
- Do not blame ("You entered an invalid…"), do not show codes alone, do not shout.
- If the system failed, say so and keep the user's input.

**Empty states and confirmations**
- Empty: what will appear here and how to start. "No transactions yet. Your payments will show up here."
- Confirmation: what happened and what comes next. "₺250 sent to Ayşe. It usually arrives in seconds."

**Everywhere**
- One term per concept across the product. Make a short glossary when there is none.
- Sentence case. Front-load the important word. Numerals for numbers.
- Plain words over jargon. Write for a stressed person in a hurry.
- No hype words, no exclamation marks in system messages, no em dashes.

## 3. Ready for translation

- No text inside images. No sentences assembled from fragments ("You have" + n + "items"); use full strings with placeholders and plural rules.
- Leave room: translated strings are often much longer.
- Dates, times, numbers and currency come from locale formatting, not hand-written strings.

## 4. Deliver

For a screen, give the copy as a table so it can be reviewed and handed off:

| Element | Copy | Notes |
|---|---|---|
| Primary button | Send ₺250 | Amount updates with input |
