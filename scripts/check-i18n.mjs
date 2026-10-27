#!/usr/bin/env node
/**
 * Reports translation coverage per locale, per file.
 *
 * English and Chinese are required by the `L` type, so TypeScript already
 * guarantees those. Russian is optional and falls back to English — which is
 * the right trade for shipping, but it means a missing translation is
 * invisible. This makes the gap a number someone has to look at.
 *
 * Counting is structural: every `en:` key inside a localised object is one
 * string, and the matching `ru:` either exists or does not. Comments and
 * ordinary code are not localised objects, so they do not register.
 *
 *   npm run check:i18n
 *   npm run check:i18n -- --missing     # list the untranslated strings
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOW_MISSING = process.argv.includes('--missing');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (['.ts', '.tsx'].includes(extname(entry.name))) out.push(full);
  }
  return out;
}

/**
 * Finds `en: '...'` and reports whether an `ru:` follows before the object
 * closes. Localised objects in this codebase always order en, zh, ru and
 * never nest another `en:` inside one, so a bounded forward scan is reliable
 * and far simpler than parsing TypeScript.
 */
function scan(source) {
  const entries = [];
  const re = /(^|[\s{,])en:\s*(['"`])/gm;
  let m;

  while ((m = re.exec(source))) {
    const start = m.index;
    // Look ahead to the end of this localised object. 4000 chars comfortably
    // covers the longest bilingual paragraph pair in the content.
    const window = source.slice(start, start + 4000);
    const close = window.indexOf('\n    },');
    const scope = close === -1 ? window.slice(0, 1200) : window.slice(0, close);

    const hasRu = /(^|[\s{,])ru:\s*['"`]/m.test(scope);
    const snippet = (source.slice(start + m[0].length - 1, start + 90).match(/^(['"`])([^'"`]{0,70})/) ?? [])[2];
    entries.push({ hasRu, snippet: (snippet ?? '').trim() });
  }

  return entries;
}

const files = await walk(join(ROOT, 'src'));
const rows = [];
let total = 0;
let translated = 0;
const missingList = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const entries = scan(source);
  if (!entries.length) continue;

  const done = entries.filter((e) => e.hasRu).length;
  total += entries.length;
  translated += done;
  rows.push({ file: relative(ROOT, file), done, count: entries.length });

  if (SHOW_MISSING) {
    for (const e of entries) {
      if (!e.hasRu) missingList.push(`${relative(ROOT, file)}  ${e.snippet}`);
    }
  }
}

rows.sort((a, b) => a.done / a.count - b.done / b.count || b.count - a.count);

const width = Math.max(...rows.map((r) => r.file.length));
console.log('Russian translation coverage\n');
for (const r of rows) {
  const pct = Math.round((r.done / r.count) * 100);
  const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '·');
  console.log(`  ${r.file.padEnd(width)}  ${bar} ${String(pct).padStart(3)}%  ${r.done}/${r.count}`);
}

const pct = total ? Math.round((translated / total) * 100) : 100;
console.log(`\n  TOTAL: ${translated}/${total} strings (${pct}%)`);

if (SHOW_MISSING && missingList.length) {
  console.log(`\nUntranslated (${missingList.length}):\n`);
  for (const line of missingList) console.log(`  ${line}`);
} else if (missingList.length === 0 && SHOW_MISSING) {
  console.log('\nNothing missing.');
} else if (pct < 100) {
  console.log('\n  Run with --missing to list the untranslated strings.');
}
