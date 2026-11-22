// uxg figma: read a Figma file through the REST API when no Figma MCP server is connected.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { api, inventory, outline, parseFigmaUrl, texts } from "../lib/figma.mjs";

export const help = `Usage:
  uxg figma outline <figma-url>            Pages and frames with node ids and sizes
  uxg figma text <figma-url> [--node <id>] Every visible text layer, for a copy review
  uxg figma inventory <figma-url> [--node <id>]
                                           Colors, font sizes and fonts in use, and how many
                                           fills are bound to variables
  uxg figma export <figma-url> --node <id,id> [--scale 2] [--format png] [--out <dir>]
                                           Render frames to image files

Reads Figma files with the REST API. Prefer a connected Figma MCP server when
there is one; use this when there is not.

Needs a personal access token with the file_content:read scope in FIGMA_TOKEN.
Create it in Figma under Settings > Security. Set it in your own shell; never
paste a token into a chat.

A node id from a URL (node-id=12-34) is used automatically; --node overrides it.
Node ids are written 12:34.`;

export async function run(argv, { fetchImpl = fetch, env = process.env } = {}) {
  const [sub, ...rest] = argv;
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      node: { type: "string" },
      depth: { type: "string" },
      scale: { type: "string", default: "2" },
      format: { type: "string", default: "png" },
      out: { type: "string", default: ".ux-grandmaster/figma" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help || !sub) return { output: help, code: sub ? 0 : 2 };
  if (!["outline", "text", "inventory", "export"].includes(sub)) return { output: `Unknown subcommand "${sub}".\n\n${help}`, code: 2 };
  if (positionals.length !== 1) throw usage("Give one Figma URL or file key.");
  const { key, node: urlNode } = parseFigmaUrl(positionals[0]);
  const node = values.node ?? urlNode;
  const opts = { fetchImpl, env };

  if (sub === "outline") {
    const file = await api(`/v1/files/${key}?depth=${values.depth ?? 2}`, opts);
    const pages = outline(file.document);
    if (values.json) return { output: JSON.stringify({ name: file.name, lastModified: file.lastModified, pages }, null, 2), code: 0 };
    const lines = [`${file.name} (last modified ${file.lastModified})`];
    for (const p of pages) {
      lines.push("", `Page: ${p.name}`);
      for (const f of p.frames) lines.push(`  ${f.id}  ${f.name}  ${f.width ?? "?"}x${f.height ?? "?"}  ${f.type.toLowerCase()}`);
      if (!p.frames.length) lines.push("  (no top-level frames)");
    }
    return { output: lines.join("\n"), code: 0 };
  }

  if (sub === "text") {
    const root = await loadRoot(key, node, opts);
    const list = texts(root);
    if (values.json) return { output: JSON.stringify(list, null, 2), code: 0 };
    return {
      output: list.length
        ? list.map((t) => `${t.id}  [${t.fontSize ?? "?"}px ${t.fontWeight ?? ""}]  ${t.text.replace(/\s+/g, " ")}`).join("\n")
        : "No visible text layers.",
      code: 0,
    };
  }

  if (sub === "inventory") {
    const inv = inventory(await loadRoot(key, node, opts));
    if (values.json) return { output: JSON.stringify(inv, null, 2), code: 0 };
    const total = inv.fillsBoundToVariables + inv.fillsWithRawColors;
    return {
      output: [
        `Solid fills: ${total}, bound to variables: ${inv.fillsBoundToVariables}, raw colors: ${inv.fillsWithRawColors}.`,
        `Colors (${inv.colors.length}): ${inv.colors.map((c) => `${c.value} x${c.count}`).join(", ")}`,
        `Font sizes (${inv.fontSizes.length}): ${inv.fontSizes.map((c) => `${c.value} x${c.count}`).join(", ")}`,
        `Fonts (${inv.fontFamilies.length}): ${inv.fontFamilies.map((c) => `${c.value} x${c.count}`).join(", ")}`,
        "",
        "Many near-identical colors or sizes, or many raw colors, point to drift from the design system.",
        "Check text and background pairs with uxg contrast.",
      ].join("\n"),
      code: 0,
    };
  }

  // export
  if (!node) throw usage("Give --node with one or more node ids (12:34,12:35), or a URL with node-id.");
  const scale = Number(values.scale);
  if (!(scale >= 0.01 && scale <= 4)) throw usage("--scale must be between 0.01 and 4.");
  if (!["png", "jpg", "svg", "pdf"].includes(values.format)) throw usage("--format must be png, jpg, svg or pdf.");
  const res = await api(`/v1/images/${key}?ids=${encodeURIComponent(node)}&scale=${scale}&format=${values.format}`, opts);
  if (res.err) throw new Error(`Figma could not render: ${res.err}`);
  const out = resolve(values.out);
  mkdirSync(out, { recursive: true });
  const files = [];
  for (const [id, url] of Object.entries(res.images ?? {})) {
    if (!url) {
      files.push({ id, file: null, note: "Figma returned no image for this node" });
      continue;
    }
    const img = await fetchImpl(url);
    if (!img.ok) throw new Error(`Downloading the render of ${id} failed (${img.status}).`);
    const file = join(out, `${key}-${id.replace(/[:;]/g, "-")}.${values.format}`);
    writeFileSync(file, Buffer.from(await img.arrayBuffer()));
    files.push({ id, file });
  }
  if (values.json) return { output: JSON.stringify(files, null, 2), code: 0 };
  return { output: [...files.map((f) => `${f.id}  ${f.file ?? f.note}`), "", "Open each image and look at it."].join("\n"), code: 0 };
}

async function loadRoot(key, node, opts) {
  if (node) {
    const res = await api(`/v1/files/${key}/nodes?ids=${encodeURIComponent(node)}`, opts);
    const first = Object.values(res.nodes ?? {})[0];
    if (!first?.document) throw new Error(`Node ${node} not found in the file.`);
    return first.document;
  }
  const file = await api(`/v1/files/${key}`, opts);
  return file.document;
}

function usage(msg) {
  const e = new Error(msg);
  e.name = "UsageError";
  return e;
}
