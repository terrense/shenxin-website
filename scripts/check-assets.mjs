#!/usr/bin/env node
/**
 * Verifies that every asset path referenced from src/content/assets.ts exists
 * under public/.
 *
 * A missing cover is invisible in development (the browser just shows a broken
 * image you may not scroll to) and embarrassing in production. This turns it
 * into a failed build. Runs automatically as part of `npm run build`.
 *
 * Paths are parsed out of the source rather than imported, so this stays a
 * plain Node script with no TypeScript build step of its own.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS_TS = join(ROOT, 'src', 'content', 'assets.ts');
const PUBLIC = join(ROOT, 'public');

const source = await readFile(ASSETS_TS, 'utf8');

// Strip comments first: the file documents the format with commented-out
// example paths that deliberately do not exist.
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trim().startsWith('//'))
  .join('\n');

const referenced = [...code.matchAll(/(?:src|thumb|wide|poster)\s*:\s*'(\/[^']+)'/g)].map(
  (m) => m[1],
);

const missing = referenced.filter((p) => !existsSync(join(PUBLIC, p)));

if (missing.length) {
  console.error(`[assets] ${missing.length} referenced file(s) not found under public/:\n`);
  for (const p of missing) console.error(`  public${p}`);
  console.error('\nUnzip the asset pack into public/assets/, or correct the path.');
  process.exit(1);
}

console.log(
  referenced.length
    ? `[assets] OK — ${referenced.length} referenced file(s) present.`
    : '[assets] OK — no cover art wired up yet; projects use their generated motifs.',
);
