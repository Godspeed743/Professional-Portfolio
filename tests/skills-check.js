// Usage: node tests/skills-check.js http://localhost:8080
// Verifies the Skills section: 9 categories, markup wiring, icons, layout at every width, mobile accordion, visibility, JSON-LD, chatbot text.
// Needs: playwright (npm i -D playwright) and a local server running. Font Awesome must load (internet on).
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8080';
const EXPECTED = ['Core Languages', 'Data Science & ML', 'Web Development', 'Software Development', 'App Development', 'Tools & Platforms', 'Vibe Coding', 'Digital Marketing', 'Video Editing'];
const SIZES = [[320, 640], [360, 740], [390, 844], [430, 932], [600, 900], [639, 900], [640, 900], [768, 1024], [820, 1180], [1023, 768], [1024, 768], [1280, 800], [1440, 900], [844, 390]];
(async () => {
  const browser = await chromium.launch();
  let fails = 0, warned = false;
  const out = (bad, label, msgs) => { if (bad) fails++; console.log(`${bad ? 'FAIL' : 'ok  '} ${label} ${msgs.join('; ')}`); };
  for (const scheme of ['dark', 'light']) {
    for (const [w, h] of SIZES) {
      if (scheme === 'light' && ![390, 820, 1440].includes(w)) continue;
      const touch = w < 1100;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: touch, isMobile: touch });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|api\.github/.test(m.text())) errors.push(m.text()); });
      await page.route(/api\.github\.com/, r => r.abort());
      await page.goto(BASE + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      const problems = [];
      // ---- structure (same at every width, reported once per width) ----
      const s = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.skills-grid > .skill-category')];
        const titles = cards.map(c => c.querySelector('h3').textContent.trim().replace(/\s+/g, ' '));
        const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
        const dupIds = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
        const bad = [];
        cards.forEach(c => {
          const t = c.querySelector('.skill-category-toggle'), name = c.querySelector('h3').textContent.trim();
          const items = t && document.getElementById(t.getAttribute('aria-controls'));
          if (!t) bad.push(name + ': no toggle button');
          else if (!items) bad.push(name + ': aria-controls points to nothing');
          else if (!c.contains(items)) bad.push(name + ': aria-controls points outside the card');
          const list = [...c.querySelectorAll('.skill-item')];
          if (list.length < 4) bad.push(name + ': only ' + list.length + ' items');
          const labels = list.map(i => i.querySelector('span')?.textContent.trim().toLowerCase());
          if (labels.some(l => !l)) bad.push(name + ': an item has no label');
          if (new Set(labels).size !== labels.length) bad.push(name + ': duplicate item label');
          list.forEach(i => { const ic = i.querySelector('i.skill-icon'); if (!ic || !/\bfa-(solid|brands|regular)\b/.test(ic.className) || !/\bfa-[a-z0-9-]+\b/.test(ic.className.replace(/fa-(solid|brands|regular)|skill-icon/g, ''))) bad.push(name + ': bad icon markup on ' + i.textContent.trim()); });
        });
        // glyph check (only when Font Awesome CSS really loaded)
        const probe = document.createElement('i'); probe.className = 'fa-solid fa-code'; document.body.appendChild(probe);
        const faLoaded = !['none', 'normal', ''].includes(getComputedStyle(probe, '::before').content); probe.remove();
        const noGlyph = faLoaded ? [...document.querySelectorAll('.skills-grid .skill-icon')].filter(e => ['none', 'normal', '""', ''].includes(getComputedStyle(e, '::before').content)).map(e => e.className.replace('skill-icon', '').trim() + ' (' + e.nextElementSibling.textContent.trim() + ')') : null;
        let ld = 'ok';
        document.querySelectorAll('script[type="application/ld+json"]').forEach(x => { try { JSON.parse(x.textContent); } catch (e) { ld = 'invalid JSON-LD: ' + e.message; } });
        const kb = window.chatbotKnowledgeBase && window.chatbotKnowledgeBase.categories && window.chatbotKnowledgeBase.categories.skills;
        const kbText = kb ? (kb.responses || []).join(' ').toLowerCase() : '';
        return { titles, dupIds, bad, noGlyph, faLoaded, ld, kbText };
      });
      if (JSON.stringify(s.titles) !== JSON.stringify(EXPECTED)) problems.push('categories are [' + s.titles.join(' | ') + ']');
      if (s.dupIds.length) problems.push('duplicate ids: ' + s.dupIds.join(','));
      problems.push(...s.bad);
      if (s.noGlyph && s.noGlyph.length) problems.push('icons that do not exist in this Font Awesome build: ' + s.noGlyph.join(', '));
      if (!s.faLoaded && !warned) { console.log('WARN Font Awesome did not load (offline?) - icon existence check skipped'); warned = true; }
      if (s.ld !== 'ok') problems.push(s.ld);
      for (const word of ['marketing', 'video', 'vibe', 'app', 'software']) if (!s.kbText.includes(word)) problems.push('chatbot skills answer does not mention "' + word + '"');
      // ---- layout ----
      const L = await page.evaluate(() => {
        const g = document.querySelector('.skills-grid'), cards = [...g.children];
        const r = cards.map(c => c.getBoundingClientRect()), gr = g.getBoundingClientRect();
        const lefts = [...new Set(r.slice(0, -1).map(b => Math.round(b.left / 3)))]; // last card excluded: it may be centred on 2-column layouts
        const rows = [...new Set(r.map(b => Math.round(b.top / 6)))].length;
        const last = r[r.length - 1];
        const lastRowCount = r.filter(b => Math.abs(b.top - last.top) < 6).length;
        return { cols: lefts.length, rows, lastRowCount, lastCenterOff: (last.left + last.width / 2) - (gr.left + gr.width / 2), lastW: last.width, firstW: r[0].width,
                 over: document.documentElement.scrollWidth - innerWidth, outside: r.filter(b => b.left < -1 || b.right > innerWidth + 1).length };
      });
      const wantCols = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
      if (L.cols !== wantCols) problems.push(`${L.cols} columns, expected ${wantCols}`);
      if (wantCols === 3 && L.lastRowCount !== 3) problems.push(`last row has ${L.lastRowCount} card(s) (orphan)`);
      if (wantCols === 2 && (Math.abs(L.lastCenterOff) > 3 || Math.abs(L.lastW - L.firstW) > 3)) problems.push(`last card not centred/same width (off ${L.lastCenterOff.toFixed(0)}px, width ${L.lastW.toFixed(0)} vs ${L.firstW.toFixed(0)})`);
      if (L.over > 0) problems.push('horizontal scroll +' + L.over + 'px');
      if (L.outside) problems.push(L.outside + ' card(s) cut off by the screen edge');
      // ---- accordion (phones) / always open (wider) ----
      const acc = await page.evaluate(() => [...document.querySelectorAll('.skill-category-toggle')].map(t => { const it = document.getElementById(t.getAttribute('aria-controls')); return { exp: t.getAttribute('aria-expanded'), hidden: !it || it.hidden || getComputedStyle(it).display === 'none', h: t.getBoundingClientRect().height }; }));
      if (w < 600) {
        if (acc.some(a => !a.hidden || a.exp !== 'false')) problems.push('accordion: all cards should start collapsed on phones');
        if (acc.some(a => a.h < 44)) problems.push('accordion: a toggle is shorter than 44px');
        const t = page.locator('.skill-category-toggle').last();
        await t.scrollIntoViewIfNeeded(); await t.tap(); await page.waitForTimeout(500);
        const open = await page.evaluate(() => { const tt = document.querySelectorAll('.skill-category-toggle'), t = tt[tt.length - 1], it = document.getElementById(t.getAttribute('aria-controls')); return { exp: t.getAttribute('aria-expanded'), vis: !it.hidden && getComputedStyle(it).display !== 'none', op: [...it.querySelectorAll('.skill-item')].map(i => parseFloat(getComputedStyle(i).opacity)) }; });
        if (open.exp !== 'true' || !open.vis) problems.push('accordion: tapping the last card did not open it');
        if (open.op.some(o => o < 0.99)) problems.push('accordion: items of the opened card stay invisible');
        await t.tap(); await page.waitForTimeout(300);
        const closed = await page.evaluate(() => { const tt = document.querySelectorAll('.skill-category-toggle'); return document.getElementById(tt[tt.length - 1].getAttribute('aria-controls')).hidden; });
        if (!closed) problems.push('accordion: tapping again did not collapse it');
      } else if (acc.some(a => a.hidden || a.exp !== 'true')) problems.push('cards should all be open at this width');
      // ---- visibility after scrolling to the section (reveal + stagger animations) ----
      await page.evaluate(() => { const el = document.querySelector('#skills'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); });
      await page.waitForTimeout(1800);
      const v = await page.evaluate(() => ({ sec: parseFloat(getComputedStyle(document.querySelector('#skills')).opacity), items: [...document.querySelectorAll('#skills .skill-item')].filter(i => i.offsetParent !== null).map(i => parseFloat(getComputedStyle(i).opacity)) }));
      if (v.sec < 0.99) problems.push('Skills section stays invisible after scrolling to it (opacity ' + v.sec + ')');
      if (v.items.some(o => o < 0.99)) problems.push(v.items.filter(o => o < 0.99).length + ' skill item(s) stay invisible after scrolling to the section');
      if (errors.length) problems.push('console errors: ' + errors.slice(0, 2).join(' | '));
      out(problems.length > 0, `${scheme.padEnd(5)} ${w}x${h}`, problems.length ? [...new Set(problems)].slice(0, 6) : [`${L.cols} col x ${L.rows} rows, 9 cards`]);
      await ctx.close();
    }
  }
  await browser.close();
  console.log(fails ? `\n${fails} failing width(s)` : '\nAll skills checks passed');
  process.exit(fails ? 1 : 0);
})();
