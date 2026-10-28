#!/usr/bin/env node
/**
 * Screenshots a page from the running preview server.
 *
 * `check-render` answers "did it render"; this answers "what does it look
 * like", which for the hall is the only question that matters — a canvas
 * scene can pass every automated check and still be ugly, and the automated
 * checks cannot tell the difference.
 *
 *   npm run preview &
 *   node scripts/shot.mjs /hall
 *   node scripts/shot.mjs /hall --size 430,932 --name hall-phone
 *   node scripts/shot.mjs / --full
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  console.log('[shot] Chrome not found — skipping.');
  process.exit(0);
}

const args = process.argv.slice(2);
const flag = (n) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? null : (args[i + 1] ?? true);
};
const path = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const base = process.env.PREVIEW_URL ?? 'http://localhost:4173';
const url = /^https?:/.test(path ?? '') ? path : base + (path ?? '/');
const [w, h] = String(flag('size') ?? '1440,900').split(',').map(Number);
const slug = (path ?? 'home').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
const name = flag('name') ?? (slug === '' ? 'home' : slug);
const full = Boolean(flag('full'));
const wait = Number(flag('wait') ?? 2600);

const PORT = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), 'shot-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${w},${h}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const errors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
    if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') {
      errors.push(m.params.entry.text);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params?.exceptionDetails?.text ?? 'uncaught exception');
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
  await send('Log.enable');
  const mobile = w < 600;
  await send('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile,
  });
  // Device metrics alone do not change `(pointer: coarse)`, so a page that
  // branches on it — the hall tells you to drag rather than press WASD —
  // screenshots as the desktop variant and the check silently passes.
  if (mobile) {
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Emulation.setEmitTouchEventsForMouse', {
      enabled: true,
      configuration: 'mobile',
    });
  }
  // Force the interface language before the app boots. The locale lives in
  // localStorage, so it has to be seeded on the origin and the page reloaded
  // — otherwise every screenshot is whatever the headless browser's
  // Accept-Language happens to be, which makes checking a translation
  // impossible.
  const locale = flag('locale');
  if (locale) {
    await send('Page.navigate', { url: new URL(url).origin + '/' });
    await sleep(600);
    await send('Runtime.evaluate', {
      expression: `localStorage.setItem('portfolio.locale', ${JSON.stringify(locale)})`,
    });
  }

  await send('Page.navigate', { url });
  await sleep(wait);

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
  });
  const data = shot.result?.data;
  if (!data) throw new Error('screenshot failed');

  mkdirSync(OUT, { recursive: true });
  const file = join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`[shot] ${url} -> ${file} (${w}x${h})`);
  if (errors.length) {
    console.log('[shot] console errors:');
    for (const e of errors.slice(0, 8)) console.log('  ' + e);
  }
} catch (e) {
  console.error('[shot] ' + e.message);
  process.exitCode = 1;
} finally {
  try {
    chrome.kill();
  } catch {
    /* gone */
  }
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}
