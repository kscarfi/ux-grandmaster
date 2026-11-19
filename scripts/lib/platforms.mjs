// Detect which platforms and UI frameworks a project targets, and point to the
// official design guidelines for each. URLs checked on 2026-11-20.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const GUIDELINES = {
  web: {
    name: "Web",
    links: [
      ["WCAG 2.2", "https://www.w3.org/TR/WCAG22/"],
      ["WAI-ARIA Authoring Practices", "https://www.w3.org/WAI/ARIA/apg/"],
      ["MDN Accessibility", "https://developer.mozilla.org/en-US/docs/Web/Accessibility"],
    ],
  },
  ios: {
    name: "iOS and iPadOS",
    links: [
      ["Apple HIG: Designing for iOS", "https://developer.apple.com/design/human-interface-guidelines/designing-for-ios"],
      ["Apple HIG: Designing for iPadOS", "https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados"],
      ["Apple HIG: Accessibility", "https://developer.apple.com/design/human-interface-guidelines/accessibility"],
    ],
  },
  macos: {
    name: "macOS",
    links: [["Apple HIG: Designing for macOS", "https://developer.apple.com/design/human-interface-guidelines/designing-for-macos"]],
  },
  visionos: {
    name: "visionOS (Apple Vision Pro)",
    links: [
      ["Apple HIG: Designing for visionOS", "https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos"],
      ["Apple HIG: Spatial layout", "https://developer.apple.com/design/human-interface-guidelines/spatial-layout"],
      ["Apple HIG: Eyes", "https://developer.apple.com/design/human-interface-guidelines/eyes"],
    ],
  },
  watchos: {
    name: "watchOS",
    links: [["Apple HIG: Designing for watchOS", "https://developer.apple.com/design/human-interface-guidelines/designing-for-watchos"]],
  },
  tvos: {
    name: "tvOS",
    links: [["Apple HIG: Designing for tvOS", "https://developer.apple.com/design/human-interface-guidelines/designing-for-tvos"]],
  },
  carplay: {
    name: "CarPlay",
    links: [["Apple HIG: CarPlay", "https://developer.apple.com/design/human-interface-guidelines/carplay"]],
  },
  android: {
    name: "Android",
    links: [
      ["Material Design 3", "https://m3.material.io"],
      ["Android: Mobile design", "https://developer.android.com/design/ui/mobile"],
      ["Android: Large screens", "https://developer.android.com/design/ui/large-screens"],
      ["Android: Accessibility", "https://developer.android.com/guide/topics/ui/accessibility"],
    ],
  },
  wearos: {
    name: "Wear OS",
    links: [["Android: Design for Wear OS", "https://developer.android.com/design/ui/wear"]],
  },
  androidtv: {
    name: "Android TV and Google TV",
    links: [["Android: Design for TV", "https://developer.android.com/design/ui/tv"]],
  },
  androidcars: {
    name: "Android for Cars",
    links: [["Android: Design for cars", "https://developer.android.com/design/ui/cars"]],
  },
  androidxr: {
    name: "Android XR",
    links: [
      ["Android: Design for XR", "https://developer.android.com/design/ui/xr"],
      ["Android: Design for AI glasses", "https://developer.android.com/design/ui/ai-glasses"],
    ],
  },
  metahorizon: {
    name: "Meta Horizon OS (Quest)",
    links: [
      ["Meta Horizon OS design", "https://developers.meta.com/horizon/design/"],
      ["Meta Horizon design index (llms.txt)", "https://developers.meta.com/horizon/llmstxt/design/llms.txt"],
    ],
  },
  windows: {
    name: "Windows",
    links: [
      ["Windows app design", "https://learn.microsoft.com/en-us/windows/apps/design/"],
      ["Fluent 2", "https://fluent2.microsoft.design"],
    ],
  },
  flutter: {
    name: "Flutter",
    links: [["Flutter accessibility", "https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility"]],
  },
  reactnative: {
    name: "React Native",
    links: [["React Native accessibility", "https://reactnative.dev/docs/accessibility"]],
  },
};

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit", ".output", "coverage",
  "vendor", "Pods", ".gradle", ".idea", ".vscode", "DerivedData", "Library", "Temp", "obj", "bin", ".dart_tool",
  ".expo", "target", ".turbo", ".cache", "storybook-static", ".ux-grandmaster",
]);

/** Walk a project, yielding file paths, skipping build output and dependencies. */
export function* walk(root, { maxFiles = 20000 } = {}) {
  let count = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.name.startsWith(".") && e.name !== ".github") {
        if (e.isDirectory()) continue;
      }
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) stack.push(p);
      } else if (e.isFile()) {
        if (++count > maxFiles) return;
        yield p;
      }
    }
  }
}

function readSafe(path, max = 2_000_000) {
  try {
    if (statSync(path).size > max) return "";
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

/**
 * Detect target platforms from project files. Returns a sorted list of keys of
 * GUIDELINES with the evidence that triggered each.
 */
export function detectPlatforms(root, files = [...walk(root)]) {
  const found = new Map();
  const add = (key, why) => {
    if (!found.has(key)) found.set(key, new Set());
    found.get(key).add(why);
  };
  const names = files.map((f) => f.slice(root.length + 1));

  const pkgPath = join(root, "package.json");
  if (existsSync(pkgPath)) {
    let pkg = {};
    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      // ignore broken package.json
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    if (deps["react-native"] || deps.expo) {
      add("reactnative", "react-native or expo in package.json");
      add("ios", "React Native targets iOS");
      add("android", "React Native targets Android");
    }
    if (["react-dom", "next", "vue", "nuxt", "svelte", "@sveltejs/kit", "@angular/core", "solid-js", "astro", "preact", "vite"].some((d) => deps[d])) {
      add("web", "web framework in package.json");
    }
    if (deps.electron || deps["@tauri-apps/api"]) add("web", "desktop web shell (Electron or Tauri)");
  }
  if (names.some((n) => /\.(html|jsx|tsx|vue|svelte|astro)$/.test(n))) add("web", "web UI files");

  if (names.some((n) => n.endsWith("pubspec.yaml"))) {
    add("flutter", "pubspec.yaml");
    add("ios", "Flutter targets iOS");
    add("android", "Flutter targets Android");
  }

  // Apple platforms
  const swiftFiles = files.filter((f) => f.endsWith(".swift"));
  const pbx = files.filter((f) => f.endsWith("project.pbxproj"));
  const appleText = [...pbx, ...files.filter((f) => f.endsWith("Package.swift"))].map((f) => readSafe(f)).join("\n");
  const swiftSample = swiftFiles.slice(0, 400).map((f) => readSafe(f, 400_000)).join("\n");
  if (swiftFiles.length || pbx.length) {
    if (/xros|visionOS|XROS_DEPLOYMENT_TARGET/.test(appleText) || /ImmersiveSpace|RealityView|\.windowStyle\(\.volumetric\)/.test(swiftSample)) {
      add("visionos", "visionOS target or ImmersiveSpace/RealityView");
    }
    if (/watchos|WATCHOS_DEPLOYMENT_TARGET|\.watchOS\(/.test(appleText) || /WKApplication|WatchKit/.test(swiftSample)) add("watchos", "watchOS target");
    if (/appletvos|TVOS_DEPLOYMENT_TARGET|\.tvOS\(/.test(appleText)) add("tvos", "tvOS target");
    if (/MACOSX_DEPLOYMENT_TARGET|\.macOS\(/.test(appleText) || /import AppKit|NSViewRepresentable/.test(swiftSample)) add("macos", "macOS target");
    if (/IPHONEOS_DEPLOYMENT_TARGET|\.iOS\(/.test(appleText) || /import UIKit|UIViewRepresentable/.test(swiftSample)) add("ios", "iOS target");
    if (/CarPlay|CPTemplate/.test(swiftSample)) add("carplay", "CarPlay framework");
    if (!found.has("ios") && !found.has("macos") && !found.has("visionos") && !found.has("watchos") && !found.has("tvos")) {
      add("ios", "Swift sources (platform not determined)");
    }
  }

  // Android
  const gradle = files.filter((f) => /build\.gradle(\.kts)?$|libs\.versions\.toml$/.test(f)).map((f) => readSafe(f)).join("\n");
  const manifest = files.filter((f) => f.endsWith("AndroidManifest.xml")).map((f) => readSafe(f)).join("\n");
  if (gradle || manifest) {
    if (/androidx\.xr|android\.software\.xr|com\.android\.extensions\.xr/.test(gradle + manifest)) add("androidxr", "androidx.xr dependency or XR feature");
    if (/androidx\.wear|android\.hardware\.type\.watch/.test(gradle + manifest)) add("wearos", "Wear OS dependency or watch feature");
    if (/androidx\.tv|android\.software\.leanback/.test(gradle + manifest)) add("androidtv", "TV dependency or leanback feature");
    if (/androidx\.car\.app|android\.hardware\.type\.automotive/.test(gradle + manifest)) add("androidcars", "car app library or automotive feature");
    if (/com\.android\.application|com\.android\.library|android\s*\{/.test(gradle) || manifest) add("android", "Android Gradle project");
  }

  // Meta Quest / Unity / Windows
  if (names.some((n) => /ProjectSettings\/ProjectVersion\.txt$/.test(n))) {
    const unityManifest = readSafe(join(root, "Packages", "manifest.json"));
    if (/com\.meta\.xr|com\.oculus/.test(unityManifest)) add("metahorizon", "Meta XR SDK in Unity packages");
  }
  if (/com\.meta\.spatial|horizonos|com\.oculus/.test(gradle + manifest)) add("metahorizon", "Meta spatial SDK or Horizon OS feature");
  if (files.some((f) => /\.(csproj|vcxproj)$/.test(f)) && /WindowsAppSDK|Microsoft\.UI\.Xaml|UseWinUI|UseWPF/.test(files.filter((f) => /\.(csproj|vcxproj)$/.test(f)).map((f) => readSafe(f)).join("\n"))) {
    add("windows", "WinUI or WPF project");
  }

  return [...found.entries()]
    .map(([key, why]) => ({ key, name: GUIDELINES[key].name, evidence: [...why], guidelines: GUIDELINES[key].links }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
