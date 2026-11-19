# Your design library

Many designers keep a folder of books, papers and notes they trust. UX Grandmaster can use that folder as a reference while it works, and cite it by title and page, without anything leaving your machine.

## How it works

1. You point UX Grandmaster at a folder you own.
2. `uxg library index` reads the PDF, Markdown and text files in it and builds a search index in `~/.ux-grandmaster/library/`.
3. While critiquing, researching or designing, the agent searches the index and cites what it finds: "Practical UI, page 233".

## Set it up

**Claude Code:** when you install the plugin, it asks for "Your design library". Pick the folder, or leave it empty.

**Any agent:** set an environment variable, or index the folder once:

```bash
export UX_GRANDMASTER_LIBRARY="$HOME/Documents/Design Library"
```

```bash
node scripts/uxg.mjs library index --dir "$HOME/Documents/Design Library"
```

PDF reading needs `pdftotext` from Poppler (`brew install poppler` on macOS, `sudo apt install poppler-utils` on Debian or Ubuntu). Scanned PDFs without a text layer are skipped and listed.

## Copyright and privacy

- **Nothing ships with UX Grandmaster.** The plugin contains no book text. You bring your own files.
- **Nothing is uploaded.** The index is a local file. The search runs on your machine.
- **Short excerpts only.** A search result carries about 40 words around the match, enough to cite and check, not to reproduce. The skills tell the agent to paraphrase and cite, and to keep quotes short.
- **Your outputs stay clean.** The skills tell the agent not to paste library text into files you will commit, publish or share. Cite the source instead.

Use only files you have the right to use.
