// scripts/make-video.mjs — headless video from a freecam trajectory.
// Usage: node scripts/make-video.mjs [traj.json] | [--tour]
// No arg: built-in 8 s dGPU flyover. traj.json: photo-mode V export.
// --tour: in-page build_tour_traj() — all 12 guided-tour stops, 3 s dwell +
// 2.5 s aerial transitions → docs/al-aqsa-tour.mp4 (+ GIF, 12-stop sheet).
// Method: canonical headed-Chromium dGPU path (same flags as shot-dgpu.mjs),
// __free.load_traj + step_frame(i) + page.screenshot per frame @30fps,
// then ffmpeg → mp4 + gif + contact sheet. Frames in docs/.frames-tmp
// (removed after encode). Needs ffmpeg on PATH.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const FPS = 30;
const FRAMES = 'docs/.frames-tmp';
const TOUR = process.argv.includes('--tour');
const MP4 = TOUR ? 'docs/al-aqsa-tour.mp4' : 'docs/al-aqsa-flyover.mp4';
const GIF = TOUR ? 'docs/al-aqsa-tour.gif' : 'docs/al-aqsa-flyover.gif';
const SHEET = TOUR ? 'docs/w3-tour-sheet.png' : 'docs/w3-video-sheet.png';

const DEFAULT_TRAJ = {
  dur: 8, fps: FPS,
  keys: [
    { t: 0, pos: [230, 150, 270], tgt: [0, 8, 20] },
    { t: 2, pos: [110, 60, 120], tgt: [0, 14, -30] },
    { t: 4, pos: [40, 16, -5], tgt: [0, 14, -70] },
    { t: 6, pos: [-30, 12, 80], tgt: [0, 8, 140] },
    { t: 8, pos: [95, 26, 150], tgt: [20, 4, 120] },
  ],
};

const jsonArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const traj = TOUR ? null : (jsonArg
  ? JSON.parse(readFileSync(jsonArg, 'utf8'))
  : DEFAULT_TRAJ);

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

await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.__scene && window.__scene.info && window.__free, null, { timeout: 60000 });
await page.waitForFunction(() => {
  const i = window.__scene.info();
  return !i.fly.active && i.frames > 60;
}, null, { timeout: 90000 });

const boot = TOUR
  ? await page.evaluate(() => {
      window.__free.enter();
      const T = window.__free.build_tour_traj(3, 2.5, 30);
      if (!T) return null;
      window.__free.load_traj(T.traj);
      return { dur: T.traj.dur, stops: T.stops };
    })
  : await page.evaluate((t) => {
      window.__free.enter();
      return window.__free.load_traj(t) ? { dur: t.dur || 8, stops: null } : null;
    }, traj);
if (!boot) { console.error('TRAJ_REJECTED'); await browser.close(); process.exit(1); }
const N = Math.round(boot.dur * FPS);
if (TOUR) {
  console.log('STOPS:', boot.stops.map((s) => `${s.n}.${s.title}@f${s.frame}`).join(' | '));
  writeFileSync('docs/al-aqsa-tour-stops.json', JSON.stringify(boot.stops, null, 1));
}

mkdirSync(FRAMES, { recursive: true });
for (let i = 0; i < N; i++) {
  await page.evaluate(([k, f]) => window.__free.step_frame(k, f), [i, FPS]);
  await page.waitForTimeout(30);
  await page.screenshot({ path: `${FRAMES}/f${String(i).padStart(4, '0')}.png` });
  if (i % 60 === 0) console.log(`frame ${i}/${N}`);
}
console.log('FRAMES_OK', N);

const ff = (args) => execFileSync('ffmpeg', ['-y', ...args], { stdio: 'pipe' });
ff(['-framerate', String(FPS), '-i', `${FRAMES}/f%04d.png`,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', MP4]);
console.log('MP4_OK', MP4);
ff(['-i', MP4, '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', GIF]);
console.log('GIF_OK', GIF);
const picks = TOUR && boot.stops
  ? boot.stops.map((s) => s.frame)
  : [0, Math.floor(N / 4), Math.floor(N / 2), Math.floor(3 * N / 4), N - 1];
const tile = TOUR ? 'tile=4x3' : 'tile=5x1';
const swidth = TOUR ? 480 : 640;
ff(['-i', MP4, '-vf', `select='${picks.map((n) => `eq(n\\,${n})`).join('+')}',scale=${swidth}:-1,${tile}`, '-frames:v', '1', SHEET]);
console.log('SHEET_OK', SHEET);
rmSync(FRAMES, { recursive: true, force: true });

console.log('GL_RENDERER:', await page.evaluate(() => {
  const g = document.createElement('canvas').getContext('webgl2');
  const ext = g.getExtension('WEBGL_debug_renderer_info');
  return ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
}));
await browser.close();
console.log('ERRORS:', errors.length ? errors : 'none');
if (errors.length) process.exitCode = 2;
