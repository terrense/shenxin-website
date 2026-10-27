#!/usr/bin/env node
/**
 * Pre-renders a world map into static SVG path data.
 *
 * Run at build time, never at runtime. The alternative — shipping TopoJSON
 * plus d3-geo and projecting in the browser — would add roughly 150 KB of
 * library and data to a page that draws one map that never changes. Here the
 * projection happens once, on this machine, and the site ships only the
 * resulting path strings.
 *
 * It also keeps the strict CSP intact: no external map tiles, no fetch, no
 * third-party script. The map is just SVG in the bundle.
 *
 * Source: world-atlas (Natural Earth, public domain), 110m resolution —
 * coarse enough to stay small, detailed enough that countries are
 * recognisable at the size this renders.
 *
 *   npm run build:map
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { geoEquirectangular, geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Viewport of the generated SVG. 2:1 suits an equirectangular projection. */
const WIDTH = 1000;
const HEIGHT = 500;

/**
 * Equirectangular rather than Natural Earth: it matches the flat, rectangular
 * look of the reference, and keeps Russia wide enough to read at a glance —
 * which matters when Russia is one of the highlighted countries.
 */
const projection = geoEquirectangular();
const path = geoPath(projection);

const topoPath = require.resolve('world-atlas/countries-110m.json');
const topo = JSON.parse(await readFile(topoPath, 'utf8'));
const countries = feature(topo, topo.objects.countries);

/**
 * Antarctica is dropped. It spans the entire bottom edge of an
 * equirectangular projection, adds a sixth of the map's height for a
 * landmass nobody has visited, and the reference map omits it too.
 */
const ISO_ANTARCTICA = '010';
const features = countries.features.filter((f) => String(f.id) !== ISO_ANTARCTICA);

// Fit the remaining land to the viewport, with a small inset so coastlines
// are not clipped by the edge.
const inset = 4;
projection.fitExtent(
  [
    [inset, inset],
    [WIDTH - inset, HEIGHT - inset],
  ],
  { type: 'FeatureCollection', features },
);

/** Trim coordinate precision: at this size, sub-pixel detail is invisible. */
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

const shapes = features
  .map((f) => {
    const d = path(f);
    if (!d) return null;
    // Projected centroid, so the map can place a marker on a country too
    // small to see at this scale — the UAE is about three pixels wide.
    const [cx, cy] = path.centroid(f);
    return {
      // ISO 3166-1 numeric, zero-padded — the id world-atlas uses.
      id: String(f.id).padStart(3, '0'),
      name: f.properties?.name ?? '',
      d: round(d),
      cx: Number.isFinite(cx) ? Math.round(cx * 10) / 10 : null,
      cy: Number.isFinite(cy) ? Math.round(cy * 10) / 10 : null,
      // Projected area in square pixels. The map uses it to decide which
      // countries need a locator ring to be noticed at all.
      area: Math.round(path.area(f)),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.id.localeCompare(b.id));

const body = shapes
  .map(
    (s) =>
      `  { id: '${s.id}', name: ${JSON.stringify(s.name)}, cx: ${s.cx}, cy: ${s.cy}, area: ${s.area}, d: '${s.d}' },`,
  )
  .join('\n');

const out = `// GENERATED FILE — do not edit by hand.
//
// Produced by scripts/build-world-map.mjs from world-atlas (Natural Earth,
// public domain) at 110m resolution, projected with d3-geo equirectangular
// and fitted to a ${WIDTH}x${HEIGHT} viewBox. Antarctica is omitted.
//
// Regenerate with: npm run build:map

export const WORLD_VIEWBOX = '0 0 ${WIDTH} ${HEIGHT}';

export type CountryShape = {
  /** ISO 3166-1 numeric, zero-padded. */
  id: string;
  /** English name from Natural Earth, for debugging and alt text only. */
  name: string;
  /** Projected centroid, for marking countries too small to see. */
  cx: number | null;
  cy: number | null;
  /** Projected area in square pixels of the viewBox above. */
  area: number;
  /** SVG path data in the viewBox above. */
  d: string;
};

export const WORLD_SHAPES: CountryShape[] = [
${body}
];
`;

const target = join(ROOT, 'src', 'content', 'world-map.ts');
await writeFile(target, out, 'utf8');

const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
console.log(`[map] ${shapes.length} countries -> src/content/world-map.ts (${kb} KB)`);
