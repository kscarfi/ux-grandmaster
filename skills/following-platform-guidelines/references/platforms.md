# Platform guideline sources

Checked on 2026-11-20. Numbers are quoted from the official page named next to them. Read the live page before relying on them: guidelines change.

## Apple

Entry point: https://developer.apple.com/design/human-interface-guidelines (add `.md` to any page URL for Markdown).

| Platform | Page |
|---|---|
| iOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-ios |
| iPadOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados |
| macOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-macos |
| watchOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-watchos |
| tvOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-tvos |
| visionOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos |
| CarPlay | https://developer.apple.com/design/human-interface-guidelines/carplay |
| Games | https://developer.apple.com/design/human-interface-guidelines/designing-for-games |

Key numbers (HIG Accessibility and Buttons pages):

| Platform | Default control size | Minimum control size | Default text | Minimum text |
|---|---|---|---|---|
| iOS, iPadOS | 44x44 pt | 28x28 pt | 17 pt | 11 pt |
| macOS | 28x28 pt | 20x20 pt | 13 pt | 10 pt |
| tvOS | 66x66 pt | 56x56 pt | 29 pt | 23 pt |
| visionOS | 60x60 pt | 28x28 pt | 17 pt | 12 pt |
| watchOS | 44x44 pt | 28x28 pt | 16 pt | 12 pt |

- Buttons: "a button needs a hit region of at least 44x44 pt, in visionOS, 60x60 pt" (HIG Buttons).
- visionOS: place buttons so their centers are at least 60 pt apart (HIG Buttons).
- Contrast: HIG Accessibility uses WCAG AA values: 4.5:1 for text up to 17 pt, 3:1 for 18 pt and up.

## Android and Material Design

| Topic | Page |
|---|---|
| Material Design 3 | https://m3.material.io |
| Android design hub | https://developer.android.com/design/ui |
| Phones | https://developer.android.com/design/ui/mobile |
| Large screens and foldables | https://developer.android.com/design/ui/large-screens |
| Wear OS | https://developer.android.com/design/ui/wear |
| TV | https://developer.android.com/design/ui/tv |
| Cars | https://developer.android.com/design/ui/cars |
| Android XR | https://developer.android.com/design/ui/xr |
| AI glasses | https://developer.android.com/design/ui/ai-glasses |
| Widgets | https://developer.android.com/design/ui/widget |
| Accessibility | https://developer.android.com/guide/topics/ui/accessibility |

Key numbers:

- Touch targets: at least 48dp by 48dp; larger is better (Android: Make apps more accessible).
- Text contrast: 4.5:1 for text under 18sp (or bold under 14sp), 3:1 otherwise (same page).
- Android XR targets: 56dp recommended, 48dp visual affordance, 8dp minimum between targets (Android XR: Scale, sizes, and visual design).
- Android XR text: 14dp or larger, normal weight or heavier; primary content within a 41 degree field of view; apps launch 1.75 m from the user (same page).
- Android XR glasses: black renders as transparent on additive displays; brighter colors look more solid (same page).

## Meta Horizon OS (Quest)

| Topic | Page |
|---|---|
| Design hub | https://developers.meta.com/horizon/design/ |
| Design index for agents | https://developers.meta.com/horizon/llmstxt/design/llms.txt |
| Android app design requirements | https://developers.meta.com/horizon/documentation/android-apps/design-requirements |

Key numbers (Android app design requirements):

- Hit targets at least 48dp by 48dp; at least 60dp by 60dp for primary controls.
- Readable text at least 14px; 18px or larger for comfortable reading.
- Hand tracking: at least 16dp between the visually dominant parts of adjacent interactive elements.

## Windows

| Topic | Page |
|---|---|
| Windows app design | https://learn.microsoft.com/en-us/windows/apps/design/ |
| Fluent 2 | https://fluent2.microsoft.design |

## Web

| Topic | Page |
|---|---|
| WCAG 2.2 | https://www.w3.org/TR/WCAG22/ |
| WCAG at a glance | https://www.w3.org/WAI/standards-guidelines/wcag/glance/ |
| WAI-ARIA Authoring Practices (patterns for menus, dialogs, tabs) | https://www.w3.org/WAI/ARIA/apg/ |
| MDN Accessibility | https://developer.mozilla.org/en-US/docs/Web/Accessibility |
| web.dev Learn Accessibility | https://web.dev/learn/accessibility |

## Cross-platform frameworks

| Framework | Page |
|---|---|
| Flutter accessibility | https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility |
| React Native accessibility | https://reactnative.dev/docs/accessibility |

A cross-platform app still follows each platform's conventions for navigation, gestures, text scaling and accessibility.
