import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFigmaUrl, token, inventory, texts, outline } from "../lib/figma.mjs";
import { run } from "../commands/figma.mjs";

const DOC = {
  name: "Checkout",
  lastModified: "2026-11-20T10:00:00Z",
  document: {
    id: "0:0",
    type: "DOCUMENT",
    children: [
      {
        id: "0:1",
        name: "Screens",
        type: "CANVAS",
        children: [
          {
            id: "1:2",
            name: "Pay",
            type: "FRAME",
            absoluteBoundingBox: { width: 390, height: 844 },
            fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
            children: [
              { id: "1:3", type: "TEXT", name: "Title", characters: "Pay now", style: { fontSize: 24, fontWeight: 700, fontFamily: "Inter" }, fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, boundVariables: { color: { id: "v1" } } }] },
              { id: "1:4", type: "TEXT", name: "Hidden", characters: "secret", visible: false, style: { fontSize: 12 } },
              { id: "1:5", type: "TEXT", name: "Fee", characters: "Fee ₺4", style: { fontSize: 11, fontFamily: "Inter" }, fills: [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }] },
            ],
          },
        ],
      },
    ],
  },
};

function fakeFetch(routes) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    for (const [prefix, body] of routes) {
      if (url.startsWith(prefix)) {
        if (body instanceof Uint8Array) return { ok: true, status: 200, arrayBuffer: async () => body };
        if (typeof body === "number") return { ok: false, status: body, json: async () => ({}) };
        return { ok: true, status: 200, json: async () => body };
      }
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  impl.calls = calls;
  return impl;
}

const env = { FIGMA_TOKEN: "test-token" };

test("parses Figma URLs and node ids", () => {
  assert.deepEqual(parseFigmaUrl("https://www.figma.com/design/AbCdEf123456/App?node-id=12-34&t=x"), { key: "AbCdEf123456", node: "12:34" });
  assert.deepEqual(parseFigmaUrl("https://www.figma.com/file/AbCdEf123456/App"), { key: "AbCdEf123456", node: null });
  assert.deepEqual(parseFigmaUrl("AbCdEf123456"), { key: "AbCdEf123456", node: null });
  assert.throws(() => parseFigmaUrl("https://example.com/x"), /Not a Figma/);
});

test("requires a token from the environment and explains how to get one", () => {
  assert.throws(() => token({}), /FIGMA_TOKEN/);
  assert.equal(token({ FIGMA_ACCESS_TOKEN: "a" }), "a");
});

test("outline, texts and inventory read the tree", () => {
  const pages = outline(DOC.document);
  assert.equal(pages[0].frames[0].id, "1:2");
  assert.equal(pages[0].frames[0].width, 390);
  const t = texts(DOC.document);
  assert.deepEqual(t.map((x) => x.text), ["Pay now", "Fee ₺4"]);
  const inv = inventory(DOC.document);
  assert.equal(inv.fillsBoundToVariables, 1);
  assert.equal(inv.fillsWithRawColors, 2);
  assert.ok(inv.colors.some((c) => c.value === "#999999"));
  assert.ok(inv.fontSizes.some((c) => c.value === 11));
});

test("sends the token in X-Figma-Token and never prints it", async () => {
  const f = fakeFetch([["https://api.figma.com/v1/files/AbCdEf123456?depth=2", DOC]]);
  const r = await run(["outline", "https://www.figma.com/design/AbCdEf123456/App"], { fetchImpl: f, env });
  assert.equal(f.calls[0].init.headers["X-Figma-Token"], "test-token");
  assert.match(r.output, /1:2 {2}Pay {2}390x844/);
  assert.doesNotMatch(r.output, /test-token/);
});

test("text uses the node from the URL", async () => {
  const f = fakeFetch([["https://api.figma.com/v1/files/AbCdEf123456/nodes?ids=1%3A2", { nodes: { "1:2": { document: DOC.document.children[0].children[0] } } }]]);
  const r = await run(["text", "https://www.figma.com/design/AbCdEf123456/App?node-id=1-2"], { fetchImpl: f, env });
  assert.match(r.output, /Pay now/);
  assert.doesNotMatch(r.output, /secret/);
});

test("export downloads renders", async () => {
  const out = mkdtempSync(join(tmpdir(), "uxg-figma-"));
  const png = new Uint8Array([137, 80, 78, 71]);
  const f = fakeFetch([
    ["https://api.figma.com/v1/images/AbCdEf123456", { images: { "1:2": "https://render.example/1.png" } }],
    ["https://render.example/1.png", png],
  ]);
  const r = await run(["export", "AbCdEf123456", "--node", "1:2", "--out", out], { fetchImpl: f, env });
  const file = r.output.split(/\s+/)[1];
  assert.deepEqual([...readFileSync(file)], [...png]);
});

test("clear errors for 403 and bad scale", async () => {
  const f = fakeFetch([["https://api.figma.com/v1/files", 403]]);
  await assert.rejects(run(["outline", "AbCdEf123456"], { fetchImpl: f, env }), /403/);
  await assert.rejects(run(["export", "AbCdEf123456", "--node", "1:2", "--scale", "9"], { fetchImpl: f, env }), /scale/);
});
