#!/usr/bin/env node
/**
 * Dev aid: finds Tailwind class names used in src/ that the build did not emit.
 *
 * A misspelled utility (`z-100`, `counter-reset-[step]`) fails silently — the
 * class lands in the HTML, matches no rule, and the layout is subtly wrong with
 * nothing in the console. This diffs classes in source against the compiled
 * stylesheet so those appear as a list instead of a visual bug hunt.
 *
 *   npm run build && npm run check:classes
 *
 * Two things make the output trustworthy:
 *
 *   1. Only `className` values and `cn(...)` arguments are scanned, so English
 *      prose containing hyphens ("post-training", "sim-to-real") is not
 *      mistaken for a utility.
 *   2. Backslashes are stripped from the stylesheet before matching. Tailwind
 *      escapes `.` and `/` in selectors (`.gap-1\.5`, `.bg-signal\/10`), so a
 *      naive search reports every fractional and alpha-modified class as
 *      missing.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Not utilities: our own hooks, state markers, or plain HTML. */
const IGNORE = new Set([
  'group',
  'peer',
  'dark',
  'sr-only',
  'not-sr-only',
  'not-prose',
  'prose-lab',
  'shell',
  'glass',
  'glass-strong',
  'label',
  'rule-fade',
  'text-gradient',
  'section-y',
]);

const VARIANT = /^(?:[a-z0-9@-]+|\[[^\]]+\]|&[^:]*|group-[a-z-]+|peer-[a-z-]+):/;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (['.tsx', '.ts'].includes(extname(entry.name))) out.push(full);
  }
  return out;
}

/**
 * Pulls class strings out of the places classes actually live, rather than
 * every string literal in the file.
 */
function classStrings(source) {
  const found = [];

  // className="..." and className={'...'}
  for (const m of source.matchAll(/className=\{?["'`]([^"'`]*)["'`]/g)) found.push(m[1]);

  // cn( ... ) — grab the whole call, then the literals inside. Comparison
  // operands (`variant === 'bento' && 'h-full'`) are stripped first; they are
  // values, not classes, and would otherwise be reported as missing utilities.
  for (const m of source.matchAll(/\bcn\(([\s\S]*?)\)/g)) {
    // Also strip `?? 'signal'` style defaults used to index a lookup table.
    const body = m[1]
      .replace(/[!=]==?\s*["'`][^"'`]*["'`]/g, '')
      .replace(/\?\?\s*["'`][^"'`]*["'`]/g, '');
    for (const lit of body.matchAll(/["'`]([^"'`]*)["'`]/g)) found.push(lit[1]);
  }

  // The accent/span lookup tables in src/lib/utils.ts are plain object values.
  if (/accentClasses|bentoSpan/.test(source)) {
    for (const m of source.matchAll(
      /(?:text|border|bg|from|ring|shadow|glow|hex)\s*:\s*["'`]([^"'`]*)["'`]/g,
    )) {
      found.push(m[1]);
    }
    for (const m of source.matchAll(
      /^\s*(?:anchor|wide|tall|cell)\s*:\s*["'`]([^"'`]*)["'`]/gm,
    )) {
      found.push(m[1]);
    }
  }

  return found;
}

function baseOf(token) {
  let t = token.replace(/^!/, '');
  let guard = 0;
  while (VARIANT.test(t) && guard++ < 12) t = t.replace(VARIANT, '');
  return t;
}

async function main() {
  const distDir = join(ROOT, 'dist', 'assets');
  let files;
  try {
    files = await readdir(distDir);
  } catch {
    console.error('[classes] dist/assets not found — run `npm run build` first.');
    process.exit(1);
  }
  const cssFile = files.find((f) => f.endsWith('.css'));
  if (!cssFile) {
    console.error('[classes] no CSS in dist/assets — run `npm run build` first.');
    process.exit(1);
  }

  // Strip Tailwind's selector escaping so `.gap-1\.5` matches `gap-1.5`.
  const css = (await readFile(join(distDir, cssFile), 'utf8')).replace(/\\/g, '');

  const suspects = new Map();

  for (const file of await walk(join(ROOT, 'src'))) {
    const source = await readFile(file, 'utf8');
    for (const chunk of classStrings(source)) {
      for (const raw of chunk.split(/\s+/)) {
        if (!raw) continue;
        const base = baseOf(raw);
        if (!base || IGNORE.has(base)) continue;
        // Arbitrary values are emitted close to verbatim; too noisy to verify.
        if (base.includes('[')) continue;
        // Hex colours and other non-class values from the lookup tables.
        if (base.startsWith('#')) continue;
        if (!/^-?[a-z]/.test(base)) continue;

        if (!css.includes(`.${base}`) && !css.includes(`:${base}`)) {
          if (!suspects.has(base)) suspects.set(base, new Set());
          suspects.get(base).add(relative(ROOT, file));
        }
      }
    }
  }

  if (!suspects.size) {
    console.log('[classes] OK — every scanned utility is present in the compiled CSS.');
    return;
  }

  console.log(`[classes] ${suspects.size} class(es) not found in the compiled CSS:\n`);
  for (const [token, where] of [...suspects].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${token}`);
    for (const file of where) console.log(`      ${file}`);
  }
  process.exitCode = 1;
}

main().catch((e) => {
  console.error('[classes] failed:', e);
  process.exit(1);
});
