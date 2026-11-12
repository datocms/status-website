import { expect, test } from '@playwright/test';
import { mockApi } from './support.ts';

// The dot of an incident has an icon and a label, thus it does not give the
// impact with the colour only.
const incident = (page: import('@playwright/test').Page, name: string) =>
  page.locator('.incidents-daily__incident').filter({ has: page.getByRole('link', { name }) });

test('gives each dot of the timeline an icon and a label for its impact', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  for (const [name, label, icon] of [
    ['Slow dashboard', 'Minor impact', 'triangle-alert'],
    ['Markdown in updates', 'Critical impact', 'octagon-x'],
    ['Billing maintenance', 'Maintenance', 'wrench'],
  ] as const) {
    const dot = incident(page, name).locator('.impact-dot');
    await expect(dot).toHaveAccessibleName(label);
    await expect(dot.locator(`svg.lucide-${icon}`)).toHaveCount(1);
  }
});

test('draws the icon in the ink of the impact, on its accent', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const dot = incident(page, 'Slow dashboard').locator('.impact-dot');

  await expect(dot).toHaveCSS('background-color', 'rgb(232, 216, 85)');
  await expect(dot).toHaveCSS('color', 'rgb(53, 22, 21)');
});

test('shows the large dot with its icon on the incident page', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Slow dashboard' }).first().click();

  const dot = page.locator('.incident-details .impact-dot--large');
  await expect(dot).toHaveAccessibleName('Minor impact');
  await expect(dot.locator('svg.lucide-triangle-alert')).toHaveCount(1);
  await expect(dot).toHaveCSS('width', '40px');
});

test('gives the dots of the history pages an icon', async ({ page }) => {
  await mockApi(page);
  await page.goto('/history/');

  const dots = page.locator('.history__incident .impact-dot');
  expect(await dots.count()).toBeGreaterThan(0);
  expect(await dots.locator('svg').count()).toBe(await dots.count());
});
