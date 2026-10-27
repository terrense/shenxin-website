#!/usr/bin/env node
/**
 * Emits dist/sitemap.xml after the Vite build.
 *
 * This is a client-rendered SPA, so crawlers that do not execute JavaScript
 * only ever see index.html. A sitemap is what makes the case studies
 * discoverable to them, and it is cheap to keep correct: slugs are read
 * straight out of the content files rather than maintained by hand, so adding
 * a project cannot silently fail to appear.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = join(ROOT, 'src', 'content', 'projects');
const DIST = join(ROOT, 'dist');

/** Keep in sync with SITE_URL in src/content/site.ts. */
const SITE_URL = process.env.SITE_URL ?? 'https://shenxin.dev';

async function readSlugs() {
  const files = (await readdir(PROJECTS_DIR)).filter((f) => f.endsWith('.ts'));
  const slugs = [];

  for (const file of files) {
    const source = await readFile(join(PROJECTS_DIR, file), 'utf8');
    const match = source.match(/^\s*slug:\s*['"]([^'"]+)['"]/m);
    if (match) {
      slugs.push(match[1]);
    } else {
      // Loud, not silent: a project with no slug is a routing bug.
      console.warn(`[seo] no slug found in ${file} — skipping`);
    }
  }

  return slugs.sort();
}

function urlEntry(path, { priority, changefreq, lastmod }) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('[seo] dist/ not found — run `vite build` first.');
    process.exit(1);
  }

  const slugs = await readSlugs();
  const lastmod = new Date().toISOString().slice(0, 10);

  const entries = [
    urlEntry('/', { priority: '1.0', changefreq: 'monthly', lastmod }),
    urlEntry('/projects', { priority: '0.9', changefreq: 'monthly', lastmod }),
    urlEntry('/footprints', { priority: '0.5', changefreq: 'yearly', lastmod }),
    ...slugs.map((slug) =>
      urlEntry(`/projects/${slug}`, { priority: '0.8', changefreq: 'yearly', lastmod }),
    ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`[seo] sitemap.xml written — ${entries.length} URLs (${slugs.length} projects)`);
}

main().catch((error) => {
  console.error('[seo] failed:', error);
  process.exit(1);
});
