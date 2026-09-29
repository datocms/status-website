import { expect, test } from '@playwright/test';
import { fixture, mockApi } from './support.ts';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
});

test('shows the open incident with its updates, newest first', async ({ page }) => {
  const { file } = fixture('open');
  const incident = page.locator('.unresolved-incident--impact-major');

  await expect(incident.locator('.unresolved-incident__title')).toHaveText(file.name);

  const updates = incident.locator('.unresolved-incident__update');
  await expect(updates).toHaveCount(2);
  await expect(updates.nth(0)).toContainText('Identified — We found the cause');
  await expect(updates.nth(1)).toContainText('Investigating — We are investigating elevated error rates.');
  await expect(incident.locator('.unresolved-incident__update__timestamp')).toHaveText([
    /^\w{3} \d{1,2}, \d{2}:\d{2} UTC · 1 hr\. ago$/,
    /^\w{3} \d{1,2}, \d{2}:\d{2} UTC · 2 hr\. ago$/,
  ]);
});

test('renders the markdown of an update', async ({ page }) => {
  const update = page.locator('.unresolved-incident--impact-major .unresolved-incident__update').nth(1);

  await expect(update.locator('strong')).toHaveText(['Investigating', 'elevated']);
  await expect(update.locator('li')).toHaveText(['Reads work', 'Writes fail']);
  await expect(update).toContainText('Détails à suivre ☕ — “soon”.');
  await expect(
    page.locator('.unresolved-incident--impact-major').getByRole('link', { name: 'the docs' }),
  ).toHaveAttribute('href', 'https://www.datocms.com/docs');
});

test('shows a title with markup as text', async ({ page }) => {
  const title = page.locator('.unresolved-incident--impact-major .unresolved-incident__title');

  await expect(title).toContainText('<b>tags</b>');
  await expect(title.locator('b')).toHaveCount(0);
});

test('announces a future maintenance with its window and no post time', async ({ page }) => {
  const { file } = fixture('futureMaintenance');
  const maintenance = page.locator('.unresolved-incident--impact-maintenance');

  await expect(maintenance.locator('.unresolved-incident__title')).toHaveText(file.name);
  await expect(maintenance.locator('.unresolved-incident__summary__row')).toHaveText([
    /^Scheduled for: \w{3} \d{1,2}, \d{2}:\d{2} - \d{2}:\d{2} UTC · in 2 days$/,
    'Affected components: Content Delivery API, Content Management API',
  ]);
  await expect(maintenance.locator('.unresolved-incident__update')).toHaveText([
    /^\s*Scheduled — We are going to upgrade the database\./,
  ]);
  await expect(maintenance.locator('.unresolved-incident__update__timestamp')).toHaveCount(0);
});

test('links the start of a maintenance to the same minute in other time zones', async ({ page }) => {
  const { file } = fixture('futureMaintenance');
  const minute = file.scheduledTime!.slice(0, 16).replace(/[-:]/g, '');

  await expect(page.locator('.unresolved-incident--impact-maintenance .unresolved-incident__summary a').first()).toHaveAttribute(
    'href',
    `https://timee.io/${minute}?tl=Maintenance%20start%20date`,
  );
});

test('does not show a resolved incident as open', async ({ page }) => {
  await expect(page.locator('.unresolved-incident')).toHaveCount(3);
  await expect(page.locator('.unresolved-incidents')).not.toContainText(fixture('resolved').file.name);
  await expect(page.locator('.unresolved-incidents')).not.toContainText(fixture('completedMaintenance').file.name);
});

test('lists the last 7 days, with the incidents of each day', async ({ page }) => {
  const past = page.locator('.incidents-daily').filter({ hasText: 'Incident History' });

  await expect(past.locator('.incidents-daily__day')).toHaveCount(7);

  const { slug, file } = fixture('resolved');
  const entry = past.locator('.incidents-daily__incident', { hasText: file.name });

  await expect(entry).toHaveClass(/incidents-daily__incident--impact-minor/);
  await expect(entry.getByRole('link', { name: file.name })).toHaveAttribute('href', `/incidents/${slug}/`);
  await expect(entry.locator('.incidents-daily__incident__update')).toHaveText([
    /Resolved — The issue has been resolved\./,
    /Investigating — The dashboard is slow\./,
  ]);
});

test('gives no post time to the announcement of a past maintenance', async ({ page }) => {
  const entry = page.locator('.incidents-daily__incident', { hasText: fixture('completedMaintenance').file.name });

  await expect(entry.locator('.incidents-daily__incident__update')).toHaveCount(4);
  await expect(entry.locator('.incidents-daily__incident__update').last()).toContainText('Scheduled — Payments will be unavailable');
  await expect(entry.locator('.incidents-daily__incident__update__timestamp')).toHaveCount(3);
});

test('opens and closes the list of feeds', async ({ page }) => {
  await page.getByRole('button', { name: 'Subscribe to Updates' }).click();

  const links = page.locator('.subscribe__modal a');
  await expect(links).toHaveText(['Atom Feed', 'RSS Feed', 'JSON Feed']);
  await expect(links.nth(2)).toHaveAttribute('href', '/history.json');

  await page.locator('.incidents-daily__title').first().click();
  await expect(page.locator('.subscribe__modal')).toHaveCount(0);
});

test('links to the history', async ({ page }) => {
  await page.locator('.page-footer').getByRole('link', { name: 'Incident History' }).click();

  await expect(page).toHaveURL(/\/history\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('DatoCMS Status: Incident History');
});
