import { chromium } from 'playwright';
const out = process.argv[2], tag = process.argv[3];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [n,w] of [['d',1440],['m',375]]) {
  const p = await b.newPage({ viewport:{width:w,height:1000} });
  await p.goto('http://localhost:4321/hospitalidad', { waitUntil:'networkidle', timeout:120000 });
  const el = await p.$('section[aria-label="Galería de gastronomía de Quepos"]');
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
  await el.screenshot({ path: `${out}/gc-${tag}-${n}.png` });
  await p.close();
}
await b.close();
