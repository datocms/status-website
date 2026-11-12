import { expect, test } from '@playwright/test';
import { components, json, mockApi, region } from './support.ts';

const INK = 'rgb(24, 3, 46)';
const PAPER = 'rgb(246, 245, 255)';
// The dark scheme of the website for the purple theme (tokens.json, themes.purple.dark)
const DARK_GROUND = 'rgb(16, 13, 26)';
const DARK_TEXT = 'rgb(227, 220, 255)';

test('the light mode has the ink on the paper', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await mockApi(page);
  await page.goto('/');

  await expect(page.locator('body')).toHaveCSS('background-color', PAPER);
  await expect(page.locator('body')).toHaveCSS('color', INK);
});

test('the dark mode follows the system: the dark scheme of the website, and the accent logo', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await mockApi(page);
  await page.goto('/');

  await expect(page.locator('body')).toHaveCSS('background-color', DARK_GROUND);
  await expect(page.locator('body')).toHaveCSS('color', DARK_TEXT);
  await expect(page.locator('.page-header__name')).toHaveCSS('color', DARK_TEXT);

  const logo = page.locator('.page-header__logo img');
  await expect.poll(() => logo.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/\/logo-icon-dark\.svg$/);
});

test('in the dark mode, the text on a status ground stays dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await mockApi(page);
  await page.goto('/');
  const title = page.locator('.unresolved-incident__title').first();

  const [ground, text] = await title.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  expect(ground).not.toBe(DARK_GROUND);
  expect(text).not.toBe(DARK_TEXT);
});

test('in the dark mode, a day with no data is a dark bar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await mockApi(page, {
    componentStatus: json(components({ cma: { regions: [region('global', 'unknown')] } })),
  });
  await page.goto('/');
  const bar = page.locator('.daily-outage rect[fill="#dfdcea"]').first();

  await expect(bar).toHaveCSS('fill', 'rgb(54, 50, 67)');
});

test('in the dark mode, a pill button keeps the accent and the ink of the light scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await mockApi(page);
  await page.goto('/');

  for (const selector of ['.subscribe__button', '.system-metrics__period button.is-active']) {
    await expect(page.locator(selector), selector).toHaveCSS('background-color', 'rgb(157, 117, 247)');
    await expect(page.locator(selector), selector).toHaveCSS('color', INK);
  }
});
