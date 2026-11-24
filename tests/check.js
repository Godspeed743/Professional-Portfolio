// Usage: node tests/check.js http://localhost:8080
// Needs: playwright installed (npm i -D playwright) and a local server running.
import { chromium } from '@playwright/test';
const BASE = process.argv[2] || 'http://localhost:8080';
const SIZES = [[320,640],[360,740],[390,844],[430,932],[600,900],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[844,390]];
(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  for (const scheme of ['dark', 'light']) {
    for (const [w, h] of SIZES) {
      const touch = w < 1100;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: touch, isMobile: touch });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|api\.github/.test(m.text())) errors.push(m.text()); });
      await page.route(/fonts\.(googleapis|gstatic)|cdnjs|api\.github\.com/, r => r.abort());
      await page.goto(BASE + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      // open every "View details" button, then look for TODO text
      await page.evaluate(() => document.querySelectorAll('button').forEach(b => { if (/details/i.test(b.textContent)) b.click(); }));
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const text = document.body.innerText;
        const todo = /TODO|lorem ipsum/i.test(text);
        const hb = document.querySelector('.hero-buttons');
        const tg = document.querySelector('.chatbot-toggle, #chatbot-toggle, .chatbot-btn');
        let overlap = false;
        if (hb && tg) { const a = hb.getBoundingClientRect(), b = tg.getBoundingClientRect(), vis = getComputedStyle(tg).visibility !== 'hidden' && getComputedStyle(tg).opacity !== '0' && getComputedStyle(tg).display !== 'none';
          overlap = vis && a.bottom > 0 && a.top < innerHeight && !(b.right < a.left || b.left > a.right || b.bottom < a.top || b.top > a.bottom); }
        return { scrollW: document.documentElement.scrollWidth, vw, todo, overlap };
      });
      const problems = [];
      if (r.scrollW > r.vw) problems.push(`horizontal scroll (${r.scrollW}>${r.vw})`);
      if (r.todo) problems.push('visible TODO/placeholder text');
      if (r.overlap) problems.push('chatbot toggle overlaps hero buttons');
      if (errors.length) problems.push('console errors: ' + errors.slice(0, 2).join(' | '));
      console.log(`${problems.length ? 'FAIL' : 'ok  '} ${scheme} ${w}x${h} ${problems.join('; ')}`);
      failures += problems.length;
      await ctx.close();
    }
  }
  await browser.close();
  console.log(failures ? `\n${failures} problem(s) found` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
