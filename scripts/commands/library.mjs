// uxg library: index and search the user's own design library, on their machine.

import { parseArgs } from "node:util";
import { buildIndex, indexPath, readIndex, resolveLibraryDir, search, EXCERPT_WORDS } from "../lib/library.mjs";

export const help = `Usage:
  uxg library index [--dir <folder>]
  uxg library search "<query>" [--limit <n>] [--json]
  uxg library status [--json]

Indexes PDF, Markdown and text files in your own design library and finds
the pages that discuss a topic, with title and page number for citation.

The library folder comes from, in order: --dir, the UX_GRANDMASTER_LIBRARY
environment variable, the Claude Code plugin option "library_path", or the
folder used by the last index run.

Your files never leave your machine. The index is stored in
~/.ux-grandmaster/library/ (set UX_GRANDMASTER_HOME to move it).
Each search result carries an excerpt of about ${EXCERPT_WORDS} words: enough to
cite the source, not to reproduce it.

PDF text extraction needs pdftotext (Poppler):
  macOS: brew install poppler   Debian/Ubuntu: sudo apt install poppler-utils
  Windows: install Poppler and add its bin folder to PATH

Exit codes: 0 done, 1 no library or no results, 2 usage error.`;

export function run(argv) {
  const [sub, ...rest] = argv;
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      dir: { type: "string" },
      limit: { type: "string", default: "5" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help || !sub || sub === "help") return { output: help, code: sub ? 0 : 2 };

  if (sub === "index") {
    const dir = resolveLibraryDir(values.dir);
    if (!dir) {
      return {
        output:
          "No library folder set. Run `uxg library index --dir <folder>` or set UX_GRANDMASTER_LIBRARY.",
        code: 1,
      };
    }
    const index = buildIndex(dir, { onProgress: (p) => process.stderr.write(`indexing ${p}\n`) });
    const pages = index.documents.reduce((n, d) => n + d.pages.length, 0);
    const lines = [
      `Indexed ${index.documents.length} document(s), ${pages} page(s), from ${dir}.`,
      `Index: ${indexPath()}`,
    ];
    if (index.problems.length) {
      lines.push(`Not indexed (${index.problems.length}):`, ...index.problems.map((p) => `- ${p.path}: ${p.reason}`));
    }
    return { output: values.json ? JSON.stringify(summary(index), null, 2) : lines.join("\n"), code: 0 };
  }

  if (sub === "status") {
    const index = readIndex();
    if (!index) return { output: "No library index yet. Run `uxg library index --dir <folder>`.", code: 1 };
    const s = summary(index);
    if (values.json) return { output: JSON.stringify(s, null, 2), code: 0 };
    return {
      output: [
        `Library: ${s.root}`,
        `Built: ${s.builtAt}`,
        `Documents: ${s.documents.length}`,
        ...s.documents.map((d) => `- ${d.title} (${d.pages} pages)`),
        ...(s.problems.length ? [`Not indexed: ${s.problems.length}`] : []),
      ].join("\n"),
      code: 0,
    };
  }

  if (sub === "search") {
    const query = positionals.join(" ").trim();
    if (!query) return { output: 'Give a query: uxg library search "button hierarchy"', code: 2 };
    const index = readIndex();
    if (!index) return { output: "No library index yet. Run `uxg library index --dir <folder>`.", code: 1 };
    const limit = Number.parseInt(values.limit, 10);
    if (!Number.isInteger(limit) || limit < 1) return { output: "--limit must be a positive whole number.", code: 2 };
    const hits = search(index, query, { limit });
    if (values.json) return { output: JSON.stringify({ query, hits }, null, 2), code: hits.length ? 0 : 1 };
    if (!hits.length) return { output: `No pages match "${query}".`, code: 1 };
    return {
      output: hits
        .map((h, i) => `${i + 1}. ${h.title}, page ${h.page} (score ${h.score})\n   ${h.excerpt}`)
        .join("\n\n"),
      code: 0,
    };
  }

  return { output: `Unknown subcommand "${sub}".\n\n${help}`, code: 2 };
}

function summary(index) {
  return {
    root: index.root,
    builtAt: index.builtAt,
    index: indexPath(),
    documents: index.documents.map((d) => ({ title: d.title, path: d.path, pages: d.pages.length })),
    problems: index.problems,
  };
}
