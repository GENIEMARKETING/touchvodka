import { expect, test } from './support/test';

// Onboarding smoke: the growth-wired page renders the lead form + stockist
// locator (S8 + S10) and the consent banner gates trackers (S7).
test('find-us renders the lead form and stockist locator', async ({ page }) => {
  await page.goto('/find-us');
  await expect(page.getByRole('heading', { name: /find us/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /send inquiry/i })).toBeVisible();
});

test('no tracker fires before consent', async ({ page }) => {
  await page.goto('/');
  // PostHog array.js / gtag must NOT be injected pre-consent.
  const phLoaded = await page.evaluate(() => Boolean(document.getElementById('posthog')));
  const gaLoaded = await page.evaluate(() => Boolean(document.getElementById('google-gtag')));
  expect(phLoaded || gaLoaded).toBe(false);
});
