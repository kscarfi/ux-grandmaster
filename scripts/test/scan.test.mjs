import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanText, RULES } from "../lib/ux-rules.mjs";
import { detectPlatforms } from "../lib/platforms.mjs";

const ids = (text, ext) => scanText(text, ext).map((f) => f.rule);
const has = (text, ext, id) => ids(text, ext).includes(id);

// Each case: [rule, ext, should flag, should not flag]
const CASES = [
  ["img-missing-alt", ".html", '<img src="a.png">', '<img src="a.png" alt="">'],
  ["icon-button-no-name", ".html", '<button><svg aria-hidden="true"></svg></button>', '<button aria-label="Close"><svg></svg></button>'],
  ["icon-button-no-name", ".tsx", "<button onClick={x}><CloseIcon /></button>", "<button onClick={x}><CloseIcon /> Close</button>"],
  ["placeholder-as-label", ".html", '<input placeholder="Email">', '<label for="e">Email</label><input id="e" placeholder="name@example.com">'],
  ["placeholder-as-label", ".tsx", '<input placeholder="Search…" />', '<input placeholder="Search…" aria-label="Search" />'],
  ["clickable-non-button", ".tsx", "<div onClick={open}>Open</div>", '<div role="button" tabIndex={0} onClick={open}>Open</div>'],
  ["clickable-non-button", ".vue", '<div @click="open">Open</div>', '<button @click="open">Open</button>'],
  ["focus-outline-removed", ".css", "button { outline: none; }", "button { outline: none; } button:focus-visible { outline: 2px solid; }"],
  ["focus-outline-removed", ".tsx", '<input className="focus:outline-none" />', '<input className="focus:outline-none focus-visible:ring-2" />'],
  ["zoom-disabled", ".html", '<meta name="viewport" content="width=device-width, user-scalable=no">', '<meta name="viewport" content="width=device-width, initial-scale=1">'],
  ["positive-tabindex", ".html", '<a tabindex="3" href="/">x</a>', '<div tabindex="-1"></div>'],
  ["html-missing-lang", ".html", "<html><head></head></html>", '<html lang="en"><head></head></html>'],
  ["autoplay-media", ".html", '<video autoplay src="a.mp4"></video>', '<video autoplay muted src="a.mp4"></video>'],
  ["heading-level-skip", ".html", "<h1>A</h1><h3>B</h3>", "<h1>A</h1><h2>B</h2><h3>C</h3>"],
  ["native-blocking-dialog", ".ts", 'if (!confirm("Delete?")) return;', "const confirmed = useConfirm();"],
  ["raw-error-shown", ".tsx", "<p>{error.message}</p>", "<p>{t('errors.network')}</p>"],
  ["vague-button-label", ".html", "<button>Submit</button>", "<button>Create account</button>"],
  ["disabled-submit", ".tsx", "<button disabled={!isValid}>Save</button>", "<button disabled={isSaving}>Save</button>"],
  ["tiny-text", ".css", ".note { font-size: 10px; }", ".note { font-size: 12px; }"],
  ["link-without-href", ".html", '<a href="#" onclick="go()">Go</a>', '<a href="/settings">Settings</a>'],
  [
    "data-without-loading-state",
    ".tsx",
    "useEffect(() => { fetch('/api').then(r => r.json()).then(setItems).catch(setError) }, []);",
    "const { data, isLoading, error } = useQuery(['x'], f);",
  ],
  [
    "data-without-error-state",
    ".tsx",
    "const [loading, setLoading] = useState(true); fetch('/api').then(r => r.json()).then(setItems);",
    "fetch('/api').then(r => r.json()).catch(() => setError(true));",
  ],
  ["list-without-empty-state", ".tsx", "return <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;", "if (!items.length) return <Empty />; return <ul>{items.map((i) => <li>{i}</li>)}</ul>;"],
  ["destructive-without-confirm", ".tsx", "<button onClick={() => deleteAccount(id)}>Delete</button>", "<button onClick={() => setConfirmOpen(true)}>Delete</button><Dialog />"],
  ["swiftui-fixed-font-size", ".swift", "Text(\"Hi\").font(.system(size: 14))", "Text(\"Hi\").font(.body)"],
  ["swiftui-icon-button-no-label", ".swift", 'Button { close() } label: { Image(systemName: "xmark") }', 'Button { close() } label: { Image(systemName: "xmark") }.accessibilityLabel("Close")'],
  ["swiftui-tap-gesture-on-view", ".swift", "Text(\"Open\").onTapGesture { open() }", 'Button("Open") { open() }'],
  ["swiftui-small-target", ".swift", "Button { x() } label: { Image(systemName: \"plus\") }.frame(width: 24, height: 24)", "Button { x() } label: { Text(\"Add\") }.frame(width: 120, height: 44)"],
  ["compose-icon-no-description", ".kt", "IconButton(onClick = { close() }) { Icon(Icons.Default.Close, contentDescription = null) }", 'IconButton(onClick = { close() }) { Icon(Icons.Default.Close, contentDescription = "Close") }'],
  ["compose-small-target", ".kt", "Box(Modifier.size(24.dp).clickable { x() })", "Box(Modifier.size(48.dp).clickable { x() })"],
  ["compose-clickable-no-role", ".kt", "Box(Modifier.clickable { open() })", "Box(Modifier.clickable(role = Role.Button, onClickLabel = \"Open\") { open() })"],
  ["flutter-gesture-no-semantics", ".dart", "GestureDetector(onTap: open, child: Text('Open'))", "Semantics(button: true, label: 'Open', child: GestureDetector(onTap: open, child: Text('Open')))"],
  ["flutter-iconbutton-no-tooltip", ".dart", "IconButton(icon: Icon(Icons.close), onPressed: close)", "IconButton(icon: Icon(Icons.close), tooltip: 'Close', onPressed: close)"],
  [
    "rn-pressable-no-label",
    ".tsx",
    "import { Pressable } from 'react-native';\n<Pressable onPress={x}><Icon /></Pressable>",
    "import { Pressable } from 'react-native';\n<Pressable accessibilityLabel=\"Close\" onPress={x}><Icon /></Pressable>",
  ],
];

for (const [rule, ext, bad, good] of CASES) {
  test(`${rule} (${ext}) flags the problem and accepts the fix`, () => {
    assert.ok(has(bad, ext, rule), `expected ${rule} on: ${bad}`);
    assert.ok(!has(good, ext, rule), `did not expect ${rule} on: ${good}`);
  });
}

test("every rule has a test case and complete metadata", () => {
  const tested = new Set(CASES.map((c) => c[0]));
  for (const r of RULES) {
    assert.ok(tested.has(r.id), `no test for ${r.id}`);
    assert.ok(r.title && r.principle && r.fix && ["high", "medium", "low"].includes(r.severity), r.id);
  }
});

test("visionOS raises the hit region minimum to 60 pt", () => {
  const code = 'Button { x() } label: { Image(systemName: "plus") }.frame(width: 50, height: 50)';
  assert.ok(!scanText(code, ".swift").some((f) => f.rule === "swiftui-small-target"));
  assert.ok(scanText(code, ".swift", { platforms: ["visionos"] }).some((f) => f.rule === "swiftui-small-target"));
});

test("findings carry the right line number", () => {
  const f = scanText("<html lang=\"en\">\n<body>\n<img src=\"a.png\">\n</body>", ".html");
  assert.equal(f.find((x) => x.rule === "img-missing-alt").line, 3);
});

test("platform detection reads project files", () => {
  const root = mkdtempSync(join(tmpdir(), "uxg-plat-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { "react-native": "0.80.0" } }));
  mkdirSync(join(root, "android", "app"), { recursive: true });
  writeFileSync(join(root, "android", "app", "build.gradle.kts"), 'plugins { id("com.android.application") }\ndependencies { implementation("androidx.xr.compose:compose:1.0.0") }');
  mkdirSync(join(root, "Vision"), { recursive: true });
  writeFileSync(join(root, "Vision", "App.swift"), "import SwiftUI\nstruct A: App { var body: some Scene { ImmersiveSpace(id: \"x\") { RealityView { _ in } } } }");
  const keys = detectPlatforms(root).map((p) => p.key);
  for (const k of ["reactnative", "ios", "android", "androidxr", "visionos"]) assert.ok(keys.includes(k), `missing ${k} in ${keys}`);
});
