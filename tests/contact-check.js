// Usage: node tests/contact-check.js http://localhost:8080
// Tests the contact form against a FAKE Web3Forms server (no real email is sent, no internet needed for the form).
// Needs: playwright (npm i -D playwright) and a local server running.
import { chromium } from '@playwright/test';
const BASE = process.argv[2] || 'http://localhost:8080';
const ENDPOINT = 'https://api.web3forms.com/submit';
const DATA = { name: 'Test Visitor', email: 'visitor@example.com', subject: 'Hello there', message: 'This is a test message from the automated check.' };
(async () => {
  const browser = await chromium.launch();
  let fails = 0;
  const report = (label, problems) => { if (problems.length) fails++; console.log(`${problems.length ? 'FAIL' : 'ok  '} ${label} ${problems.join('; ')}`); };
  for (const [w, h, touch] of [[1440, 900, false], [390, 844, true]]) {
    const tag = `${w}x${h}`;
    const open = async () => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: 'dark' });
      const page = await ctx.newPage();
      const errors = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|Form service rejected|Contact form submission failed|api\.github/.test(m.text())) errors.push(m.text()); });
      await page.route(/api\.github\.com/, r => r.abort());
      await page.goto(BASE + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      return { ctx, page, errors, requests };
    };
    const fill = async page => { for (const [k, v] of Object.entries(DATA)) await page.fill('#' + k, v); };
    const submit = async page => { const b = page.locator('#contact-form button[type=submit]'); await b.scrollIntoViewIfNeeded(); touch ? await b.tap() : await b.click(); };

    // ---- 1. static wiring ----
    { const { ctx, page } = await open(); const p = [];
      const s = await page.evaluate(() => { const f = document.getElementById('contact-form'); const k = f.querySelector('input[name="access_key"]'); const bc = f.querySelector('input[name="botcheck"]');
        return { action: f.action, method: f.method, key: k && k.value, keyType: k && k.type, botType: bc && bc.type, botHidden: bc ? getComputedStyle(bc.closest('.honeypot') || bc).position + '|' + getComputedStyle(bc.closest('.honeypot') || bc).left : null, oldHoney: !!f.querySelector('[name="website"]') }; });
      if (s.action !== ENDPOINT) p.push(`form action is "${s.action}", expected ${ENDPOINT}`);
      if (!s.key) p.push('hidden input access_key is missing');
      else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.key)) p.push(`access key "${s.key}" is not a real key (still a placeholder?)`);
      if (s.keyType !== 'hidden') p.push('access_key input must be type=hidden');
      if (s.botType !== 'checkbox') p.push('botcheck checkbox is missing');
      if (s.oldHoney) p.push('old "website" honeypot field is still in the form');
      // 404 (static/dev server) or 403 (Vercel blocks all *.php) are both fine; fail only if the file is served.
      const r = await page.request.get(BASE + '/contact.php'); const rBody = await r.text(); if (r.status() === 200 || rBody.includes('<?php')) p.push(`/contact.php still exists (HTTP ${r.status()}); Vercel would serve its source code`);
      report(`${tag} wiring`, p); await ctx.close(); }

    // ---- 2. success ----
    { const { ctx, page, errors, requests } = await open(); const p = [];
      await page.route(ENDPOINT, async route => { requests.push(route.request()); await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ success: true, body: { message: 'Email sent successfully!' } }) }); });
      await fill(page); await submit(page); await page.waitForTimeout(1200);
      if (requests.length !== 1) p.push(`${requests.length} request(s) sent, expected 1`);
      else { const rq = requests[0]; const ct = rq.headers()['content-type'] || ''; let body = {}; try { body = JSON.parse(rq.postData()); } catch (e) { p.push('request body is not JSON'); }
        if (rq.method() !== 'POST') p.push('not a POST'); if (!/json/.test(ct)) p.push('content-type is ' + ct);
        for (const k of ['access_key', 'name', 'email', 'subject', 'message']) if (!body[k]) p.push('payload is missing ' + k);
        if (body.name !== DATA.name || body.message !== DATA.message) p.push('payload values do not match what was typed');
        if ('website' in body || 'botcheck' in body) p.push('payload must not contain website/botcheck'); }
      const ui = await page.evaluate(() => ({ toast: document.getElementById('contact-toast').textContent, vis: document.getElementById('contact-toast').classList.contains('visible'), vals: ['name', 'email', 'subject', 'message'].map(i => document.getElementById(i).value), dis: document.querySelector('#contact-form button[type=submit]').disabled }));
      if (!ui.vis || !/sent|thank/i.test(ui.toast)) p.push(`no success toast (text "${ui.toast}")`);
      if (ui.vals.some(v => v)) p.push('fields were not cleared after success');
      if (ui.dis) p.push('submit button stays disabled');
      if (errors.length) p.push('console errors: ' + errors.join(' | '));
      report(`${tag} success flow`, p); await ctx.close(); }

    // ---- 3. service rejects (HTTP 400) ----
    { const { ctx, page, errors } = await open(); const p = [];
      await page.route(ENDPOINT, r => r.fulfill({ status: 400, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ success: false, message: 'Invalid access key' }) }));
      await fill(page); await submit(page); await page.waitForTimeout(1000);
      const ui = await page.evaluate(() => ({ st: document.getElementById('form-status').textContent, cls: document.getElementById('form-status').className, msg: document.getElementById('message').value, dis: document.querySelector('#contact-form button[type=submit]').disabled }));
      if (!/error/.test(ui.cls) || !ui.st) p.push('no visible error message after a rejected submission');
      if (/access key/i.test(ui.st)) p.push('technical error text ("access key") is shown to visitors');
      if (ui.msg !== DATA.message) p.push("the visitor's message was erased after a failed send");
      if (ui.dis) p.push('submit button stays disabled after an error');
      if (errors.length) p.push('console errors: ' + errors.join(' | '));
      report(`${tag} service error`, p); await ctx.close(); }

    // ---- 4. network down ----
    { const { ctx, page } = await open(); const p = [];
      await page.route(ENDPOINT, r => r.abort('failed'));
      await fill(page); await submit(page); await page.waitForTimeout(1000);
      const ui = await page.evaluate(() => ({ st: document.getElementById('form-status').textContent, cls: document.getElementById('form-status').className, msg: document.getElementById('message').value }));
      if (!/error/.test(ui.cls) || !ui.st) p.push('no error message when the network fails');
      if (ui.msg !== DATA.message) p.push("the visitor's message was erased after a network failure");
      report(`${tag} network failure`, p); await ctx.close(); }

    // ---- 5. bot trap ----
    { const { ctx, page, requests } = await open(); const p = [];
      await page.route(ENDPOINT, r => { requests.push(1); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"success":true}' }); });
      await fill(page); const hasTrap = await page.evaluate(() => { const b = document.querySelector('[name="botcheck"]'); if (b) b.checked = true; return !!b; });
      if (!hasTrap) p.push('botcheck checkbox is missing, cannot test the bot trap');
      else { await submit(page); await page.waitForTimeout(800); if (requests.length) p.push('a request was sent although the bot trap was ticked'); }
      report(`${tag} bot trap`, p); await ctx.close(); }

    // ---- 6. validation ----
    { const { ctx, page, requests } = await open(); const p = [];
      await page.route(ENDPOINT, r => { requests.push(1); r.abort(); });
      await submit(page); await page.waitForTimeout(500);
      if (requests.length) p.push('an empty form was sent');
      const errs = await page.evaluate(() => [...document.querySelectorAll('.field-error')].filter(e => e.textContent.trim()).length);
      if (errs < 4) p.push(`only ${errs} field error message(s) shown for an empty form`);
      report(`${tag} validation`, p); await ctx.close(); }
  }
  await browser.close();
  console.log(fails ? `\n${fails} failing check(s)` : '\nAll contact form checks passed');
  process.exit(fails ? 1 : 0);
})();
