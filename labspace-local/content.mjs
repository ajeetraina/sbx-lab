#!/usr/bin/env node
// The Labspace content: instructions/ as the Labspace interface should show it.
//
// The modules end with a navigation footer for GitHub, such as
//   [[<< Previous: Kits](02-kits.md) | [Next >> Agent sandbox](04-first-sandbox.md)]
// The Labspace has its own Previous/Next buttons, and these links would open the raw Markdown,
// so the footer is removed. Everything else is copied as is.
//
//   node labspace-local/content.mjs <out-dir> [--watch]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const instructionsDir = path.resolve(here, "..", "instructions");

// A line made only of bracketed links: "[[Home](../README.md) | [Next >> X](01-x.md)]"
const FOOTER = /^\[\[[^\n]*\]\([^)\n]*\)\][ \t]*$/gm;

export function stripFooter(markdown) {
  return markdown.replace(FOOTER, "").replace(/\s+$/, "\n");
}

export function writeContent(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const entry of fs.readdirSync(instructionsDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const from = path.join(instructionsDir, entry.name);
    const to = path.join(outDir, entry.name);
    if (entry.name.endsWith(".md")) fs.writeFileSync(to, stripFooter(fs.readFileSync(from, "utf8")));
    else fs.copyFileSync(from, to);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = process.argv[2];
  if (!outDir) {
    console.error("usage: node content.mjs <out-dir> [--watch]");
    process.exit(1);
  }
  writeContent(outDir);
  if (process.argv.includes("--watch")) {
    // Keep the copy current while the Labspace runs, so edits show on refresh
    // Editors and git replace files (delete, then create): a copy can catch a file that is gone,
    // so a failed copy is retried on the next change instead of stopping the watcher.
    let timer;
    fs.watch(instructionsDir, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          writeContent(outDir);
        } catch (err) {
          console.error(`content.mjs: ${err.message}; retrying on the next change`);
        }
      }, 150);
    });
  }
}
