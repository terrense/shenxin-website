#!/usr/bin/env node
/**
 * Renders the site in a real browser and fails if the page is blank or if
 * content is stuck invisible.
 *
 * The build passing proves the code compiles, not that anyone can read the
 * result. A blank page — a script that 404s, a component that throws, an
 * entrance animation that never completes — produces a perfectly green build
 * and a white screen. This is the check that notices.
 *
 * Two deliberate details, both learned the hard way:
 *
 *   - It uses real wall-clock time, not Chrome's --virtual-time-budget.
 *     Virtual time can stall timer-driven animations, which made a working
 *     page look broken and sent an afternoon chasing a bug that did not
 *     exist.
 *
 *   - It scrolls the whole page before measuring. Scroll-triggered reveals
 *     are legitimately at opacity 0 until they enter the viewport, so
 *     measuring without scrolling reports every section below the fold as
 *     broken.
 *
 * Needs Chrome installed; no npm dependencies (Node 22+ has a global
 * WebSocket). Skips cleanly if Chrome is absent so it never blocks CI.
 *
 *   npm run preview &            # or: npm run dev
 *   npm run check:render
 *   npm run check:render -- http://localhost:4173/projects/vla-lab
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.log('[render] Chrome not found — skipping.');
  process.exit(0);
}

const url = process.argv[2] ?? 'http://localhost:5173/';
/**
 * A page with less text than this never really rendered.
 *
 * Deliberately low. The failure being caught is a blank page — a script that
 * 404s or a component that throws leaves single digits of text, not
 * hundreds. Set high enough to also flag "thin" pages and it starts failing
 * on the map and the hall, which are mostly picture by design and come in
 * around 350–400 characters. A smoke test that cries wolf on healthy pages
 * gets ignored, and then it catches nothing.
 */
const MIN_TEXT = 150;
/** Allow one: RotatingText keeps an outgoing span mid-transition. */
const MAX_INVISIBLE = 2;

const PORT = 9333 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), 'render-check-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,1200',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = false;

function finish(code) {
  try {
    chrome.kill();
  } catch {
    /* already gone */
  }
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}

try {
  let page;
  for (let i = 0; i < 40 && !page; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      page = list.find((t) => t.type === 'page');
    } catch {
      /* not up yet */
    }
    if (!page) await sleep(250);
  }
  if (!page) throw new Error('Chrome did not expose a debugging target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const myId = ++id;
      pending.set(myId, resolve);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

  const consoleErrors = [];
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Log.entryAdded' && msg.params?.entry?.level === 'error') {
      consoleErrors.push(msg.params.entry.text);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params?.exceptionDetails?.text ?? 'uncaught exception');
    }
  });

  await send('Page.navigate', { url });
  await sleep(4000);

  // Walk the page so scroll-triggered reveals actually trigger.
  await send('Runtime.evaluate', {
    expression: `(async () => {
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise(r => setTimeout(r, 240));
      }
      scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 500));
    })()`,
    awaitPromise: true,
  });
  await sleep(1000);

  const expression = `(() => {
    const invisible = [...document.querySelectorAll('body *')].filter(el => {
      if (parseFloat(getComputedStyle(el).opacity) > 0.01) return false;
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4 && (el.textContent || '').trim().length > 0;
    });
    return JSON.stringify({
      text: document.body.innerText.trim().length,
      invisible: invisible.length,
      samples: invisible.slice(0, 5).map(el =>
        el.tagName.toLowerCase() + ' :: ' + (el.textContent || '').trim().slice(0, 50)),
    });
  })()`;

  const { result } = await send('Runtime.evaluate', { expression, returnByValue: true });
  const report = JSON.parse(result.result.value);

  console.log(`[render] ${url}`);
  console.log(`  rendered text   : ${report.text} chars`);
  console.log(`  invisible nodes : ${report.invisible}`);

  if (report.text < MIN_TEXT) {
    console.error(`\n  FAIL: page rendered almost no text (< ${MIN_TEXT} chars).`);
    failed = true;
  }
  if (report.invisible > MAX_INVISIBLE) {
    console.error(`\n  FAIL: ${report.invisible} element(s) stuck invisible:`);
    for (const s of report.samples) console.error(`    ${s}`);
    failed = true;
  }
  if (consoleErrors.length) {
    console.error(`\n  FAIL: ${consoleErrors.length} console error(s):`);
    for (const e of consoleErrors.slice(0, 5)) console.error(`    ${e.slice(0, 160)}`);
    failed = true;
  }

  if (!failed) console.log('\n[render] OK — page renders and nothing is stranded invisible.');
} catch (error) {
  console.error('[render] could not complete:', error.message);
  failed = true;
}

finish(failed ? 1 : 0);
