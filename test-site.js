const { chromium } = require('playwright');

const BASE = 'https://www.rgby.ai';

const ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/platform', name: 'Platform' },
  { path: '/sectors', name: 'Sectors' },
  { path: '/sectors/social-housing', name: 'Social Housing' },
  { path: '/sectors/maritime', name: 'Maritime' },
  { path: '/sectors/financial-services', name: 'Financial Services' },
  { path: '/sectors/defence', name: 'Defence' },
  { path: '/sectors/construction', name: 'Construction' },
  { path: '/sectors/energy', name: 'Energy' },
  { path: '/sectors/ai-governance', name: 'AI Governance' },
  { path: '/r-kid', name: 'R-KID' },
  { path: '/dewpoint', name: 'DewPoint' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
];

let pass = 0, fail = 0, warns = [];

function log(status, test, detail = '') {
  const icon = status === 'PASS' ? 'PASS' : status === 'FAIL' ? 'FAIL' : 'WARN';
  console.log(`  [${icon}] ${test}${detail ? ' -- ' + detail : ''}`);
  if (status === 'PASS') pass++;
  else if (status === 'FAIL') fail++;
  else warns.push(`${test}: ${detail}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  console.log('============================================');
  console.log('  RGBY.ai Full Site Test Suite');
  console.log('============================================\n');

  // 1. All routes return 200
  console.log('1. ROUTE AVAILABILITY');
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    try {
      const resp = await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      log(resp.status() === 200 ? 'PASS' : 'FAIL', `${r.name} (${r.path})`, `HTTP ${resp.status()}`);
    } catch (e) {
      log('FAIL', `${r.name} (${r.path})`, e.message.slice(0, 80));
    }
    await p.close();
  }

  // 2. Nav links on all pages
  console.log('\n2. NAV CONSISTENCY');
  const navHrefs = ['/platform', '/sectors', '/r-kid', '/dewpoint', '/about', '/contact'];
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const missing = [];
    for (const href of navHrefs) {
      const c = await p.locator(`nav a[href="${href}"]`).count();
      if (c === 0) missing.push(href);
    }
    log(missing.length === 0 ? 'PASS' : 'FAIL', `Nav on ${r.name}`, missing.length ? `Missing: ${missing.join(', ')}` : '');
    await p.close();
  }

  // 3. Footer on all pages
  console.log('\n3. FOOTER CONSISTENCY');
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const patent = await p.locator('text=A16626GB').count();
    const bham = await p.locator('text=Built in Birmingham').count();
    log(patent > 0 && bham > 0 ? 'PASS' : 'FAIL', `Footer on ${r.name}`, `Patent:${patent} Birmingham:${bham}`);
    await p.close();
  }

  // 4. "Request Briefing" in nav
  console.log('\n4. REQUEST BRIEFING CTA');
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const c = await p.locator('nav :text("Request Briefing")').count();
    log(c > 0 ? 'PASS' : 'FAIL', `"Request Briefing" on ${r.name}`);
    await p.close();
  }

  // 5. No "Join Waitlist"
  console.log('\n5. NO "JOIN WAITLIST"');
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const c = await p.locator('nav :text("Join Waitlist")').count();
    log(c === 0 ? 'PASS' : 'FAIL', `No "Join Waitlist" on ${r.name}`);
    await p.close();
  }

  // 6. Homepage checks
  console.log('\n6. HOMEPAGE CONTENT');
  const hp = await ctx.newPage();
  await hp.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });

  log(await hp.locator('text=Scroll to explore').count() === 0 ? 'PASS' : 'FAIL', 'No "Scroll to explore"');
  log(await hp.locator('.motif-strip').count() === 0 ? 'PASS' : 'FAIL', 'No motif ribbon');
  log(await hp.locator('#videoModal').count() > 0 ? 'PASS' : 'FAIL', 'Explainer video modal');
  log(await hp.locator('#rkidVideoModal').count() > 0 ? 'PASS' : 'FAIL', 'R-KID video modal');
  log(await hp.locator('#dataReadout').count() > 0 ? 'PASS' : 'FAIL', 'Data readout present');

  const scenes = await hp.locator('.scene').count();
  log(scenes >= 9 ? 'PASS' : 'FAIL', `Scroll scenes: ${scenes} (need 9)`);

  log(await hp.locator(':text("Talk to us")').count() > 0 ? 'PASS' : 'FAIL', '"Talk to us" CTA');
  log(await hp.locator('.stat-marquee-track').count() === 0 ? 'PASS' : 'FAIL', 'Old stat marquee removed');

  const sectorLinks = await hp.locator('a[href^="/sectors/"]').count();
  log(sectorLinks >= 7 ? 'PASS' : 'FAIL', `Sector links: ${sectorLinks} (need 7)`);

  // Check video sources
  const expSrc = await hp.locator('#explainerVideo source').getAttribute('src').catch(() => null);
  log(expSrc && expSrc.includes('explainer.mp4') ? 'PASS' : 'FAIL', 'Explainer video src', expSrc || 'missing');
  const rkidSrc = await hp.locator('#rkidVideo source').getAttribute('src').catch(() => null);
  log(rkidSrc && rkidSrc.includes('rkid-explainer.mp4') ? 'PASS' : 'FAIL', 'R-KID video src', rkidSrc || 'missing');

  await hp.close();

  // 7. DewPoint wording
  console.log('\n7. DEWPOINT EXACT WORDING');
  const dp = await ctx.newPage();
  await dp.goto(`${BASE}/dewpoint`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  log(await dp.locator('text=risk, causation, mitigation, and compliance').count() > 0 ? 'PASS' : 'FAIL', '"risk, causation, mitigation, and compliance"');
  log(await dp.locator('text=Not just detection').count() > 0 ? 'PASS' : 'FAIL', '"Not just detection"');
  log(await dp.locator('text=Not just reporting').count() > 0 ? 'PASS' : 'FAIL', '"Not just reporting"');
  log(await dp.locator('text=Coming soon').count() > 0 ? 'PASS' : 'FAIL', '"Coming soon" badge');
  log(await dp.locator('.dewpoint-micro-strip').count() > 0 ? 'PASS' : 'FAIL', 'Micro-strip present');
  log(await dp.locator('text=protects the resident').count() === 0 ? 'PASS' : 'FAIL', 'No old "protects the resident"');
  log(await dp.locator('text=protects the landlord').count() === 0 ? 'PASS' : 'FAIL', 'No old "protects the landlord"');
  await dp.close();

  // 8. R-KID page
  console.log('\n8. R-KID PAGE');
  const rk = await ctx.newPage();
  await rk.goto(`${BASE}/r-kid`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const pillars = await rk.locator('.rkid-pillar').count();
  log(pillars === 4 ? 'PASS' : 'FAIL', `R-KID pillars: ${pillars} (need 4)`);
  log(await rk.locator('.rkid-flow').count() > 0 ? 'PASS' : 'FAIL', 'Flow diagram present');
  log(await rk.locator('#rkidVideoBtn').count() > 0 ? 'PASS' : 'FAIL', 'Video button present');
  for (const name of ['Constraints', 'Knowledge', 'Inference', 'Detection']) {
    log(await rk.locator(`:text("${name}")`).count() > 0 ? 'PASS' : 'FAIL', `Pillar: ${name}`);
  }
  await rk.close();

  // 9. Contact form
  console.log('\n9. CONTACT FORM');
  const ct = await ctx.newPage();
  await ct.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  log(await ct.locator('#contactForm').count() > 0 ? 'PASS' : 'FAIL', 'Form present');
  log(await ct.locator('#contactName').count() > 0 ? 'PASS' : 'FAIL', 'Name field');
  log(await ct.locator('#contactEmail').count() > 0 ? 'PASS' : 'FAIL', 'Email field');
  log(await ct.locator('#contactSubject').count() > 0 ? 'PASS' : 'FAIL', 'Subject field');
  log(await ct.locator('#contactMessage').count() > 0 ? 'PASS' : 'FAIL', 'Message field');
  const typeButtons = await ct.locator('.contact-type-btn').count();
  log(typeButtons === 4 ? 'PASS' : 'FAIL', `Contact type buttons: ${typeButtons} (need 4)`);

  // Test type selector
  await ct.locator('.contact-type-btn:has-text("Pilot discussion")').click().catch(() => {});
  await ct.waitForTimeout(500);
  const subVal = await ct.locator('#contactSubject').inputValue().catch(() => '');
  log(subVal === 'Pilot discussion' ? 'PASS' : 'WARN', 'Type selector updates subject', `Got: "${subVal}"`);
  await ct.close();

  // 10. All internal links valid
  console.log('\n10. INTERNAL LINKS');
  const allLinks = new Set();
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const links = await p.locator('a[href^="/"]').evaluateAll(els => els.map(e => e.getAttribute('href')));
    links.forEach(l => { if (l && !l.includes('/api/')) allLinks.add(l); });
    await p.close();
  }
  console.log(`  Found ${allLinks.size} unique internal links`);
  for (const link of [...allLinks].sort()) {
    const p = await ctx.newPage();
    try {
      const resp = await p.goto(`${BASE}${link}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      log(resp.status() === 200 ? 'PASS' : 'FAIL', `${link}`, `HTTP ${resp.status()}`);
    } catch (e) {
      log('FAIL', `${link}`, e.message.slice(0, 60));
    }
    await p.close();
  }

  // 11. Video files accessible
  console.log('\n11. VIDEO FILES');
  for (const vid of ['/video/explainer.mp4', '/video/rkid-explainer.mp4']) {
    const p = await ctx.newPage();
    try {
      const resp = await p.goto(`${BASE}${vid}`, { waitUntil: 'commit', timeout: 10000 });
      log(resp.status() === 200 ? 'PASS' : 'FAIL', vid, `HTTP ${resp.status()}`);
    } catch (e) {
      log('FAIL', vid, e.message.slice(0, 60));
    }
    await p.close();
  }

  // 12. Mobile layout
  console.log('\n12. MOBILE LAYOUT');
  const mob = await browser.newContext({ viewport: { width: 375, height: 812 } });
  for (const r of [ROUTES[0], ROUTES[1], ROUTES[10], ROUTES[11], ROUTES[13]]) {
    const p = await mob.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    log(!overflow ? 'PASS' : 'WARN', `Mobile ${r.name}: no h-scroll`);
    log(await p.locator('.nav-mobile-toggle').count() > 0 ? 'PASS' : 'FAIL', `Mobile ${r.name}: nav toggle`);
    await p.close();
  }
  await mob.close();

  // 13. SEO meta tags
  console.log('\n13. SEO META TAGS');
  for (const r of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await p.title();
    const desc = await p.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    const og = await p.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    log(title && title.includes('RGBY') ? 'PASS' : 'FAIL', `${r.name} title`, `"${(title || '').slice(0, 50)}"`);
    log(desc && desc.length > 20 ? 'PASS' : 'FAIL', `${r.name} meta desc`, desc ? `${desc.length} chars` : 'MISSING');
    log(og ? 'PASS' : 'FAIL', `${r.name} og:title`);
    await p.close();
  }

  // 14. Lucide icons
  console.log('\n14. ICONS');
  const ip = await ctx.newPage();
  await ip.goto(`${BASE}/sectors`, { waitUntil: 'load', timeout: 15000 });
  await ip.waitForTimeout(2000);
  const svgs = await ip.locator('.sector-icon svg').count();
  log(svgs >= 7 ? 'PASS' : 'WARN', `Lucide icons on sectors: ${svgs}`);
  await ip.close();

  await browser.close();

  console.log('\n============================================');
  console.log(`  RESULTS: ${pass} PASSED | ${fail} FAILED | ${warns.length} WARNINGS`);
  console.log('============================================');
  if (warns.length) {
    console.log('\nWarnings:');
    warns.forEach(w => console.log(`  - ${w}`));
  }
  if (fail > 0) console.log('\n  ** FAILURES DETECTED — review above **');
  else console.log('\n  All tests passed!');

  process.exit(fail > 0 ? 1 : 0);
})();
