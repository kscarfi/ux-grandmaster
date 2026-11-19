// Minimal RFC 4180 CSV reader: quoted fields, escaped quotes, CRLF or LF.

import { readFileSync } from "node:fs";

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (inQuotes) throw new Error("CSV has an unclosed quote.");
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** Read a CSV file into an array of objects keyed by the header row. */
export function readCsv(file, requiredColumns = []) {
  let text;
  try {
    text = readFileSync(file, "utf8").replace(/^﻿/, "");
  } catch (err) {
    throw new Error(`Cannot read CSV "${file}": ${err.code ?? err.message}`);
  }
  const rows = parseCsv(text);
  if (!rows.length) throw new Error(`"${file}" is empty.`);
  const header = rows[0].map((h) => h.trim());
  const missing = requiredColumns.filter((c) => !header.includes(c));
  if (missing.length) {
    throw new Error(`"${file}" is missing column(s): ${missing.join(", ")}. Found: ${header.join(", ")}`);
  }
  return rows.slice(1).map((r, i) => {
    if (r.length !== header.length) {
      throw new Error(`Row ${i + 2} of "${file}" has ${r.length} fields, the header has ${header.length}.`);
    }
    return Object.fromEntries(header.map((h, j) => [h, r[j]]));
  });
}
