import AxeBuilder from '@axe-core/playwright';
import { expect, gotoStable, test } from './support/test';

// WCAG 2.1 A/AA accessibility floor.
//
// SCAFFOLD FIX (see LEARNINGS: vinny-init-a11y-import): vinny-init ships this test
// importing `expectNoA11yViolations` from `@vinny/foundation/axe`, but the
// foundation package exposes no `/axe` export — so a freshly scaffolded site
// fails typecheck/CI out of the box. Until the foundation adds that helper, we
// assert directly with @axe-core/playwright (already a devDependency).
test('home has no accessibility violations', async ({ page }) => {
  await gotoStable(page, '/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('content is visible with reduced motion', async ({ page }) => {
  // emulateMedia instead of `test.use({ reducedMotion })` — the scaffold's
  // base.extend narrows the test type and drops the built-in TestOptions, so the
  // option form fails typecheck. This is equivalent and type-safe.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
