---
name: following-platform-guidelines
description: Applies the official design guidelines of the platform an app runs on - Apple Human Interface Guidelines (iOS, iPadOS, macOS, watchOS, tvOS, visionOS, CarPlay), Material Design and Android (phones, tablets, foldables, Wear OS, TV, cars, Android XR, AI glasses), Meta Horizon OS, Windows and Fluent, and the web (WCAG, WAI-ARIA). Use when designing, building or reviewing for a specific device or OS, when a project targets Apple Vision Pro, Android XR, Quest, a watch, a TV or a car, or when someone asks what the platform expects.
license: MIT
metadata:
  author: Kemal Salih Carfi
  project: https://github.com/kscarfi/ux-grandmaster
---

# Following platform guidelines

People learn conventions from their device. An app that follows them feels obvious; one that fights them feels broken. Read the platform owner's current guidelines and cite them.

> **Running `uxg`:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/uxg.mjs" <command>`. If `${CLAUDE_PLUGIN_ROOT}` is not filled in on your platform, the script is `../../scripts/uxg.mjs` from this skill's folder. It is not on the PATH. Below, `uxg <command>` is short for this.

## 1. Know the platform

Run `uxg scan <folder>` to detect it from the project (it reads package.json, Xcode projects, Gradle files, Android manifests, pubspec.yaml and Unity packages), or ask. Many apps target several: a React Native app is iOS and Android; a Compose app may also ship to large screens and Android XR.

## 2. Read the current guidance

Guidelines change every year. Read the official page for the topic at hand; do not rely on memory. [references/platforms.md](references/platforms.md) lists the entry points and the key numbers checked on the date shown there.

How to read them:

- **Apple HIG:** every page has a Markdown version. Add `.md` to the URL, for example `https://developer.apple.com/design/human-interface-guidelines/buttons.md`. Read the page for the component or pattern you are designing.
- **Android and Material:** read the developer.android.com design pages; m3.material.io pages render with scripts, so prefer the Android pages or a browser tool for them.
- **Meta Horizon OS:** start from the index at `https://developers.meta.com/horizon/llmstxt/design/llms.txt`.
- **No web access:** use the numbers in the reference file and say they were checked on its date.

Quote briefly and cite: page title, URL and the date you read it. Paraphrase the rest.

## 3. What to check on every platform

| Topic | Question |
|---|---|
| Navigation | Does it use the platform's navigation pattern (tab bar, navigation stack, sidebar, ornaments, focus-based TV navigation)? Does back behave as people expect? |
| Targets and input | Are targets at least the platform minimum for its input (touch, pointer, eyes and pinch, controller, remote, crown)? |
| Type | Does text scale with the system setting (Dynamic Type, font scale)? Are sizes above the platform minimum? |
| Components | Are native or system-library components used where they exist, with their standard behavior? |
| Accessibility | Labels for VoiceOver, TalkBack or screen readers; contrast; reduced motion; focus order. |
| Platform features | Safe areas, dark mode, haptics, widgets, notifications, permissions asked in context. |
| Form factor | Large screens and foldables, watch glanceability, TV distance and focus, car driver distraction, XR comfort. |

## 4. Spatial and XR comfort

For visionOS, Android XR and Meta Horizon OS, also check: content placed in a comfortable field of view, no forced head movement, readable text at distance, stable motion that does not cause sickness, larger targets and spacing for eyes and hands, and passthrough respected. Test in the emulator or simulator, and on a device when possible.

## 5. When guidelines conflict

- Standards and platform requirements (store review rules, accessibility) win.
- A team's design system can deviate from platform style on purpose (brand, cross-platform consistency). Follow the system, but keep platform behavior: navigation, gestures, text scaling and accessibility.
- When iOS and Android expect different things, adapt behavior per platform even if the visual design is shared.

Log deliberate deviations with `uxg decision add --evidence-type standard`.
