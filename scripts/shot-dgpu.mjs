// scripts/shot-dgpu.mjs — canonical dGPU capture (from prior agents' proven method).
// Provenance: /tmp/opencode/pwshot/shot.mjs (system builder: perf-p1 + dgpu gate),
//             /tmp/opencode/vegtest/shoot.mjs (vegetation owner: olive-p2),
//             /tmp/opencode/pwshot/multi.mjs (qibli owner Phase3a: batch upgrade — ADOPTED).
// Method: Playwright Chromium HEADED on DISPLAY=:1, renderD129 (NVIDIA), ANGLE/GL.
// Brave --headless segfaults (exit 139) — do NOT use headless. Firefox = fallback only.
// Usage (single):
//   python3 -m http.server 8099 &
//   node scripts/shot-dgpu.mjs "http://localhost:8099/index.html?nohud=1&view=0" shots/aerial.png
// Usage (batch, one browser — RAM-saver, from multi.mjs):
//   node scripts/shot-dgpu.mjs '[["http://localhost:8099/index.html?nohud=1&view=4","shots/qibi.png","sunset",5000]]'
// Custom framing: pass pos/tgt via URL-less mode:
//   node scripts/shot-dgpu.mjs "http://localhost:8099/index.html?nohud=1" shots/custom.png "[101,5,-78]" "[94.7,3.6,-85.7]"
import { chromium } from 'playwright-core';

const exe = '/home/hassenhamdi/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const browser = await chromium.launch({
  executablePath: exe,
  headless: false, // HEADED on DISPLAY=:1 — headless loses the dGPU path
  args: [
    '--render-node-override=/dev/dri/renderD129',
    '--ozone-platform=x11',
    '--use-gl=angle', '--use-angle=gl',
    '--disable-gpu-sandbox', '--no-sandbox',
    '--window-size=1280,800',
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push('[page.err] ' + m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('[page.exc] ' + String(e).slice(0, 200)));

async function shoot(url, out, preset, waitMs, pos, tgt) {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__scene && window.__scene.info, null, { timeout: 60000 });
  if (pos && tgt) {
    await page.evaluate(([p, t]) => window.__scene.flyTo(
      { x: p[0], y: p[1], z: p[2] }, { x: t[0], y: t[1], z: t[2] }, 0.3), [pos, tgt]);
  }
  await page.waitForFunction(() => {
    const i = window.__scene.info();
    return !i.fly.active && i.frames > 60;
  }, null, { timeout: 90000 });
  if (preset) {
    await page.evaluate((p) => window.__scene.preset(p), preset);
    await page.waitForTimeout(waitMs || 5000);
  }
  console.log('INFO:', JSON.stringify(await page.evaluate(() => window.__scene.info())));
  await page.screenshot({ path: out });
  console.log('SHOT_OK', out);
}

const a1 = process.argv[2];
if (!a1) { console.error('usage: node scripts/shot-dgpu.mjs <url|batchJson> [out] [posJson] [tgtJson]'); process.exit(1); }
if (a1.startsWith('[')) {
  // batch: [[url, out, preset|null, waitMs], ...]
  for (const [url, out, preset, waitMs] of JSON.parse(a1)) await shoot(url, out, preset, waitMs);
} else {
  const pos = process.argv[4] ? JSON.parse(process.argv[4]) : null;
  const tgt = process.argv[5] ? JSON.parse(process.argv[5]) : null;
  await shoot(a1, process.argv[3], null, 0, pos, tgt);
}
console.log('GL_RENDERER:', await page.evaluate(() => {
  const g = document.createElement('canvas').getContext('webgl2');
  const ext = g.getExtension('WEBGL_debug_renderer_info');
  return ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
}));
await browser.close();
console.log('ERRORS:', errors.length ? errors : 'none');
if (errors.length) process.exitCode = 2;
