import { expect, test } from '@playwright/test';

/**
 * S10 — DTC checkout e2e (Wave 2·H), against the LIVE deploy (touchvodka.com).
 *
 * Proves the full storefront purchase path end-to-end through the REAL deployed
 * UI + the published `@geniemarketing/commerce` client + the `lib/checkout` shim
 * + the shared Medusa region: PLP → add to cart → /checkout (Details → Delivery →
 * Payment → Done) → an order with a `#display_id`, cart cleared.
 *
 * PAYMENT PROVIDER: this exercises whatever provider the touch-vodka region
 * exposes. While the region offers only `pp_system_default`, the checkout falls
 * back to the manual "no card required" path (see checkout.tsx) and completes a
 * no-capture TEST order. Once the operator enables Stripe on the region, the same
 * flow renders Stripe Elements (set STRIPE_TEST_CARD=1 to drive the 4242 card).
 *
 * ⚠️ Completing this creates ONE real order in the prod Medusa admin (no payment
 * captured on the manual path). Archive it when done — see HANDOFFS.
 *
 *   BASE_URL=https://touchvodka.com npx playwright test --config playwright.checkout-live.config.ts
 *
 * NOTE: we deliberately do NOT mask navigator.webdriver here. vanilla-cookieconsent
 * v3 (`hideFromBots:true`) then keeps the consent banner hidden so it can't overlay
 * the checkout controls; the age gate is skipped by pre-seeding its localStorage flag.
 */

const STRIPE_TEST_CARD = process.env.STRIPE_TEST_CARD === '1';

test('DTC checkout completes a TEST order end-to-end (live)', async ({ page, context }) => {
  // Skip the 21+ age gate (it reads localStorage, not webdriver).
  await context.addInitScript(() => {
    try {
      localStorage.setItem('vinny-age-verified', 'true');
    } catch {
      /* storage may be unavailable on first paint — gate click is the fallback */
    }
  });

  // ── 1 · PLP renders Medusa products with price + Add ─────────────────────────
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  const addButtons = page.getByRole('button', { name: /^Add(\s|·|$)/i });
  await expect(addButtons.first()).toBeVisible({ timeout: 30_000 });

  // ── 2 · Add the first product (waits for the line-item POST to land) ──────────
  const [lineItemResp] = await Promise.all([
    page.waitForResponse(
      (r) => /\/store\/carts\/[^/]+\/line-items/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    ),
    addButtons.first().click(),
  ]);
  expect(lineItemResp.ok(), 'add-to-cart line-item POST ok').toBeTruthy();

  // ── 3 · Checkout · Details ────────────────────────────────────────────────────
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  await expect(page.getByPlaceholder('Email')).toBeVisible({ timeout: 20_000 });
  await page.getByPlaceholder('Email').fill('s10-e2e@touchvodka.test');
  await page.getByPlaceholder('First name').fill('Test');
  await page.getByPlaceholder('Last name').fill('Buyer');
  await page.getByPlaceholder('Address').fill('123 Congress Ave');
  await page.getByPlaceholder('City').fill('Austin');
  await page.getByPlaceholder('State / Province').fill('TX');
  await page.getByPlaceholder('Postal code').fill('78701');
  await page.getByPlaceholder('Country code (e.g. us)').fill('us');
  await page.getByRole('button', { name: /Continue to delivery/i }).click();

  // ── 4 · Checkout · Delivery (a shipping option must exist for the region) ─────
  await expect(page.getByText(/Standard Shipping/i)).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /Continue to payment/i }).click();

  // ── 5 · Checkout · Payment ────────────────────────────────────────────────────
  const noCard = page.getByText(/no card required/i);
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
  // Either the manual notice (region has no Stripe) or the Stripe Element renders.
  await Promise.race([
    noCard.waitFor({ state: 'visible', timeout: 20_000 }),
    page
      .locator('iframe[name^="__privateStripeFrame"]')
      .first()
      .waitFor({ state: 'visible', timeout: 20_000 }),
  ]);
  const isManual = await noCard.isVisible().catch(() => false);
  if (!isManual && STRIPE_TEST_CARD) {
    // Stripe path: fill the 4242 test card inside the Payment Element iframe.
    await stripeFrame.getByPlaceholder(/card number/i).fill('4242 4242 4242 4242');
    await stripeFrame.getByPlaceholder(/MM \/ YY/i).fill('12 / 34');
    await stripeFrame.getByPlaceholder(/CVC/i).fill('123');
    const zip = stripeFrame.getByPlaceholder(/ZIP|postal/i);
    if (await zip.count()) await zip.fill('78701');
  }
  test.info().annotations.push({
    type: 'payment-provider',
    description: isManual ? 'manual (pp_system_default)' : 'stripe',
  });
  await page.getByRole('button', { name: /Place order/i }).click();

  // ── 6 · Done · order confirmation with a #display_id, cart cleared ───────────
  await expect(page.getByText(/Order placed|Thank you/i)).toBeVisible({ timeout: 40_000 });
  const body = await page.locator('body').innerText();
  const m = body.match(/Order\s+#\s?(\d+)/i) ?? body.match(/#\s?(\d+)/);
  expect(m, 'order display_id present on confirmation').toBeTruthy();
  // Cart is reset after a successful order.
  const cartId = await page.evaluate(() => localStorage.getItem('tv-cart-id'));
  expect(cartId, 'cart cleared after order').toBeNull();

  // Surface the order id for the operator (archive the manual TEST order).
  console.log(`\nS10 ORDER COMPLETED — display_id=#${m?.[1]} provider=${isManual ? 'manual' : 'stripe'}\n`);
});
