import { expect, test } from '@playwright/test';
import { mockApi } from './support';

// The page starts with the hero band on the accent and ends with the closer
// and the footer on the inverse grounds, as the pages of www.datocms.com.

test('the hero band is on the accent, full width, with the ink as its text', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.setViewportSize({ width: 1200, height: 900 });
  await mockApi(page);
  await page.goto('/');
  const hero = page.locator('.hero');

  await expect(hero).toHaveCSS('background-color', 'rgb(157, 117, 247)');
  await expect(hero).toHaveCSS('color', 'rgb(24, 3, 46)');
  expect((await hero.boundingBox())!.width).toBe(1200);
  await expect(hero.locator('.page-header h1')).toHaveCount(1);
});

test('the homepage headline says the state of the incident files, in two tones', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const headline = page.locator('.hero__headline');

  // The fixtures have open incidents.
  await expect(headline).toHaveText(/^We are working on (an incident|\w+ incidents)\. Updates are below\.$/);
  await expect(headline.locator('.hero__muted')).toHaveText('Updates are below.');
  await expect(headline.locator('.hero__muted')).toHaveCSS('color', 'rgb(76, 47, 124)');
  await expect(headline).toHaveCSS('font-weight', '500');
});

test('the other pages have no headline in the band', async ({ page }) => {
  await mockApi(page);
  await page.goto('/history/');

  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('.hero__headline')).toHaveCount(0);
});

test('the closer links to support, and its headline ends with a face', async ({ page }) => {
  await mockApi(page);
  await page.goto('/history/');
  const closer = page.locator('.closer');
  const link = closer.getByRole('link', { name: 'Contact support' });

  await expect(closer).toHaveCSS('background-color', 'rgb(24, 3, 46)');
  await expect(link).toHaveAttribute('href', 'https://www.datocms.com/support');
  await expect(link).toHaveCSS('background-color', 'rgb(157, 117, 247)');
  await expect(link).toHaveCSS('border-radius', '9999px');

  const face = closer.locator('.face');
  await expect(face).toHaveAttribute('aria-hidden', 'true');
  expect(await face.evaluate((el) => getComputedStyle(el, '::after').content)).toMatch(/^"\[.~.\]"$/);
});

test('the face does not blink with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockApi(page);
  await page.goto('/');

  expect(await page.locator('.closer .face').evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe('none');
});

test('the footer is below the closer, on the deepest ground', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await mockApi(page);
  await page.goto('/');
  const closer = (await page.locator('.closer').boundingBox())!;
  const footer = page.locator('.footer-band');

  await expect(footer).toHaveCSS('background-color', 'rgb(11, 0, 30)');
  expect(Math.round((await footer.boundingBox())!.y)).toBe(Math.round(closer.y + closer.height));
});

test('the happy face smiles in the CSS, and stays still with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockApi(page);
  await page.goto('/');
  // The fixtures have open incidents: the hero has no face. Add one to read the CSS.
  const content = await page.evaluate(() => {
    const face = document.createElement('span');
    face.className = 'face face--happy';
    document.body.append(face);
    const style = getComputedStyle(face, '::after');
    return [style.content, style.animationName];
  });

  expect(content).toEqual(['"[•ᴗ•]"', 'none']);
});
