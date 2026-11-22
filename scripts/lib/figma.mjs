// Read Figma files through the Figma REST API.
// Docs checked 2026-11-22: https://developers.figma.com/docs/rest-api/
// - Base URL https://api.figma.com
// - Personal access token in the X-Figma-Token header
// - GET /v1/files/:key (ids, depth), GET /v1/files/:key/nodes (ids, depth),
//   GET /v1/images/:key (ids, scale 0.01 to 4, format jpg|png|svg|pdf); scope file_content:read
// - GET /v1/files/:key/variables/local is for full members of Enterprise orgs only.

export const API = "https://api.figma.com";

/** Read the token from the environment. Never logged or printed. */
export function token(env = process.env) {
  const t = env.FIGMA_TOKEN || env.FIGMA_ACCESS_TOKEN;
  if (!t) {
    const e = new Error(
      "No Figma token. Create a personal access token in Figma (Settings > Security) with the " +
        "file_content:read scope, then set FIGMA_TOKEN in your shell. Do not paste it into a chat.",
    );
    e.name = "UsageError";
    throw e;
  }
  return t;
}

/**
 * Parse a Figma URL or a bare file key. Node ids in URLs use "-" (1-2);
 * the API uses ":" (1:2).
 */
export function parseFigmaUrl(input) {
  const m = String(input).match(/figma\.com\/(?:file|design|proto|board|slides|make)\/([A-Za-z0-9]+)/);
  const key = m ? m[1] : /^[A-Za-z0-9]{10,}$/.test(input) ? input : null;
  if (!key) {
    const e = new Error(`Not a Figma file URL or key: ${input}`);
    e.name = "UsageError";
    throw e;
  }
  let node = null;
  try {
    const u = new URL(input);
    const n = u.searchParams.get("node-id");
    if (n) node = n.replace(/-/g, ":");
  } catch {
    // bare key
  }
  return { key, node };
}

export async function api(path, { fetchImpl = fetch, env = process.env } = {}) {
  const res = await fetchImpl(`${API}${path}`, { headers: { "X-Figma-Token": token(env) } });
  if (res.status === 403) throw new Error("Figma refused the request (403). Check the token's scopes and that you can open the file.");
  if (res.status === 404) throw new Error("Figma file or node not found (404). Check the URL.");
  if (res.status === 429) throw new Error("Figma rate limit reached (429). Wait and try again.");
  if (!res.ok) throw new Error(`Figma API error ${res.status}.`);
  return res.json();
}

/** Walk a node tree depth-first. */
export function* walkNodes(node, depth = 0, parent = null) {
  if (!node) return;
  yield { node, depth, parent };
  for (const c of node.children ?? []) yield* walkNodes(c, depth + 1, node);
}

const FRAME_TYPES = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "SECTION", "INSTANCE"]);

/** Pages and top-level frames with ids and sizes. */
export function outline(document, { maxFrames = 200 } = {}) {
  const pages = [];
  for (const page of document.children ?? []) {
    const frames = (page.children ?? [])
      .filter((n) => FRAME_TYPES.has(n.type))
      .slice(0, maxFrames)
      .map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        width: n.absoluteBoundingBox ? Math.round(n.absoluteBoundingBox.width) : null,
        height: n.absoluteBoundingBox ? Math.round(n.absoluteBoundingBox.height) : null,
      }));
    pages.push({ id: page.id, name: page.name, frames });
  }
  return pages;
}

/** All visible text layers, in reading order, with their frame. */
export function texts(root) {
  const out = [];
  for (const { node } of walkNodes(root)) {
    if (node.type === "TEXT" && node.visible !== false && node.characters?.trim()) {
      out.push({
        id: node.id,
        name: node.name,
        text: node.characters,
        fontSize: node.style?.fontSize ?? null,
        fontWeight: node.style?.fontWeight ?? null,
        fontFamily: node.style?.fontFamily ?? null,
      });
    }
  }
  return out;
}

const hex = (c) =>
  "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

/**
 * The visual vocabulary actually used: solid fill colors, text sizes and
 * font families, with counts, and whether each is bound to a variable.
 * A long tail of near-duplicate values is a consistency finding.
 */
export function inventory(root) {
  const colors = new Map();
  const sizes = new Map();
  const families = new Map();
  let bound = 0;
  let unbound = 0;
  const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const { node } of walkNodes(root)) {
    for (const f of node.fills ?? []) {
      if (f.type === "SOLID" && f.visible !== false && f.color) {
        bump(colors, hex(f.color));
        if (f.boundVariables?.color) bound++;
        else unbound++;
      }
    }
    if (node.type === "TEXT" && node.style) {
      if (node.style.fontSize) bump(sizes, node.style.fontSize);
      if (node.style.fontFamily) bump(families, node.style.fontFamily);
    }
  }
  const sorted = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
  return { colors: sorted(colors), fontSizes: sorted(sizes), fontFamilies: sorted(families), fillsBoundToVariables: bound, fillsWithRawColors: unbound };
}
