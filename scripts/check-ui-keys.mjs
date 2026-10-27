#!/usr/bin/env node
/**
 * Verifies every `ui(...)` key exists in the dictionary.
 *
 * TypeScript normally guarantees this, because `UIKey` is derived from the
 * dictionary object. But several call sites build the key from data and cast:
 *
 *     ui(`${spec.copyKey}.eyebrow` as UIKey)
 *     ui(`case.section.${section.id}` as UIKey)
 *
 * The cast silences the compiler, so a key removed from the dictionary passes
 * `tsc` and then throws at runtime — `ui[key]` is undefined, reading `[locale]`
 * off it is a TypeError, and React unmounts the whole tree. The page goes
 * white with no text and no obvious cause.
 *
 * This resolves the dynamic patterns against the real data and checks them.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const dict = await readFile(join(ROOT, 'src', 'i18n', 'dictionary.ts'), 'utf8');
const keys = new Set([...dict.matchAll(/^\s*'([^']+)':\s*\{/gm)].map((m) => m[1]));

/** Values the dynamic call sites can produce, taken from the type unions. */
const DYNAMIC = [
  // DomainSection: `${spec.copyKey}.{eyebrow,title,lede}`
  ...['agentic', 'robotics', 'health'].flatMap((p) =>
    ['eyebrow', 'title', 'lede'].map((s) => `${p}.${s}`),
  ),
  // ProjectCase: `case.section.${CaseSectionId}`
  ...['problem', 'architecture', 'decisions', 'experiments', 'results', 'demo', 'reflection'].map(
    (s) => `case.section.${s}`,
  ),
  // Tag: `status.${ProjectStatus}`
  ...['shipped', 'active', 'research', 'archived'].map((s) => `status.${s}`),
  // CaseBlocks: `callout.${tone}`
  ...['insight', 'warning', 'note'].map((s) => `callout.${s}`),
  // Icons/links: `link.${LinkKind}`
  ...['repo', 'demo', 'paper', 'video', 'doc', 'external'].map((s) => `link.${s}`),
];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (['.ts', '.tsx'].includes(extname(e.name))) out.push(full);
  }
  return out;
}

const missing = [];

// Literal call sites: ui('some.key')
for (const file of await walk(join(ROOT, 'src'))) {
  const source = await readFile(file, 'utf8');
  for (const m of source.matchAll(/\bui\(\s*'([^']+)'\s*\)/g)) {
    if (!keys.has(m[1])) missing.push(`${relative(ROOT, file)}  ui('${m[1]}')`);
  }
}

// Dynamic call sites, resolved above.
for (const key of DYNAMIC) {
  if (!keys.has(key)) missing.push(`(dynamic)  ${key}`);
}

if (missing.length) {
  console.error(`[ui-keys] ${missing.length} key(s) referenced but not in the dictionary:\n`);
  for (const line of missing) console.error(`  ${line}`);
  console.error('\nThese throw at runtime and blank the page.');
  process.exit(1);
}

console.log(`[ui-keys] OK — ${keys.size} keys defined, every reference resolves.`);
