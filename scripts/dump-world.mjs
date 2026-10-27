#!/usr/bin/env node
/**
 * Prints the hall as ASCII and runs its invariants.
 *
 * `world.ts` generates the map from a room spec, which is more reliable than
 * authoring 40 rows of 56 characters by hand but has the opposite problem:
 * you cannot see what you built. This bundles the module with esbuild (already
 * a Vite dependency) and dumps the grid, so a wall in the wrong place is
 * visible in one command instead of after a full build and a browser reload.
 *
 * Also fails the process if `assertWorld` reports anything, which makes it
 * usable as a build gate.
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');

const dir = await mkdtemp(join(tmpdir(), 'world-'));
const out = join(dir, 'world.mjs');

try {
  await build({
    entryPoints: [join(root, 'src/game/world.ts')],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    alias: { '@': join(root, 'src') },
  });

  const w = await import(pathToFileURL(out).href);

  const GLYPH = {
    [w.Cell.Void]: ' ',
    [w.Cell.Wall]: '#',
    [w.Cell.Floor]: '·',
    [w.Cell.Inlay]: '+',
    [w.Cell.Rug]: '=',
    [w.Cell.Pillar]: 'O',
    [w.Cell.Shelf]: 'B',
    [w.Cell.Window]: '"',
  };

  const marks = new Map(w.placed.map((e) => [`${e.x},${e.y}`, e.id[0].toUpperCase()]));
  marks.set(`${w.START.x},${w.START.y}`, '@');

  const header = '   ' + [...Array(w.MAP_W)].map((_, i) => (i % 10 === 0 ? i / 10 : '·')).join('');
  const lines = [header];
  for (let y = 0; y < w.MAP_H; y++) {
    let row = String(y).padStart(2, ' ') + ' ';
    for (let x = 0; x < w.MAP_W; x++) {
      row += marks.get(`${x},${y}`) ?? GLYPH[w.cellAt(x, y)] ?? '?';
    }
    lines.push(row);
  }
  console.log(lines.join('\n'));

  console.log(
    '\nlegend  @ start   O pillar   B shelf   " window   = rug   + inlay   letter = exhibit',
  );
  console.log(`exhibits: ${w.placed.length}`);

  const problems = w.assertWorld();
  if (problems.length) {
    console.error('\nFAIL');
    for (const p of problems) console.error('  ' + p);
    process.exitCode = 1;
  } else {
    console.log('\nOK — every exhibit reachable from start');
  }
} finally {
  await rm(dir, { recursive: true, force: true });
  void writeFile;
}
