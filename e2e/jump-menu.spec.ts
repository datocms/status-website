import { expect, test, type Page } from '@playwright/test';
import { fixture, mockApi } from './support.ts';

const menu = (page: Page) => page.getByRole('navigation', { name: 'Sections of this page' });

const ITEMS = [
  ['Components', 'component-status', 'Component Status'],
  ['Metrics', 'system-metrics', 'System Metrics'],
  ['Third-Party', 'third-party-components', 'Third-Party Components'],
  ['History', 'incident-history', 'Incident History'],
] as const;

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
});

test('lists the sections of the page', async ({ page }) => {
  await expect(menu(page).locator('.jump-menu__label')).toHaveText('Jump to:');
  await expect(menu(page).getByRole('listitem')).toHaveText(ITEMS.map(([label]) => label));
  await expect(menu(page).getByRole('link')).toHaveText(ITEMS.map(([label]) => label));
});

test('puts a bar between the items', async ({ page }) => {
  const separators = await menu(page)
    .locator('li')
    .evaluateAll((items) => items.map((item) => getComputedStyle(item, '::before').content));

  expect(separators).toEqual(['none', '"|"', '"|"', '"|"']);
});

test('sits below the open incidents and above the component status', async ({ page }) => {
  const box = (await menu(page).boundingBox())!;
  const lastIncident = (await page.locator('.unresolved-incident').last().boundingBox())!;
  const components = (await page.locator('#component-status').boundingBox())!;

  expect(box.y).toBeGreaterThanOrEqual(lastIncident.y + lastIncident.height);
  expect(box.y + box.height).toBeLessThanOrEqual(components.y);
});

test('is in the middle of the page, on a wide and on a narrow screen', async ({ page }) => {
  for (const width of [1000, 380]) {
    await page.setViewportSize({ width, height: 800 });
    const container = (await page.locator('.page-container').boundingBox())!;
    // The menu takes two lines on a narrow screen: each line must be in the middle.
    const boxes = await menu(page)
      .locator('.jump-menu__label, li')
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
    const lines = Map.groupBy(boxes, (box) => Math.round(box.top));

    for (const line of lines.values()) {
      const left = Math.min(...line.map((box) => box.left));
      const right = Math.max(...line.map((box) => box.right));

      expect(Math.abs((left + right) / 2 - (container.x + container.width / 2)), `width ${width}`).toBeLessThan(2);
    }
  }
});

for (const [label, id, title] of ITEMS) {
  test(`"${label}" goes to the section "${title}"`, async ({ page }) => {
    const link = menu(page).getByRole('link', { name: label, exact: true });
    await expect(link).toHaveAttribute('href', `#${id}`);

    await link.click();

    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expect(page.locator(`#${id} .section-title`)).toHaveText(title);
    await expect(page.locator(`#${id} .section-title`)).toBeInViewport();
  });
}

test('is small, plain text in the colour of the body', async ({ page }) => {
  const link = menu(page).getByRole('link', { name: 'Components' });
  const body = await page.locator('body').evaluate((el) => getComputedStyle(el).color);

  await expect(menu(page)).toHaveCSS('font-size', '13px');
  await expect(menu(page)).toHaveCSS('color', body);
  await expect(link).toHaveCSS('color', body);
  await expect(link).toHaveCSS('text-decoration-line', 'none');

  await link.hover();
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
});

test('stays on one line on a wide screen', async ({ page }) => {
  expect((await menu(page).boundingBox())!.height).toBeLessThan(25);
});

test('puts the first item close to the label', async ({ page }) => {
  const label = (await menu(page).locator('.jump-menu__label').boundingBox())!;
  const first = (await menu(page).getByRole('link').first().boundingBox())!;

  expect(first.x - (label.x + label.width)).toBeLessThan(12);
});

test('keeps every item on the static mirror, where each section says what it lacks', async ({ page }) => {
  const mirror = await page.context().newPage();
  await mirror.goto('/');

  await expect(menu(mirror).getByRole('link')).toHaveText(ITEMS.map(([label]) => label));
  await menu(mirror).getByRole('link', { name: 'Third-Party' }).click();
  await expect(mirror.locator('#third-party-components .mirror-notice')).toBeInViewport();
});

test('is on the homepage only', async ({ page }) => {
  for (const path of ['/history/', `/incidents/${fixture('open').slug}/`]) {
    await page.goto(path);
    await expect(menu(page)).toHaveCount(0);
  }
});

test.describe('the section of past incidents', () => {
  test('has the name "Incident History"', async ({ page }) => {
    await expect(page.locator('#incident-history .section-title')).toHaveText('Incident History');
    await expect(page.locator('#past-incidents')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('Past incidents');
  });
});
