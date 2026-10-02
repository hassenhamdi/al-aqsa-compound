import { chromium } from 'playwright-core';
const exe = '/home/hassenhamdi/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: exe, headless: false,
  args: ['--render-node-override=/dev/dri/renderD129','--ozone-platform=x11','--use-gl=angle','--use-angle=gl','--disable-gpu-sandbox','--no-sandbox','--window-size=1280,800'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => console.log('[page.exc]', String(e).slice(0,160)));
await page.goto('http://localhost:8098/open-tree.html#oak', { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const l=document.getElementById('load'); return l && getComputedStyle(l).opacity==='0'; }, null, { timeout: 90000 }).catch(()=>console.log('settle-timeout'));
await page.waitForTimeout(4000);
await page.evaluate(() => { document.getElementById('ui')?.classList.add('hidden'); document.getElementById('tgl')?.style.setProperty('display', 'none'); });
await page.waitForTimeout(400);
await page.screenshot({ path: '/home/hassenhamdi/al-aqsa-compound/references/trees/oak-open-tree.png' });
console.log('SHOT_OK');
await browser.close();
