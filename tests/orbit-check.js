// Usage: node tests/orbit-check.js http://localhost:8080
// Measures where the hero skill icons really sit compared with the hero photo.
// Needs: playwright (npm i -D playwright) and a local server running.
// Run with OFFLINE=1 only if you have no internet (gives empty icons a size).
// If the page uses different class names, edit ONLY the SEL object below (not the website).
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8080';
const SEL = {
  frame: ['.hero-photo', '.hero-image-container'],   // the photo frame (first match wins)
  icons: '.hero-skill-float',                        // every orbiting icon
};
const CASES = [
  ['hover', 1440, 900], ['hover', 1280, 800],
  ['tap', 1024, 768], ['tap', 820, 1180], ['tap', 768, 1024],
  ['tap', 430, 932], ['tap', 390, 844], ['tap', 360, 740], ['tap', 320, 640],
];
const MAX_SPREAD = 10;   // allowed difference (px) between the closest and farthest icon from the photo edge
const MAX_GAP = 70;      // icons must hug the photo border: centre no further than this from the edge
(async () => {
  const browser = await chromium.launch();
  let fails = 0;
  for (const [mode, w, h] of CASES) {
    const touch = mode === 'tap';
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.route(/api\.github\.com/, r => r.abort());   // Font Awesome must load, so do NOT block the CDNs
    if (process.env.OFFLINE) await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '.hero-skill-float{min-width:30px;min-height:30px}'; document.head.appendChild(s); }); });
    await page.goto(BASE + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(2200);
    await page.evaluate(() => window.scrollTo(0, 0));
    const frameSel = await page.evaluate(s => s.find(x => document.querySelector(x)), SEL.frame);
    if (!frameSel) { console.log(`FAIL ${mode} ${w}x${h}  frame selector not found: edit SEL.frame`); fails++; await ctx.close(); continue; }
    const box = await page.locator(frameSel).first().boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    if (mode === 'hover') { await page.mouse.move(cx - 30, cy - 30); await page.mouse.move(cx, cy, { steps: 6 }); }
    else { await page.touchscreen.tap(cx, cy); }
    await page.waitForTimeout(1500);
    for (const phase of ['top', 'scrolled']) {
      if (phase === 'scrolled') { await page.evaluate(() => window.scrollBy(0, 120)); await page.waitForTimeout(500); }
      const m = await page.evaluate(({ frameSel, iconSel }) => {
        const frame = document.querySelector(frameSel);
        const fr = frame.getBoundingClientRect();
        const cs = getComputedStyle(frame);
        let r = parseFloat(cs.borderTopLeftRadius) || 0;
        if (cs.borderTopLeftRadius.includes('%')) r = r / 100 * Math.min(fr.width, fr.height);
        r = Math.min(r, fr.width / 2, fr.height / 2);
        const all = [...document.querySelectorAll(iconSel)];
        const vis = all.filter(el => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.8 && b.width > 0; });
        const dist = p => { // distance from point to the rounded photo (negative = inside)
          const ix0 = fr.left + r, ix1 = fr.right - r, iy0 = fr.top + r, iy1 = fr.bottom - r;
          const dx = Math.max(ix0 - p.x, 0, p.x - ix1), dy = Math.max(iy0 - p.y, 0, p.y - iy1);
          if (dx === 0 && dy === 0) return -Math.min(p.x - fr.left, fr.right - p.x, p.y - fr.top, fr.bottom - p.y);
          return Math.hypot(dx, dy) - r;
        };
        const pts = vis.map(el => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, half: b.width / 2, left: b.left, right: b.right }; });
        const d = pts.map(dist);
        const bx0 = Math.min(...pts.map(p => p.x)), bx1 = Math.max(...pts.map(p => p.x)), by0 = Math.min(...pts.map(p => p.y)), by1 = Math.max(...pts.map(p => p.y));
        return { total: all.length, visible: vis.length, dmin: Math.min(...d), dmax: Math.max(...d), inside: d.filter((v, i) => v < pts[i].half).length,
                 offX: (bx0 + bx1) / 2 - (fr.left + fr.width / 2), offY: (by0 + by1) / 2 - (fr.top + fr.height / 2),
                 outside: pts.filter(p => p.left < -1 || p.right > innerWidth + 1).length, aspect: fr.width / fr.height };
      }, { frameSel, iconSel: SEL.icons });
      const problems = [];
      if (m.visible < m.total) problems.push(`only ${m.visible}/${m.total} icons visible`);
      if (m.inside) problems.push(`${m.inside} icon(s) overlap the photo`);
      if (m.dmax - m.dmin > MAX_SPREAD) problems.push(`uneven distance from photo edge (${m.dmin.toFixed(0)}..${m.dmax.toFixed(0)}px)`);
      if (m.dmax > MAX_GAP) problems.push(`icons too far from the photo (max ${m.dmax.toFixed(0)}px)`);
      if (Math.abs(m.offX) > 12 || Math.abs(m.offY) > 12) problems.push(`ring centre is off by (${m.offX.toFixed(0)}, ${m.offY.toFixed(0)})px`);
      if (m.outside) problems.push(`${m.outside} icon(s) cut off by the screen edge`);
      if (problems.length) fails++;
      console.log(`${problems.length ? 'FAIL' : 'ok  '} ${mode.padEnd(5)} ${w}x${h} ${phase.padEnd(8)} icons ${m.visible}/${m.total}  gap ${m.dmin.toFixed(0)}..${m.dmax.toFixed(0)}px  ${problems.join('; ')}`);
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} failing check(s)` : '\nAll orbit checks passed');
  process.exit(fails ? 1 : 0);
})();
