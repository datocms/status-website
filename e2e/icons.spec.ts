import { expect, test } from '@playwright/test';
import { mockApi } from './support';

// The icons are Lucide SVGs in the HTML. They take the colour of the text, and
// a screen reader does not read them.
test('the subscribe button and the footer link have a Lucide icon in the colour of their text', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  for (const [selector, name] of [
    ['.subscribe__button', 'rss'],
    ['.page-footer__link a', 'arrow-left'],
  ] as const) {
    const icon = page.locator(`${selector} svg.lucide-${name}`);
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('stroke', 'currentColor');
  }

  await expect(page.getByRole('button', { name: 'Subscribe to updates', exact: true })).toBeVisible();
});

test('the history buttons are Lucide chevrons with a name for a screen reader', async ({ page }) => {
  await mockApi(page);
  await page.goto('/history/');
  const previous = page.getByRole('link', { name: 'Previous', exact: true });

  await expect(previous.locator('svg.lucide-chevron-left')).toBeVisible();
  await expect(previous.locator('img')).toHaveCount(0);
});
