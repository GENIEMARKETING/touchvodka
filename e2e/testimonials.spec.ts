import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './support/test';

// T47 — the homepage testimonial wall. Covers the gates the block promises:
// render with real (seeded/CMS) data, axe-clean, and a CLS-safe reduced-motion
// path (marquee → static grid, loop-clone removed from layout + AT).
const HEADING = 'What people are pouring';

test('testimonial wall renders with testimonials', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
  // The real (non-clone) track is present and visible…
  await expect(page.locator('.gm-twall__track:not(.gm-twall__clone)').first()).toBeVisible();
  // …and the seamless-loop clone is hidden from assistive tech.
  await expect(page.locator('.gm-twall__clone')).toHaveAttribute('aria-hidden', 'true');
});

test('testimonial wall has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: HEADING }).waitFor();
  const results = await new AxeBuilder({ page })
    .include('.gm-twall')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('marquee animates by default but is a static grid under reduced motion', async ({ page }) => {
  await page.goto('/');
  const viewport = page.locator('.gm-twall__viewport').first();
  await viewport.waitFor();
  expect(await viewport.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    'gm-twall-scroll',
  );

  // Reduced motion: pure-CSS path turns the marquee off and the cards into a grid.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Mara Quinn').first()).toBeVisible();
  const reduced = page.locator('.gm-twall__viewport').first();
  expect(await reduced.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await expect(page.locator('.gm-twall__clone')).toBeHidden();
});
