#!/usr/bin/env node
/**
 * Rasterises public/og.svg to public/og.png (1200×630) and the favicon to
 * public/apple-touch-icon.png (180×180).
 *
 * Why this is a separate, manual script rather than part of `npm run build`:
 * `sharp` is a native dependency, and a build that fails on a machine without
 * prebuilt binaries is worse than a build that cannot regenerate an image.
 * Run it once, commit the PNGs, forget about it.
 *
 *   npm i -D sharp
 *   npm run og
 *
 * Social platforms largely will not render an SVG card, which is why the PNG
 * has to exist at all.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

const TARGETS = [
  { from: 'og.svg', to: 'og.png', width: 1200, height: 630 },
  { from: 'favicon.svg', to: 'apple-touch-icon.png', width: 180, height: 180 },
];

async function main() {
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error(
      '[og] sharp is not installed.\n' +
        '     npm i -D sharp && npm run og\n' +
        '     (Until then the SVG cards still work in-browser; only the social\n' +
        '      preview PNG is missing.)',
    );
    process.exit(1);
  }

  for (const target of TARGETS) {
    const svg = await readFile(join(PUBLIC, target.from));
    // `density` matters: librsvg rasterises at 72dpi by default, which makes
    // text in a 1200px-wide card noticeably soft.
    const png = await sharp(svg, { density: 220 })
      .resize(target.width, target.height, { fit: 'contain', background: '#060912' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await writeFile(join(PUBLIC, target.to), png);
    console.log(
      `[og] ${target.to} — ${target.width}×${target.height}, ${(png.length / 1024).toFixed(1)} KB`,
    );
  }
}

main().catch((error) => {
  console.error('[og] failed:', error);
  process.exit(1);
});
