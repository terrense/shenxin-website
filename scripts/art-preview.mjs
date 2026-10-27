#!/usr/bin/env node
/**
 * Renders the hall's art to a PNG so it can be looked at.
 *
 * The whole reason this scene is drawn from primitives rather than authored
 * as pixel rows is that primitives can be reasoned about — but reasoning is
 * not seeing, and "a brass ring on a tripod" can be perfectly well-formed
 * code that renders as a smudge. This bundles the art module with esbuild,
 * draws it in headless Chrome, and writes the result to disk, which turns
 * art iteration into a loop that takes seconds and does not involve the dev
 * server, React, or the router.
 *
 *   node scripts/art-preview.mjs              # whole hall, 1:1
 *   node scripts/art-preview.mjs --crop 20,28,18,12   # tiles x,y,w,h
 *   node scripts/art-preview.mjs --props      # every prop on a plain grid
 *
 * Output goes to the scratchpad path in OUT below.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const OUT =
  process.env.ART_OUT ??
  join(
    process.env.LOCALAPPDATA ?? tmpdir(),
    'Temp/claude/C--Users-Administrator/775c22d2-b83b-41f4-be45-eac3057078c7/scratchpad/art',
  );

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.log('[art] Chrome not found — skipping.');
  process.exit(0);
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : (args[i + 1] ?? true);
};
const mode = flag('props') ? 'props' : 'hall';
const crop = flag('crop');
const name = flag('name') ?? mode;

// --- bundle the art ---------------------------------------------------------

const p = (f) => join(root, f).replace(/\\/g, '/');
const entry = `
import { paintGround, lightSources, PAL } from '${p('src/game/paint.ts')}';
import { paintProp, paintHero, entities } from '${p('src/game/props.ts')}';
import { MAP_W, MAP_H, TILE, placed, START } from '${p('src/game/world.ts')}';
window.ART = { paintGround, paintProp, paintHero, entities, lightSources, PAL, MAP_W, MAP_H, TILE, placed, START };
`;

const dir = mkdtempSync(join(tmpdir(), 'art-'));
const entryFile = join(dir, 'entry.ts');
writeFileSync(entryFile, entry);
const bundleFile = join(dir, 'bundle.js');

try {
  await build({
    entryPoints: [entryFile],
    outfile: bundleFile,
    bundle: true,
    format: 'iife',
    target: 'chrome120',
    alias: { '@': join(root, 'src') },
    logLevel: 'warning',
  });
} catch (e) {
  console.error('[art] bundle failed');
  console.error(e.message);
  process.exit(1);
}

const bundle = (await import('node:fs')).readFileSync(bundleFile, 'utf8');

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#20242b}canvas{display:block;image-rendering:pixelated}
</style></head><body><canvas id="c"></canvas><script>${bundle}</script><script>
const A = window.ART;
const c = document.getElementById('c');
const g = c.getContext('2d');
const MODE = ${JSON.stringify(mode)};
const CROP = ${JSON.stringify(crop)};

function drawHall() {
  const full = document.createElement('canvas');
  full.width = A.MAP_W * A.TILE;
  full.height = A.MAP_H * A.TILE;
  const fg = full.getContext('2d');
  A.paintGround(fg);
  // Same depth sort the live scene uses, with the figure dropped in at its
  // start tile so the preview shows what the player actually sees.
  const heroY = A.START.y + 0.7;
  const sorted = [...A.entities].sort((a, b) => a.y - b.y);
  let i = 0;
  while (i < sorted.length && sorted[i].y + 0.5 < heroY) sorted[i++].draw(fg);
  A.paintHero(fg, (A.START.x + 0.5) * A.TILE, heroY * A.TILE, 'down', 0);
  while (i < sorted.length) sorted[i++].draw(fg);

  // Light, the same way the live scene composites it.
  if (A.lightSources) {
    fg.save();
    fg.globalCompositeOperation = 'screen';
    for (const s of A.lightSources()) {
      const rg = fg.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      rg.addColorStop(0, 'rgba(255,230,173,' + s.a + ')');
      rg.addColorStop(0.5, 'rgba(255,230,173,' + (s.a * 0.35) + ')');
      rg.addColorStop(1, 'rgba(255,230,173,0)');
      fg.fillStyle = rg;
      fg.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    }
    fg.restore();
  }

  let sx = 0, sy = 0, sw = full.width, sh = full.height, zoom = 1;
  if (CROP) {
    const [tx, ty, tw, th] = String(CROP).split(',').map(Number);
    sx = tx * A.TILE; sy = ty * A.TILE; sw = tw * A.TILE; sh = th * A.TILE;
    zoom = Math.min(3, Math.floor(1600 / sw) || 1);
  }
  c.width = sw * zoom;
  c.height = sh * zoom;
  g.imageSmoothingEnabled = false;
  g.drawImage(full, sx, sy, sw, sh, 0, 0, sw * zoom, sh * zoom);
}

function drawProps() {
  const kinds = A.placed.map(e => e.kind);
  const cols = 5, cell = 96, zoom = 3;
  const rows = Math.ceil(kinds.length / cols);
  const w = cols * cell, h = rows * cell;
  const full = document.createElement('canvas');
  full.width = w; full.height = h;
  const fg = full.getContext('2d');
  fg.fillStyle = A.PAL.floor; fg.fillRect(0,0,w,h);
  fg.strokeStyle = A.PAL.grout;
  for (let i=0;i<=cols;i++){fg.beginPath();fg.moveTo(i*cell,0);fg.lineTo(i*cell,h);fg.stroke();}
  for (let i=0;i<=rows;i++){fg.beginPath();fg.moveTo(0,i*cell);fg.lineTo(w,i*cell);fg.stroke();}
  kinds.forEach((kind, i) => {
    const cx = (i % cols) * cell + cell / 2;
    const cy = Math.floor(i / cols) * cell + cell - 20;
    A.paintProp(fg, kind, cx, cy);
    fg.fillStyle = A.PAL.ink;
    fg.font = '9px monospace';
    fg.textAlign = 'center';
    fg.fillText(kind, cx, Math.floor(i / cols) * cell + cell - 5);
  });
  c.width = w * zoom; c.height = h * zoom;
  g.imageSmoothingEnabled = false;
  g.drawImage(full, 0, 0, w, h, 0, 0, w * zoom, h * zoom);
}

try {
  if (MODE === 'props') drawProps(); else drawHall();
  document.title = 'ready ' + c.width + 'x' + c.height;
} catch (e) {
  document.title = 'error: ' + e.message;
  c.width = 1200; c.height = 80;
  g.fillStyle = '#fff'; g.font = '14px monospace';
  g.fillText(String(e.message), 10, 30);
  g.fillText(String(e.stack || '').split('\\n')[1] || '', 10, 54);
}
</script></body></html>`;

const pageFile = join(dir, 'page.html');
writeFileSync(pageFile, page);

// --- render -----------------------------------------------------------------

const PORT = 9800 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), 'art-profile-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1920,1400',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = () => {
  try {
    chrome.kill();
  } catch {
    /* gone */
  }
  for (const d of [dir, profile]) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
};

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find((t) => t.type === 'page');
    } catch {
      /* not up */
    }
    if (!target) await sleep(250);
  }
  if (!target) throw new Error('Chrome did not expose a debugging target');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: `file:///${pageFile.replace(/\\/g, '/')}` });
  await sleep(1800);

  const title = await send('Runtime.evaluate', { expression: 'document.title' });
  const status = title.result?.result?.value ?? '';
  const size = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({w: c.width, h: c.height})',
  });
  const { w, h } = JSON.parse(size.result?.result?.value ?? '{"w":0,"h":0}');

  await send('Emulation.setDeviceMetricsOverride', {
    width: Math.min(w, 4000) || 800,
    height: Math.min(h, 4000) || 600,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(300);

  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const data = shot.result?.data;
  if (!data) throw new Error('screenshot failed');

  mkdirSync(dirname(join(OUT, `${name}.png`)), { recursive: true });
  const file = join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`[art] ${status}`);
  console.log(`[art] wrote ${file} (${w}x${h})`);
} catch (e) {
  console.error('[art] ' + e.message);
  process.exitCode = 1;
} finally {
  cleanup();
}
