// Static UX checks for source code. Each rule finds candidates, not verdicts:
// a person or agent confirms each finding by reading the code and the running UI.
//
// Severity is a starting point for triage:
//   high   likely blocks users or fails WCAG 2.2 AA
//   medium likely friction, confusion or a missing state
//   low    polish or a convention worth checking

const WEB = [".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro"];
const SCRIPT = [".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".astro"];
const STYLE = [".css", ".scss", ".sass", ".less", ".html", ".vue", ".svelte", ".jsx", ".tsx", ".astro"];

/** Line number (1-based) of a character offset. */
function lineAt(text, index) {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function snippet(text, index, len = 100) {
  const start = text.lastIndexOf("\n", index) + 1;
  const end = text.indexOf("\n", index);
  return text.slice(start, end === -1 ? undefined : end).trim().slice(0, len);
}

/** All matches of a regex as findings. */
function matches(text, re, filter = () => true) {
  const out = [];
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m;
  while ((m = g.exec(text))) {
    if (filter(m, text)) out.push({ line: lineAt(text, m.index), snippet: snippet(text, m.index) });
    if (m[0].length === 0) g.lastIndex++;
  }
  return out;
}

const hasAttr = (tag, name) => new RegExp(`\\s${name}\\s*=`, "i").test(tag);
const hasAny = (tag, names) => names.some((n) => hasAttr(tag, n));
const stripTags = (s) => s.replace(/<[^>]*>/g, "").replace(/\{[^}]*\}/g, "x").replace(/\s+/g, "");

export const RULES = [
  // ---------------------------------------------------------------- web: accessibility
  {
    id: "img-missing-alt",
    severity: "high",
    title: "Image without alt text",
    principle: "WCAG 1.1.1 Non-text Content",
    fix: 'Add alt text that says what the image shows or does. Use alt="" only for decorative images.',
    exts: WEB,
    test: (t) => matches(t, /<img\b[^>]*>/i, (m) => !hasAttr(m[0], "alt")),
  },
  {
    id: "icon-button-no-name",
    severity: "high",
    title: "Icon-only button without an accessible name",
    principle: "WCAG 4.1.2 Name, Role, Value",
    fix: "Add aria-label (or visible text) that says what the button does, such as aria-label=\"Close\".",
    exts: WEB,
    test: (t) =>
      matches(t, /<button\b([^>]*)>([\s\S]*?)<\/button>/i, (m) => {
        if (hasAny(m[1], ["aria-label", "aria-labelledby", "title", ":aria-label", "v-bind:aria-label"])) return false;
        return /<(svg|img|i|Icon|[A-Z]\w*Icon)\b/.test(m[2]) && stripTags(m[2]).length === 0;
      }),
  },
  {
    id: "placeholder-as-label",
    severity: "high",
    title: "Input that seems to use its placeholder as the label",
    principle: "WCAG 3.3.2 Labels or Instructions; placeholders disappear when typing starts",
    fix: "Add a visible <label for> tied to the input, and keep the placeholder for an example at most.",
    exts: WEB,
    test: (t) =>
      matches(t, /<(input|textarea)\b[^>]*placeholder\s*=[^>]*>/i, (m, text) => {
        const tag = m[0];
        if (hasAny(tag, ["aria-label", "aria-labelledby", "type=\"hidden\"", "type='hidden'"])) return false;
        if (/type\s*=\s*["'](hidden|submit|button|checkbox|radio|search)["']/i.test(tag)) return false;
        const idm = tag.match(/\bid\s*=\s*["']([^"']+)["']/);
        if (idm && new RegExp(`(for|htmlFor)\\s*=\\s*["']${idm[1]}["']`).test(text)) return false;
        // A <label> just before the field (wrapping it or next to it) counts as a label.
        const before = text.slice(Math.max(0, m.index - 300), m.index);
        return !/<label\b|<Label\b|\blabel\s*=/.test(before);
      }),
  },
  {
    id: "clickable-non-button",
    severity: "high",
    title: "Click handler on a div or span",
    principle: "WCAG 2.1.1 Keyboard; WCAG 4.1.2 Name, Role, Value",
    fix: "Use a <button> (or <a> for navigation). If that is impossible, add role, tabIndex=0 and key handlers.",
    exts: WEB,
    test: (t) =>
      matches(t, /<(div|span|li|td)\b[^>]*\s(onClick|onclick|@click|v-on:click|on:click)\s*=/i, (m) => !/\srole\s*=/.test(m[0])),
  },
  {
    id: "focus-outline-removed",
    severity: "high",
    title: "Focus outline removed",
    principle: "WCAG 2.4.7 Focus Visible",
    fix: "Keep a visible focus style: replace outline: none with a :focus-visible ring that has 3:1 contrast. Exception: a container focused only by script (tabindex=-1), such as a page region after navigation.",
    exts: STYLE,
    test: (t) =>
      /focus-visible|focus:ring|focus-visible:/.test(t)
        ? []
        : matches(t, /outline\s*:\s*(none|0)\b|\boutline-none\b|\bfocus:outline-none\b/i),
  },
  {
    id: "zoom-disabled",
    severity: "high",
    title: "Pinch zoom disabled in the viewport",
    principle: "WCAG 1.4.4 Resize Text",
    fix: "Remove user-scalable=no and maximum-scale=1 from the viewport meta tag.",
    exts: [...WEB, ".js", ".ts"],
    test: (t) => matches(t, /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i),
  },
  {
    id: "positive-tabindex",
    severity: "medium",
    title: "Positive tabindex changes the focus order",
    principle: "WCAG 2.4.3 Focus Order",
    fix: "Use tabindex 0 or -1 only, and fix the order in the markup.",
    exts: WEB,
    test: (t) => matches(t, /tab[iI]ndex\s*=\s*\{?\s*["']?[1-9]/),
  },
  {
    id: "html-missing-lang",
    severity: "medium",
    title: "Page without a language",
    principle: "WCAG 3.1.1 Language of Page",
    fix: 'Add lang to the html element, for example <html lang="en">.',
    exts: [".html", ".htm"],
    test: (t) => matches(t, /<html\b[^>]*>/i, (m) => !hasAttr(m[0], "lang")),
  },
  {
    id: "autoplay-media",
    severity: "medium",
    title: "Media that plays automatically",
    principle: "WCAG 1.4.2 Audio Control; 2.2.2 Pause, Stop, Hide",
    fix: "Do not autoplay audio. Autoplaying video must be muted and have a visible pause control.",
    exts: WEB,
    test: (t) => matches(t, /<(video|audio)\b[^>]*\bautoplay\b[^>]*>/i, (m) => !/\bmuted\b/i.test(m[0]) || /<audio/i.test(m[0])),
  },
  {
    id: "heading-level-skip",
    severity: "low",
    title: "Heading level skipped",
    principle: "WCAG 1.3.1 Info and Relationships; headings in order help scanning",
    fix: "Use heading levels in order (h1, then h2, then h3). Style with CSS, not with the level.",
    exts: WEB,
    test: (t) => {
      const out = [];
      let prev = 0;
      for (const m of t.matchAll(/<h([1-6])\b/gi)) {
        const level = Number(m[1]);
        if (prev && level > prev + 1) out.push({ line: lineAt(t, m.index), snippet: snippet(t, m.index) });
        prev = level;
      }
      return out;
    },
  },

  // ---------------------------------------------------------------- web: interaction and copy
  {
    id: "native-blocking-dialog",
    severity: "medium",
    title: "Browser alert, confirm or prompt",
    principle: "Nielsen heuristic 4 Consistency and standards; blocking dialogs interrupt and cannot be styled or explained",
    fix: "Use an in-page dialog or inline message with clear actions, and undo where possible.",
    exts: SCRIPT,
    test: (t) => matches(t, /(?<![\w.])(window\.)?(alert|confirm|prompt)\s*\(/),
  },
  {
    id: "raw-error-shown",
    severity: "medium",
    title: "Raw error message shown to users",
    principle: "Nielsen heuristic 9 Help users recognize, diagnose and recover from errors",
    fix: "Map errors to plain messages that say what happened and what to do. Log the technical detail instead.",
    exts: SCRIPT,
    test: (t) =>
      matches(
        t,
        /(\{\s*(e|err|error)\??\.message\s*\}|toast(\.error)?\(\s*(e|err|error)\??\.message|set\w*Error\(\s*(e|err|error)\??\.message|\{\s*String\(\s*(e|err|error)\s*\)\s*\}|\{\s*JSON\.stringify\(\s*(e|err|error))/,
      ),
  },
  {
    id: "vague-button-label",
    severity: "low",
    title: "Button label that does not say what happens",
    principle: "Clear labels: say the outcome (Nielsen heuristic 2 Match with the real world)",
    fix: 'Name the outcome: "Send ₺250", "Create account", "Save changes".',
    exts: WEB,
    test: (t) =>
      matches(t, /<(button|Button|a)\b[^>]*>\s*(Submit|OK|Ok|Click here|Click|Go|Send|Yes|No|Continue|Here)\s*<\/(button|Button|a)>/),
  },
  {
    id: "disabled-submit",
    severity: "low",
    title: "Submit button disabled until the form is valid",
    principle: "Practical UI (Adham Dannaway): disabled buttons hide why the user cannot continue",
    fix: "Keep the button enabled, validate on submit, and show what to fix next to each field.",
    exts: SCRIPT,
    test: (t) => matches(t, /disabled\s*=\s*\{\s*!\s*(\w+\.)?(isValid|valid|formValid|isFormValid|canSubmit)\b/),
  },
  {
    id: "tiny-text",
    severity: "medium",
    title: "Text smaller than 12px",
    principle: "Readability; check the platform's type guidelines for its minimum sizes",
    fix: "Use at least 12px for any text and 16px for body text.",
    exts: STYLE,
    test: (t) => matches(t, /font-size\s*:\s*([0-9]|1[01])(\.\d+)?px|text-\[(?:[0-9]|1[01])px\]|fontSize\s*:\s*(?:[0-9]|1[01])\b/),
  },
  {
    id: "link-without-href",
    severity: "medium",
    title: 'Link used as a button (href="#" or no href)',
    principle: "WCAG 4.1.2 Name, Role, Value; links navigate, buttons act",
    fix: "Use <button> for actions and <a href> for navigation.",
    exts: WEB,
    test: (t) => matches(t, /<a\b[^>]*(href\s*=\s*["']#["']|href\s*=\s*["']javascript:)[^>]*>/i),
  },

  // ---------------------------------------------------------------- web: missing states (file-level)
  {
    id: "data-without-loading-state",
    severity: "medium",
    title: "Data is fetched but no loading state is visible in this file",
    principle: "Nielsen heuristic 1 Visibility of system status",
    fix: "Show a skeleton or progress indicator while loading, and mark the region aria-busy.",
    exts: [".jsx", ".tsx", ".vue", ".svelte"],
    test: (t) => {
      const fetches = /\b(fetch\(|axios\.|useQuery\(|useSWR\(|useFetch\(|\$fetch\(|createResource\()/.exec(t);
      if (!fetches) return [];
      if (/loading|isLoading|isPending|pending|skeleton|Skeleton|Spinner|spinner|aria-busy|Suspense|fallback/.test(t)) return [];
      return [{ line: lineAt(t, fetches.index), snippet: snippet(t, fetches.index) }];
    },
  },
  {
    id: "data-without-error-state",
    severity: "medium",
    title: "Data is fetched but failures are not handled in this file",
    principle: "Nielsen heuristic 9; designing all states",
    fix: "Handle the failure: say what went wrong in plain words, keep the user's input, offer retry.",
    exts: [".jsx", ".tsx", ".vue", ".svelte"],
    test: (t) => {
      const fetches = /\b(fetch\(|axios\.|useQuery\(|useSWR\(|useFetch\(|\$fetch\()/.exec(t);
      if (!fetches) return [];
      if (/catch|\berror\b|isError|onError|ErrorBoundary|errorElement/.test(t)) return [];
      return [{ line: lineAt(t, fetches.index), snippet: snippet(t, fetches.index) }];
    },
  },
  {
    id: "list-without-empty-state",
    severity: "low",
    title: "A list is rendered but no empty state is visible in this file",
    principle: "Designing all states: an empty list needs an explanation and a next step",
    fix: "When the list is empty, explain what will appear and offer the first action.",
    exts: [".jsx", ".tsx", ".vue", ".svelte"],
    test: (t) => {
      const list = /\.map\(\s*\(?\s*\w+[^)]*\)?\s*=>\s*\(?\s*</.exec(t) || /v-for\s*=|\{#each\b/.exec(t);
      if (!list) return [];
      if (/length\s*(===|==|<|>|!==)\s*0|!\s*\w+(\?)?\.length|\.length\s*\?|isEmpty|empty|No \w+|Nothing|v-else|\{:else\}/.test(t)) return [];
      return [{ line: lineAt(t, list.index), snippet: snippet(t, list.index) }];
    },
  },
  {
    id: "destructive-without-confirm",
    severity: "medium",
    title: "Destructive action without confirmation or undo in this file",
    principle: "Nielsen heuristic 5 Error prevention; heuristic 3 User control and freedom",
    fix: "Confirm destructive actions with a specific question, or offer undo right after.",
    exts: SCRIPT,
    test: (t) => {
      const d = /\b(onClick|onPress|@click|on:click)\s*=\s*[{"']?[^}\n]{0,80}?\b(delete|remove|destroy|erase|wipe|clearAll|reset)\w*/i.exec(t);
      if (!d) return [];
      if (/confirm|Dialog|Modal|AlertDialog|undo|Undo|areYouSure|Popconfirm/.test(t)) return [];
      return [{ line: lineAt(t, d.index), snippet: snippet(t, d.index) }];
    },
  },

  // ---------------------------------------------------------------- SwiftUI (Apple platforms)
  {
    id: "swiftui-fixed-font-size",
    severity: "medium",
    title: "Fixed font size ignores Dynamic Type",
    principle: "Apple HIG: Typography and Accessibility, support Dynamic Type",
    fix: "Use text styles (.font(.body), .font(.headline)) or a custom font with relativeTo:.",
    exts: [".swift"],
    test: (t) => matches(t, /\.font\(\s*\.system\(\s*size\s*:/),
  },
  {
    id: "swiftui-icon-button-no-label",
    severity: "high",
    title: "Image-only button without an accessibility label",
    principle: "Apple HIG: Accessibility; VoiceOver needs a label",
    fix: 'Use Button("Close", systemImage: "xmark") or add .accessibilityLabel("Close").',
    exts: [".swift"],
    test: (t) =>
      matches(t, /Button\s*(\([^)]*\))?\s*\{[^}]*\}\s*label\s*:\s*\{\s*Image\(\s*systemName[^}]*\}/, (m, text) => {
        const after = text.slice(m.index, m.index + m[0].length + 200);
        return !/accessibilityLabel/.test(after);
      }),
  },
  {
    id: "swiftui-tap-gesture-on-view",
    severity: "medium",
    title: "Tap gesture on a view instead of a Button",
    principle: "Apple HIG: Buttons; gestures on plain views lose button traits and focus behavior",
    fix: "Wrap the content in a Button, or add .accessibilityAddTraits(.isButton) and a label.",
    exts: [".swift"],
    test: (t) => matches(t, /\.onTapGesture\s*(\(|\{)/, (m, text) => !/accessibilityAddTraits\(\s*\.isButton/.test(text.slice(m.index, m.index + 400))),
  },
  {
    id: "swiftui-small-target",
    severity: "medium",
    title: "Tappable frame smaller than the platform's hit region",
    principle: "Apple HIG Buttons: a hit region of at least 44x44 pt, and 60x60 pt in visionOS",
    fix: "Make the hit area at least 44 by 44 pt (60 by 60 pt on visionOS) with .frame(minWidth:minHeight:) or .contentShape.",
    exts: [".swift"],
    test: (t, ctx = {}) =>
      matches(t, /\.frame\(\s*width\s*:\s*([0-9]+)\s*,\s*height\s*:\s*([0-9]+)\s*\)/, (m, text) => {
        const min = ctx.platforms?.includes("visionos") ? 60 : 44;
        const small = Number(m[1]) < min || Number(m[2]) < min;
        const near = text.slice(Math.max(0, m.index - 300), m.index + 100);
        return small && /Button|onTapGesture/.test(near);
      }),
  },

  // ---------------------------------------------------------------- Jetpack Compose (Android, Wear OS, TV, XR)
  {
    id: "compose-icon-no-description",
    severity: "high",
    title: "Icon in a clickable element with no content description",
    principle: "Android accessibility: TalkBack needs a label for icon-only controls",
    fix: 'Give the icon a contentDescription such as "Close", or label the IconButton.',
    exts: [".kt"],
    test: (t) => matches(t, /IconButton\s*\([\s\S]{0,200}?Icon\s*\([^)]*contentDescription\s*=\s*null/),
  },
  {
    id: "compose-small-target",
    severity: "medium",
    title: "Clickable size below 48 dp",
    principle: "Material Design and Android accessibility: touch targets of at least 48 by 48 dp",
    fix: "Keep visual size if needed, but give the target at least 48 dp (minimumInteractiveComponentSize).",
    exts: [".kt"],
    test: (t) =>
      matches(t, /Modifier[^\n]*\.size\(\s*([0-9]+)\.dp\s*\)[^\n]*\.clickable|Modifier[^\n]*\.clickable[^\n]*\.size\(\s*([0-9]+)\.dp/, (m) => Number(m[1] ?? m[2]) < 48),
  },
  {
    id: "compose-clickable-no-role",
    severity: "low",
    title: "clickable without a role",
    principle: "Android accessibility: semantics tell TalkBack what an element does",
    fix: "Pass role = Role.Button (or the right role) and an onClickLabel to clickable.",
    exts: [".kt"],
    test: (t) => matches(t, /\.clickable\s*\{/),
  },

  // ---------------------------------------------------------------- Flutter
  {
    id: "flutter-gesture-no-semantics",
    severity: "medium",
    title: "GestureDetector without Semantics",
    principle: "Flutter accessibility: custom tap targets need a label and button semantics",
    fix: "Use a button widget, or wrap in Semantics(button: true, label: ...).",
    exts: [".dart"],
    test: (t) => matches(t, /GestureDetector\s*\(/, (m, text) => !/Semantics\s*\(/.test(text.slice(Math.max(0, m.index - 200), m.index + 400))),
  },
  {
    id: "flutter-iconbutton-no-tooltip",
    severity: "medium",
    title: "IconButton without a tooltip",
    principle: "Flutter accessibility: the tooltip is the screen reader label",
    fix: "Add tooltip: 'What it does' to the IconButton.",
    exts: [".dart"],
    test: (t) =>
      matches(t, /IconButton\s*\(/, (m, text) => {
        let depth = 0;
        let end = m.index;
        for (let i = m.index; i < text.length; i++) {
          if (text[i] === "(") depth++;
          if (text[i] === ")" && --depth === 0) {
            end = i;
            break;
          }
        }
        return !/tooltip\s*:/.test(text.slice(m.index, end));
      }),
  },

  // ---------------------------------------------------------------- React Native
  {
    id: "rn-pressable-no-label",
    severity: "medium",
    title: "Touchable without an accessibility label",
    principle: "React Native accessibility: VoiceOver and TalkBack need a label and role",
    fix: "Add accessibilityRole=\"button\" and accessibilityLabel (or use a Button component).",
    exts: [".jsx", ".tsx", ".js", ".ts"],
    test: (t) =>
      /from\s+["']react-native["']/.test(t)
        ? matches(t, /<(Pressable|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback)\b[^>]*>/, (m) => !/accessibilityLabel|aria-label/.test(m[0]))
        : [],
  },
];

/** Run every rule that applies to a file. */
export function scanText(text, ext, ctx = {}) {
  const out = [];
  for (const rule of RULES) {
    if (!rule.exts.includes(ext)) continue;
    let hits = [];
    try {
      hits = rule.test(text, ctx);
    } catch {
      hits = [];
    }
    const seen = new Set();
    for (const h of hits) {
      if (seen.has(h.line)) continue;
      seen.add(h.line);
      out.push({ rule: rule.id, severity: rule.severity, title: rule.title, principle: rule.principle, fix: rule.fix, ...h });
    }
  }
  return out;
}
