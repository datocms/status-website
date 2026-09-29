import { expect, test } from '@playwright/test';
import { fixture, historyPathFor, manifest, monthTitle } from './support.ts';
import type { FixtureName } from './fixtures.ts';

const startOf = (name: FixtureName) => {
  const { file } = fixture(name);
  return file.scheduledTime ?? file.updates[0].date;
};

for (const name of ['open', 'resolved', 'completedMaintenance', 'old'] as const) {
  test(`lists "${name}" under its month`, async ({ page }) => {
    const { slug, file } = fixture(name);
    const start = startOf(name);
    await page.goto(historyPathFor(start, manifest().builtAt));

    const month = page.locator('.history__month', {
      has: page.locator('.history__month__title', { hasText: monthTitle(start) }),
    });
    const entry = month.locator('.history__incident', { hasText: file.name });

    await expect(entry.getByRole('link', { name: file.name })).toHaveAttribute('href', `/incidents/${slug}/`);
    await expect(entry.locator('.history__incident__timestamp')).toHaveText(/^\w{3} \d{1,2}, \d{2}:\d{2} - \w{3} \d{1,2}, \d{2}:\d{2} UTC · \d+ (hr|days?|mo)\.? ago$/);
  });
}

test('marks each entry with its impact', async ({ page }) => {
  const { file } = fixture('old');
  await page.goto(historyPathFor(startOf('old'), manifest().builtAt));

  await expect(page.locator('.history__incident', { hasText: file.name })).toHaveClass(
    /history__incident--impact-critical/,
  );
});

test('leaves out a maintenance that has not started', async ({ page }) => {
  await page.goto('/history/');

  await expect(page.locator('.history__month')).toHaveCount(3);
  await expect(page.locator('.history')).not.toContainText(fixture('futureMaintenance').file.name);
});

test('says when a month has no incident', async ({ page }) => {
  await page.goto('/history/page/1/');

  await expect(page.locator('.history__month__no-incidents').first()).toHaveText('No incidents reported.');
});

test('moves to older months and back', async ({ page }) => {
  await page.goto('/history/');
  const first = await page.locator('.history__header__nav span').innerText();

  await expect(page.locator('.history__button--next')).toHaveCount(0);
  await page.locator('.history__button--prev').click();

  await expect(page).toHaveURL(/\/history\/page\/1\/?$/);
  await expect(page.locator('.history__header__nav span')).not.toHaveText(first);

  await page.locator('.history__button--next').click();
  await expect(page).toHaveURL(/\/history\/?$/);
  await expect(page.locator('.history__header__nav span')).toHaveText(first);
});

test('renders the last update as Markdown, as the homepage does', async ({ page }) => {
  const { file } = fixture('open');
  await page.goto(historyPathFor(startOf('open'), manifest().builtAt));
  const body = page.locator('.history__incident', { hasText: file.name }).locator('.history__incident__body');

  await expect(body.getByRole('link', { name: 'the docs' })).toHaveAttribute('href', 'https://www.datocms.com/docs');
  await expect(body).not.toContainText('[the docs]');
  await expect(body).not.toContainText('](https://');
});

test('keeps the paragraphs and lists of a long update apart', async ({ page }) => {
  const { file } = fixture('old');
  await page.goto(historyPathFor(startOf('old'), manifest().builtAt));
  const body = page.locator('.history__incident', { hasText: file.name }).locator('.history__incident__body .ugc');

  await expect(body.locator('p')).toHaveText(['Uploads work again.', 'What happened', 'A disk was full — “café” ☕.']);
  await expect(body.locator('strong')).toHaveText('What happened');
  await expect(body.locator('li')).toHaveText(['We added space', 'We added an alarm']);
});

test('shows only the last update, without its status', async ({ page }) => {
  const { file } = fixture('resolved');
  await page.goto(historyPathFor(startOf('resolved'), manifest().builtAt));
  const body = page.locator('.history__incident', { hasText: file.name }).locator('.history__incident__body .ugc');

  await expect(body).toHaveText('The issue has been resolved.');
});
