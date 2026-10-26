import type { ProjectCover } from './types';

/**
 * ===========================================================================
 * VISUAL ASSET MAP
 * ===========================================================================
 *
 * The single place that connects image files in `public/assets/` to projects.
 * Nothing else in the codebase references a cover path, so dropping in a new
 * asset pack is one edit here plus the files.
 *
 * ---------------------------------------------------------------------------
 * CURRENTLY EMPTY — AND THE SITE IS COMPLETE WITHOUT IT.
 * ---------------------------------------------------------------------------
 *
 * Every project falls back to its generated `CardMotif` (a per-project SVG
 * motif keyed to the project's shape) and the case header falls back to its
 * accent gradient. Those are finished designs, not placeholders, so the site
 * ships today and gains artwork whenever you add it.
 *
 * ---------------------------------------------------------------------------
 * TO WIRE UP AN ASSET PACK
 * ---------------------------------------------------------------------------
 *
 *   1. Unzip into `public/assets/` so files land at e.g.
 *        public/assets/covers/vla-lab.webp
 *      Paths are served from the site root, so the `src` below starts with
 *      `/assets/…` — NOT `./assets` or `src/assets`. Vite copies `public/`
 *      verbatim, so no import or bundler step is involved.
 *
 *   2. Add one entry per project slug below.
 *
 *   3. `npm run check:assets` verifies every referenced file exists. It runs
 *      as part of `npm run build`, so a typo fails the build rather than
 *      shipping a broken image.
 *
 * ---------------------------------------------------------------------------
 * MANDATORY: `mediaKind`
 * ---------------------------------------------------------------------------
 *
 * Generated or illustrated artwork MUST be `mediaKind: 'concept'`. It renders
 * with a visible "Concept visualization" badge, because an unlabelled
 * illustration on an engineering case study reads as a screenshot of the real
 * system. Use `'capture'` only for genuine screenshots, photographs or
 * recordings.
 *
 * The same rule covers portraits: an AI-generated likeness must never be
 * presented as a photograph of a real person. There is deliberately no
 * `avatar` field here — add a real photo or none.
 */
export const projectCovers: Record<string, ProjectCover> = {
  // Template — copy, uncomment, and point at real files:
  //
  // 'vla-lab': {
  //   src: '/assets/covers/vla-lab.webp',
  //   wide: '/assets/covers/vla-lab-wide.webp',   // optional, case header
  //   alt: {
  //     en: 'Abstract visualisation of a vision-language-action policy loop.',
  //     zh: '视觉-语言-动作策略环路的抽象示意。',
  //   },
  //   mediaKind: 'concept',                        // 'concept' for generated art
  //   focus: '50% 40%',                            // optional object-position
  // },
};

export function coverFor(slug: string): ProjectCover | undefined {
  return projectCovers[slug];
}

/** Every asset path referenced here, for the build-time existence check. */
export function referencedAssetPaths(): string[] {
  return Object.values(projectCovers).flatMap((cover) =>
    [cover.src, cover.wide].filter((p): p is string => Boolean(p)),
  );
}
