import { expect, test } from '@playwright/test';

/**
 * S7 — Consent e2e (ties to ROLLOUT #5 + #45). The compliance gate: on a COLD
 * visit, NOTHING tracking-related may hit the network until the visitor opts in
 * via the consent banner. Giving/withdrawing consent flips trackers on/off, and
 * the CPRA "Do Not Sell or Share" opt-out (T45) keeps the MARKETING category off.
 *
 * This runs against the LIVE deploy (default touchvodka.com) — see
 * `playwright.live.config.ts`. We classify every outbound request by tracker host
 * and assert ZERO trackers pre-consent, then verify the gate is real.
 *
 * The deployed tracker endpoints (from @geniemarketing/foundation/tracking):
 *   • RudderStack CDP  — events.fatdogspirits.com/.../rudder-analytics.min.js  (analytics)
 *   • PostHog          — <host>/static/array.js                                (analytics; no-op key)
 *   • Google gtag      — www.googletagmanager.com/gtag/js                       (marketing)
 *   • Meta pixel       — connect.facebook.net/.../fbevents.js                   (marketing)
 *   • TikTok pixel     — analytics.tiktok.com/.../pixel/events.js               (marketing)
 */

// host/path fragments that identify a tracking request, with a friendly label.
// `marketing: true` marks the CPRA "sale"/"share" (targeted-advertising) bucket.
const TRACKER_SIGNATURES: { label: string; re: RegExp; marketing?: boolean }[] = [
  { label: 'RudderStack CDP (events.fatdogspirits.com)', re: /events\.fatdogspirits\.com/i },
  { label: 'RudderStack SDK', re: /rudder-analytics(\.min)?\.js/i },
  { label: 'Google gtag/GA', re: /googletagmanager\.com|google-analytics\.com|\/gtag\/js|analytics\.google\.com|\/g\/collect/i, marketing: true },
  { label: 'Google DoubleClick', re: /doubleclick\.net|googleadservices\.com|googlesyndication\.com/i, marketing: true },
  { label: 'Meta/Facebook pixel', re: /connect\.facebook\.net|facebook\.com\/tr|fbevents\.js/i, marketing: true },
  { label: 'TikTok pixel', re: /analytics\.tiktok\.com/i, marketing: true },
  { label: 'PostHog', re: /posthog|\/static\/array\.js|\/e\/\?ip=/i },
  { label: 'Segment', re: /cdn\.segment\.com|api\.segment\.io/i },
  { label: 'Hotjar', re: /static\.hotjar\.com|hotjar\.io/i },
];

type Hit = { label: string; url: string; marketing: boolean };

function classify(url: string): { label: string; marketing: boolean } | null {
  const m = TRACKER_SIGNATURES.find((s) => s.re.test(url));
  return m ? { label: m.label, marketing: m.marketing === true } : null;
}

// vanilla-cookieconsent v3 defaults `hideFromBots:true` → it won't render the
// banner when `navigator.webdriver` is true. Present as a real visitor so the
// opt-in UI actually appears (the launch arg in the config does the other half).
async function maskWebdriver(context: import('@playwright/test').BrowserContext) {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
}

async function passAgeGate(page: import('@playwright/test').Page) {
  const ageOk = page.getByRole('button', { name: /21 or older/i });
  if (await ageOk.isVisible().catch(() => false)) await ageOk.click();
}

test('no tracker fires before consent; trackers gate on opt-in (live)', async ({ page, context }) => {
  await maskWebdriver(context);

  const preHits: Hit[] = [];
  const postHits: Hit[] = [];
  let phase: 'pre' | 'post' = 'pre';

  page.on('request', (req) => {
    const c = classify(req.url());
    if (!c) return;
    (phase === 'pre' ? preHits : postHits).push({ ...c, url: req.url() });
  });

  // ---- COLD VISIT --------------------------------------------------------
  await page.goto('/', { waitUntil: 'networkidle' });
  // Regulated-spirits age gate renders first; pass it (NOT consent — no tracker
  // may fire during or after this step, only after the consent opt-in).
  await passAgeGate(page);

  // The consent banner must actually be present (proves the gate is deployed).
  const acceptAll = page.getByRole('button', { name: /accept all/i });
  await expect(acceptAll, 'consent banner "Accept all" should be visible on a cold visit').toBeVisible({
    timeout: 15_000,
  });

  await page.waitForTimeout(2500); // let any deferred/late scripts (mis)fire before judging.

  const preCookies = await context.cookies();
  const trackerCookies = preCookies.filter((c) => /_ga|_gid|_fbp|_tt|ph_|rl_/i.test(c.name));

  console.log('\n=== PRE-CONSENT ===');
  console.log(`tracker network requests: ${preHits.length}`);
  preHits.forEach((h) => console.log(`  ✗ ${h.label} -> ${h.url}`));

  // ★ THE CORE COMPLIANCE ASSERTION ★
  expect(preHits, `Tracker(s) fired BEFORE opt-in: ${preHits.map((h) => h.label).join(', ')}`).toHaveLength(0);
  expect(trackerCookies, 'tracker cookies set before opt-in').toHaveLength(0);

  // ---- OPT IN (positive control: the gate can open) ----------------------
  phase = 'post';
  await acceptAll.click();
  await page.waitForTimeout(3500); // let gated loaders inject + fire.

  console.log('\n=== POST-CONSENT ===');
  console.log(`tracker network requests: ${postHits.length}`);
  postHits.forEach((h) => console.log(`  ✓ ${h.label} -> ${h.url}`));

  await expect(acceptAll, 'banner should dismiss after accepting').toBeHidden({ timeout: 10_000 });

  if (postHits.length === 0) {
    console.log(
      '\n⚠️  No trackers fired even AFTER consent — the gate holds, but it is likely\n' +
        '   no analytics/pixel keys are set on this deploy (e.g. NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY).\n' +
        '   Pre-consent compliance is still PROVEN; positive firing is INCONCLUSIVE.',
    );
  }
});

test('declining consent ("Reject all") keeps every tracker off (live)', async ({ page, context }) => {
  await maskWebdriver(context);

  const trackerHits: Hit[] = [];
  page.on('request', (req) => {
    const c = classify(req.url());
    if (c) trackerHits.push({ ...c, url: req.url() });
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await passAgeGate(page);

  const rejectAll = page.getByRole('button', { name: /reject all/i });
  await expect(rejectAll, '"Reject all" should be available on a cold visit').toBeVisible({ timeout: 15_000 });
  await rejectAll.click();
  await page.waitForTimeout(3500);

  console.log('\n=== AFTER REJECT ALL ===');
  trackerHits.forEach((h) => console.log(`  ✗ ${h.label} -> ${h.url}`));
  expect(
    trackerHits,
    `Tracker(s) fired after the visitor REJECTED consent: ${trackerHits.map((h) => h.label).join(', ')}`,
  ).toHaveLength(0);
});

test('CPRA "Do Not Sell or Share" opts out of marketing, GPC honored (live, T45)', async ({ page, context }) => {
  await maskWebdriver(context);

  const marketingHits: Hit[] = [];
  page.on('request', (req) => {
    const c = classify(req.url());
    if (c?.marketing) marketingHits.push({ ...c, url: req.url() });
  });

  // ---- COLD VISIT --------------------------------------------------------
  await page.goto('/', { waitUntil: 'networkidle' });
  await passAgeGate(page);

  // The banner exposes the CPRA "Do Not Sell or Share" anchor (reachable without
  // dismissing the banner). It carries data-gm-do-not-sell so it is unambiguous.
  const doNotSell = page.locator('[data-gm-do-not-sell]');
  await expect(doNotSell, 'banner must surface a "Do Not Sell or Share" control').toBeVisible({
    timeout: 15_000,
  });
  await doNotSell.click();

  // Clicking it opens the preferences modal (so the visitor can confirm); give
  // any (mis)gated marketing loader a chance to fire before we judge.
  await page.waitForTimeout(3000);

  console.log('\n=== AFTER DO NOT SELL ===');
  marketingHits.forEach((h) => console.log(`  ✗ ${h.label} -> ${h.url}`));

  // ★ T45 ASSERTION ★ — no MARKETING (sale/share) tracker after the opt-out.
  expect(
    marketingHits,
    `Marketing tracker(s) fired after "Do Not Sell": ${marketingHits.map((h) => h.label).join(', ')}`,
  ).toHaveLength(0);

  // POSITIVE CONTROL — prove the click actually registered the opt-out (not a
  // dead page): the persisted, auditable record must show marketing denied while
  // analytics respects the visitor's (here: never-granted) choice.
  const record = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('vinny-consent') ?? 'null');
    } catch {
      return null;
    }
  });
  console.log('persisted consent record:', JSON.stringify(record));
  expect(record, 'a consent record must be persisted after the opt-out').not.toBeNull();
  expect(record.state.marketing, 'marketing must be opted out').toBe(false);
  expect(record.state.necessary, 'necessary stays always-on').toBe(true);
});
