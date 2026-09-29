/**
 * Dates and times. The build of these tests runs in Los Angeles time and the
 * browser in Tokyo time (see e2e/prepare.ts and playwright.config.ts), so a
 * text that says the correct UTC time depends on neither.
 */
import { expect, test, type Page } from '@playwright/test';
import { components, fixture, json, manifest, metric, mockApi, region } from './support.ts';

const pad = (value: number) => String(value).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const utcTimestamp = (iso: string) => {
  const date = new Date(iso);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
};

const utcDate = (date: Date) => `${LONG_MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;

/** Sets the clock of the page to a moment after the build. */
const at = async (page: Page, minutesAfterBuild: number) => {
  const now = new Date(new Date(manifest().builtAt).getTime() + minutesAfterBuild * 60_000);
  await page.clock.install({ time: now });
  return now;
};

test.describe('timestamps', () => {
  test('incident page: each update has its UTC time and how long ago it was', async ({ page }) => {
    const { slug, file } = fixture('open');
    await at(page, 0);
    await page.goto(`/incidents/${slug}/`);

    await expect(page.locator('.incident-details__update__timestamp')).toHaveText([
      `Posted at ${utcTimestamp(file.updates[1].date)} · 1 hr. ago`,
      `Posted at ${utcTimestamp(file.updates[0].date)} · 2 hr. ago`,
    ]);
  });

  test('has the instant in a <time> element, for a program to read', async ({ page }) => {
    const { slug, file } = fixture('open');
    await page.goto(`/incidents/${slug}/`);
    const time = page.locator('.incident-details__update__timestamp time').first();

    await expect(time).toHaveAttribute('datetime', file.updates[1].date);
    await expect(time).toHaveText(utcTimestamp(file.updates[1].date));
  });

  test('homepage: open incidents and the incident history', async ({ page }) => {
    const { file } = fixture('open');
    await mockApi(page);
    await at(page, 0);
    await page.goto('/');

    for (const container of ['.unresolved-incident', '.incidents-daily__incident']) {
      const stamps = page.locator(container, { hasText: file.name }).locator('[class$="__update__timestamp"]');
      await expect(stamps, container).toHaveText([
        `${utcTimestamp(file.updates[1].date)} · 1 hr. ago`,
        `${utcTimestamp(file.updates[0].date)} · 2 hr. ago`,
      ]);
    }
  });

  test('history page: the first and the last update, and how long ago the last one was', async ({ page }) => {
    const { file } = fixture('resolved');
    await at(page, 0);
    await page.goto('/history/');
    const stamp = page.locator('.history__incident', { hasText: file.name }).locator('.history__incident__timestamp');
    const [first, last] = file.updates.map((update) => utcTimestamp(update.date));

    // The resolved fixture can be in the month before: then it is on this page too, which has 3 months.
    await expect(stamp).toHaveText(`${first.replace(' UTC', '')} - ${last} · 2 days ago`);
  });

  test('a maintenance window has its times in UTC, and when it starts', async ({ page }) => {
    const { slug, file } = fixture('futureMaintenance');
    const start = new Date(file.scheduledTime!);
    const end = new Date(start.getTime() + Number(file.minutes) * 60_000);
    // The window starts 3 days after the build. One hour before the build, 3 full days remain.
    await at(page, -60);
    await page.goto(`/incidents/${slug}/`);

    await expect(page.locator('.incident-details__summary__row').first()).toHaveText(
      `Scheduled for: ${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}, ${pad(start.getUTCHours())}:${pad(start.getUTCMinutes())} - ${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())} UTC · in 3 days`,
    );
  });

  test('third-party items show the full time, in UTC for a supplier in any zone', async ({ page }) => {
    const item = (date: string) => ({
      title: 'Slow API',
      date,
      url: 'https://stspg.io/abc',
      description: 'Text.',
      status: 'Investigating',
      ongoing: true,
      source: { name: 'Imgix', homepageUrl: 'https://status.imgix.com/' },
    });
    const builtAt = new Date(manifest().builtAt);
    const threeHoursAgo = new Date(builtAt.getTime() - 3 * 3_600_000).toISOString();
    await mockApi(page, { feeds: json([item(threeHoursAgo)], 200, { 'X-Unreached-Suppliers': '' }) });
    await at(page, 0);
    await page.goto('/');

    await expect(page.locator('third-party-components .incidents-daily__incident__update__timestamp')).toHaveText(
      `${utcTimestamp(threeHoursAgo)} · 3 hr. ago`,
    );
  });
});

test.describe('relative time', () => {
  test('follows the clock without a reload', async ({ page }) => {
    const { slug } = fixture('open');
    await at(page, 0);
    await page.goto(`/incidents/${slug}/`);
    const newest = page.locator('.incident-details__update__timestamp relative-time').first();

    await expect(newest).toHaveText('· 1 hr. ago');

    await page.clock.fastForward('59:00');
    await expect(newest).toHaveText('· 1 hr. ago');

    await page.clock.fastForward('02:00');
    await expect(newest).toHaveText('· 2 hr. ago');

    await page.clock.fastForward('24:00:00');
    await expect(newest).toHaveText('· 1 day ago');
  });

  test('counts seconds and minutes for an update that is new', async ({ page }) => {
    const item = {
      title: 'Slow API',
      date: manifest().builtAt,
      url: 'https://stspg.io/abc',
      description: 'Text.',
      status: 'Investigating',
      ongoing: true,
      source: { name: 'Mux', homepageUrl: 'https://status.mux.com/' },
    };
    await mockApi(page, { feeds: json([item], 200, { 'X-Unreached-Suppliers': '' }) });
    await at(page, 0);
    await page.goto('/');
    const relative = page.locator('third-party-components relative-time');

    // The load of the page takes some seconds of the clock too.
    await page.clock.runFor(5_000);
    await expect(relative).toHaveText(/^\s*· ([5-9]|[1-3]\d) sec\. ago$/);

    await page.clock.fastForward('03:00');
    await expect(relative).toHaveText('· 3 min. ago');
  });

  test('stays correct on a page that was built days ago', async ({ page }) => {
    const { slug } = fixture('open');
    await at(page, 5 * 24 * 60);
    await page.goto(`/incidents/${slug}/`);

    await expect(page.locator('.incident-details__update__timestamp relative-time')).toHaveText([
      '· 5 days ago',
      '· 5 days ago',
    ]);
  });

  test('is not on a date heading', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.locator('.incidents-daily__day__title relative-time')).toHaveCount(0);
    await page.goto('/history/');
    await expect(page.locator('.history__month__title relative-time')).toHaveCount(0);
  });
});

test.describe('without JavaScript', () => {
  test('shows the UTC time alone', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const { slug, file } = fixture('open');
    await page.goto(`/incidents/${slug}/`);

    await expect(page.locator('.incident-details__update__timestamp')).toHaveText([
      `Posted at ${utcTimestamp(file.updates[1].date)}`,
      `Posted at ${utcTimestamp(file.updates[0].date)}`,
    ]);
    await context.close();
  });
});

test.describe('in a browser without Intl.RelativeTimeFormat', () => {
  test('shows the UTC time alone, and the page has no error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      // @ts-expect-error: an old browser does not have it.
      delete Intl.RelativeTimeFormat;
    });
    const { slug, file } = fixture('open');
    await page.goto(`/incidents/${slug}/`);

    await expect(page.locator('.incident-details__update__timestamp').first()).toHaveText(
      `Posted at ${utcTimestamp(file.updates[1].date)}`,
    );
    expect(errors).toEqual([]);
  });
});

test.describe('dates', () => {
  test('incident history: the 7 days are UTC days', async ({ page }) => {
    const builtAt = new Date(manifest().builtAt);
    await mockApi(page);
    await page.goto('/');
    const expected = Array.from({ length: 7 }, (_, i) => utcDate(new Date(builtAt.getTime() - i * 86_400_000)));

    await expect(page.locator('#incident-history .incidents-daily__day__title')).toHaveText(expected);
  });

  test('incident history: an incident is under the UTC day of its first update', async ({ page }) => {
    const { file } = fixture('resolved');
    await mockApi(page);
    await page.goto('/');
    const day = page.locator('#incident-history .incidents-daily__day', {
      has: page.locator('.incidents-daily__day__title', { hasText: utcDate(new Date(file.updates[0].date)) }),
    });

    // Another fixture can have the same UTC day, at some hours of the day.
    await expect(day).toHaveCount(1);
    await expect(day.locator('.incidents-daily__incident__title', { hasText: file.name })).toHaveCount(1);

    const others = page.locator('#incident-history .incidents-daily__day').filter({ hasNot: page.locator('.incidents-daily__day__title', { hasText: utcDate(new Date(file.updates[0].date)) }) });
    await expect(others.locator('.incidents-daily__incident__title', { hasText: file.name })).toHaveCount(0);
  });

  test('component status: the last bar is the UTC day of now', async ({ page }) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    await mockApi(page, {
      componentStatus: json(
        components({ cma: { regions: [region('global', 'up', [{ date: today, downtime: 3600 }])], totalDowntime: 3600 } }),
      ),
    });
    await page.goto('/');
    const card = page.locator('.component-status').nth(1);

    await expect(card.locator('rect').last()).toHaveAttribute('data-date', `${today}T00:00:00.000Z`);
    await card.locator('rect').last().hover();
    await expect(card.locator('.daily-outage-tooltip-date')).toHaveText(utcDate(now));
    await expect(card.locator('.daily-outage-tooltip-content')).toHaveText('1 hour of outage');
  });

  test('system metrics: the axis and the tooltip are in UTC', async ({ page }) => {
    await mockApi(page, { cloudwatch: json(metric(123)) });
    await page.goto('/');
    const chart = page.locator('.system-metric').first();

    // The points of the fixture are from 10:00 to 10:50 UTC. Tokyo time is 19:00 to 19:50.
    await expect(chart.locator('.ct-label.ct-horizontal').first()).toHaveText('10:00');
    await chart.locator('.ct-point').first().hover({ force: true });
    await expect(chart.locator('.chartist-tooltip-timestamp')).toHaveText('Tuesday, Sep 1, 10:00 UTC');
  });
});

test.describe('the hint in UTC mode', () => {
  const HINT = 'Dates & times in UTC. Switch to local?';

  test('is below the title of each section that has dates without a zone', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    for (const id of ['component-status', 'system-metrics', 'incident-history']) {
      await expect(page.locator(`#${id} .section-hint`), id).toHaveText(HINT);
    }

    await page.goto('/history/');
    await expect(page.locator('.history__header .section-hint')).toHaveText(HINT);
  });

  test('is on an incident page too, so that a visitor can switch there', async ({ page }) => {
    await page.goto(`/incidents/${fixture('open').slug}/`);

    await expect(page.locator('.section-hint')).toHaveText([HINT]);
  });

  test('is not in a section where each time says UTC itself', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.locator('#third-party-components .section-hint')).toHaveCount(0);
    await expect(page.locator('.unresolved-incidents .section-hint')).toHaveCount(0);
  });

  test('is small, in the colour of a hint', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const hint = page.locator('#incident-history .section-hint');

    await expect(hint).toHaveCSS('font-size', '13px');
    await expect(hint).toHaveCSS('color', 'rgb(153, 153, 153)');
  });

  test('has no switch without JavaScript, which the switch needs', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/history/');

    await expect(page.locator('.section-hint')).toHaveText('Dates & times in UTC.');
    await expect(page.locator('.section-hint button')).toHaveCount(0);
    await context.close();
  });
});
