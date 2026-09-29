import { expect, test } from '@playwright/test';
import { fixture } from './support.ts';

const POSTED_AT = /^\s*Posted at \w{3} \d{1,2}, \d{2}:\d{2} UTC · \d+ (min|hr|days?)\.? ago\s*$/;

test('shows an incident with every update and its post time', async ({ page }) => {
  const { slug, file } = fixture('open');
  await page.goto(`/incidents/${slug}/`);

  await expect(page).toHaveTitle(`${file.name} - DatoCMS Status`);
  await expect(page.locator('.incident-details')).toHaveClass(/incident-details--impact-major/);
  await expect(page.locator('.incident-details__title')).toHaveText(file.name);
  await expect(page.locator('.incident-details__subtitle')).toHaveText('Incident report for DatoCMS');
  await expect(page.locator('.incident-details__update__status')).toHaveText(['Identified', 'Investigating']);
  await expect(page.locator('.incident-details__update__timestamp')).toHaveText([POSTED_AT, POSTED_AT]);
  await expect(page.locator('.incident-details__summary')).toHaveCount(0);
});

test('shows the post time of an update in UTC', async ({ page }) => {
  const { slug, file } = fixture('open');
  const posted = new Date(file.updates[1].date);
  const time = posted.toISOString().slice(11, 16);
  await page.goto(`/incidents/${slug}/`);

  await expect(page.locator('.incident-details__update__timestamp').first()).toContainText(`${time} UTC`);
});

test('shows a maintenance with its window, and the announcement without a post time', async ({ page }) => {
  const { slug, file } = fixture('completedMaintenance');
  await page.goto(`/incidents/${slug}/`);

  await expect(page.locator('.incident-details__title')).toHaveText(file.name);
  await expect(page.locator('.incident-details__subtitle')).toHaveText('Scheduled Maintenance Report for DatoCMS');
  await expect(page.locator('.incident-details__summary__row')).toHaveText([
    /^Scheduled for: \w{3} \d{1,2}, \d{2}:\d{2} - \d{2}:\d{2} UTC · 3 days ago$/,
    'Affected components: Billing',
  ]);
  await expect(page.locator('.incident-details__update__status')).toHaveText([
    'Completed',
    'Verifying',
    'In progress',
    'Scheduled',
  ]);
  await expect(page.locator('.incident-details__update__timestamp')).toHaveCount(3);
  await expect(page.locator('.incident-details__update').last()).not.toContainText('Posted at');
  await expect(page.locator('.incident-details__update').last()).toContainText('Payments will be unavailable');
});

test('ends a maintenance window after its duration', async ({ page }) => {
  const { slug, file } = fixture('completedMaintenance');
  const start = new Date(file.scheduledTime!);
  const end = new Date(start.getTime() + Number(file.minutes) * 60_000);
  await page.goto(`/incidents/${slug}/`);

  const links = page.locator('.incident-details__summary__row a');
  await expect(links).toHaveText([start.toISOString().slice(11, 16), end.toISOString().slice(11, 16)]);
});

test('goes from the homepage to the page of an incident', async ({ page }) => {
  const { slug, file } = fixture('resolved');
  await page.goto('/');
  await page.locator('.incidents-daily').getByRole('link', { name: file.name }).click();

  await expect(page).toHaveURL(new RegExp(`/incidents/${slug}/$`));
  await expect(page.locator('.incident-details__title')).toHaveText(file.name);

  await page.getByRole('link', { name: 'Back to status page' }).click();
  await expect(page.locator('.incidents-daily__title').first()).toBeVisible();
});

test('answers 404 for an incident that does not exist', async ({ page }) => {
  const response = await page.goto('/incidents/2020-01-01-no-such-incident/');

  expect(response?.status()).toBe(404);
  await expect(page.getByText('Page not found.')).toBeVisible();
});
