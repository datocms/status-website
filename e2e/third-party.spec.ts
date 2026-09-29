import { expect, test } from '@playwright/test';
import { html, json, mockApi } from './support.ts';

const section = 'third-party-components';
const unreached = (names: string) => ({ 'X-Unreached-Suppliers': names });

const item = (overrides: Record<string, unknown> = {}) => ({
  title: 'Slow API',
  date: '2026-09-27T10:00:00.000Z',
  url: 'https://stspg.io/abc',
  description: 'We are investigating.',
  status: 'Investigating',
  ongoing: true,
  source: { name: 'Mux', homepageUrl: 'https://status.mux.com/' },
  ...overrides,
});

test('says that all suppliers are operational when all replied and none has an incident', async ({ page }) => {
  await mockApi(page, { feeds: json([], 200, unreached('')) });
  await page.goto('/');

  await expect(page.locator(`${section} .incidents-daily__title`)).toHaveText('Third-Party Components');
  await expect(page.locator(`${section} p`)).toHaveText(['All third-party components are operational.']);
});

test('does not give an all-clear for a supplier that gave no reply', async ({ page }) => {
  await mockApi(page, { feeds: json([], 200, unreached('Imgix,AWS%20EC2')) });
  await page.goto('/');

  await expect(page.locator(`${section} p`)).toHaveText([
    'No incidents reported by the suppliers that replied.',
    'No status available from: Imgix, AWS EC2.',
  ]);
  await expect(page.locator(section)).not.toContainText('operational');
});

test('shows a supplier name that is not valid percent-encoding as it is', async ({ page }) => {
  await mockApi(page, { feeds: json([item()], 200, unreached('Imgix,100%')) });
  await page.goto('/');

  await expect(page.locator(section)).toContainText('No status available from: Imgix, 100%.');
  await expect(page.locator(`${section} .incidents-daily__incident__title`)).toHaveText('Mux: Slow API');
});

test('separates ongoing incidents from resolved ones', async ({ page }) => {
  await mockApi(page, {
    feeds: json(
      [
        item(),
        item({ title: 'Image errors', status: 'Resolved', ongoing: false, description: 'Fixed.', source: { name: 'Imgix', homepageUrl: 'https://status.imgix.com/' } }),
      ],
      200,
      unreached(''),
    ),
  });
  await page.goto('/');
  const groups = page.locator(`${section} .incidents-daily__day`);

  await expect(groups.locator('.incidents-daily__day__title')).toHaveText(['Ongoing', 'Recently resolved']);
  await expect(groups.nth(0).locator('.incidents-daily__incident')).toHaveText([/Mux: Slow API\s+Investigating — We are investigating\.\s+Sep 27, 10:00 UTC · \d+ (hr|days?|mo)\.? ago/]);
  await expect(groups.nth(1).locator('.incidents-daily__incident__update__description')).toHaveText('Fixed.');
  await expect(groups.nth(0).getByRole('link', { name: 'Mux: Slow API' })).toHaveAttribute('href', 'https://stspg.io/abc');
});

test('says when no incident is ongoing but some were resolved', async ({ page }) => {
  await mockApi(page, { feeds: json([item({ status: 'Resolved', ongoing: false })], 200, unreached('')) });
  await page.goto('/');

  await expect(page.locator(`${section} .incidents-daily__day`).first()).toContainText('No ongoing incidents.');
});

test('shows the text of a supplier as text, and never runs it', async ({ page }) => {
  let ran = false;
  page.on('dialog', async (dialog) => {
    ran = true;
    await dialog.dismiss();
  });
  await mockApi(page, {
    feeds: json(
      [item({ title: '<img src=x onerror=alert(1)>', description: '<script>alert(2)</script> & more', url: 'javascript:alert(3)' })],
      200,
      unreached(''),
    ),
  });
  await page.goto('/');
  const entry = page.locator(`${section} .incidents-daily__incident`);

  await expect(entry.locator('.incidents-daily__incident__title')).toHaveText('Mux: <img src=x onerror=alert(1)>');
  await expect(entry).toContainText('<script>alert(2)</script> & more');
  await expect(entry.locator('img, script')).toHaveCount(0);
  await expect(entry.locator('a')).toHaveCount(0);
  expect(ran).toBe(false);
});

test('leaves out the date of an item when it is not a date', async ({ page }) => {
  await mockApi(page, { feeds: json([item({ date: 'not a date' })], 200, unreached('')) });
  await page.goto('/');

  await expect(page.locator(`${section} .incidents-daily__incident__title`)).toHaveText('Mux: Slow API');
  await expect(page.locator(`${section} .incidents-daily__incident__update__timestamp`)).toHaveCount(0);
});

for (const [name, reply] of [
  ['no supplier gave a reply', json({ error: 'No supplier status could be retrieved' }, 503)],
  ['the host gives an error page', html(500)],
] as const) {
  test(`says that the status is unavailable when ${name}`, async ({ page }) => {
    await mockApi(page, { feeds: reply });
    await page.goto('/');

    await expect(page.locator(`${section} p`)).toHaveText(['Third-party status is currently unavailable.']);
  });
}

test('says on the static mirror that it has no third-party status', async ({ page }) => {
  await page.goto('/');
  const notice = page.locator(`${section} .mirror-notice`);

  await expect(page.locator(`${section} .section-title`)).toHaveText('Third-Party Components');
  await expect(notice).toHaveText('Third-party status is not available on this static mirror. See the main status page.');
  await expect(notice.getByRole('link', { name: 'the main status page' })).toHaveAttribute(
    'href',
    'https://status.datocms.com/#third-party-components',
  );
  await expect(page.locator(section)).not.toContainText('operational');
});
