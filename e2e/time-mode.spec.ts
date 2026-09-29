/**
 * The switch between UTC and local time. Each test gives the browser a
 * language and a zone, and asks that same browser for the text that it
 * expects, so a test does not depend on the language data of Node.
 */
import { expect, test, type Browser, type Page } from '@playwright/test';
import { components, fixture, json, manifest, metric, mockApi, region } from './support.ts';

const UTC_HINT = 'Dates & times in UTC. Switch to local?';
const LOCAL_HINT = 'Showing local times where possible. Switch to UTC?';

const VISITORS = [
  { name: 'United States', locale: 'en-US', timezoneId: 'America/Los_Angeles', sample: /^[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} [AP]M P[DS]T$/ },
  { name: 'Italy', locale: 'it-IT', timezoneId: 'Europe/Rome', sample: /^\d{1,2} [a-z]{3}, \d{2}:\d{2} CES?T$/ },
  { name: 'Japan', locale: 'ja-JP', timezoneId: 'Asia/Tokyo', sample: /^\d{1,2}月\d{1,2}日 \d{1,2}:\d{2} JST$/ },
] as const;

const visit = async (browser: Browser, visitor: { locale: string; timezoneId: string }) => {
  const context = await browser.newContext(visitor);
  const page = await context.newPage();
  await mockApi(page);
  return page;
};

/** What the browser of the visitor gives for an instant. */
const local = (page: Page, iso: string, options: Intl.DateTimeFormatOptions) =>
  page.evaluate(([value, o]) => new Intl.DateTimeFormat(undefined, o).format(new Date(value)), [iso, options] as const);

const TIMESTAMP: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' };

const switchToLocal = (page: Page) => page.getByRole('button', { name: 'Switch to local?' }).first().click();
const switchToUtc = (page: Page) => page.getByRole('button', { name: 'Switch to UTC?' }).first().click();

for (const visitor of VISITORS) {
  test(`${visitor.name}: timestamps get the zone and the habits of the visitor`, async ({ browser }) => {
    const page = await visit(browser, visitor);
    const { slug, file } = fixture('open');
    await page.goto(`/incidents/${slug}/`);
    const times = page.locator('.incident-details__update__timestamp time');
    const utc = await times.allInnerTexts();

    expect(utc.every((text) => text.endsWith(' UTC'))).toBe(true);

    await switchToLocal(page);

    const expected = [await local(page, file.updates[1].date, TIMESTAMP), await local(page, file.updates[0].date, TIMESTAMP)];
    await expect(times).toHaveText(expected);
    expect(expected[0].replace(/[  ]/g, ' ')).toMatch(visitor.sample);
    expect(expected[0]).not.toContain('UTC');

    await switchToUtc(page);
    await expect(times).toHaveText(utc);
    await page.context().close();
  });
}

test.describe('the switch', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

  test('changes every hint of the page, and changes back', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const hints = page.locator('.section-hint');

    await expect(hints).toHaveText([UTC_HINT, UTC_HINT, UTC_HINT]);
    await switchToLocal(page);
    await expect(hints).toHaveText([LOCAL_HINT, LOCAL_HINT, LOCAL_HINT]);
    await switchToUtc(page);
    await expect(hints).toHaveText([UTC_HINT, UTC_HINT, UTC_HINT]);
  });

  test('is a button with a name, which the keyboard can use', async ({ page }) => {
    await mockApi(page);
    await page.goto('/history/');
    const button = page.getByRole('button', { name: 'Switch to local?' });

    await button.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('.section-hint')).toHaveText(LOCAL_HINT);
    await expect(page.getByRole('button', { name: 'Switch to UTC?' })).toBeVisible();
  });

  test('keeps the instant of each date for a program', async ({ page }) => {
    const { slug, file } = fixture('open');
    await page.goto(`/incidents/${slug}/`);
    await switchToLocal(page);

    await expect(page.locator('.incident-details__update__timestamp time').first()).toHaveAttribute('datetime', file.updates[1].date);
  });

  test('leaves the relative time as it is', async ({ page }) => {
    const { slug } = fixture('open');
    await page.clock.install({ time: new Date(manifest().builtAt) });
    await page.goto(`/incidents/${slug}/`);
    await switchToLocal(page);

    await expect(page.locator('.incident-details__update__timestamp relative-time')).toHaveText(['· 1 hr. ago', '· 2 hr. ago']);
  });
});

test.describe('the choice of the visitor', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

  test('stays for the next page and after a reload', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await switchToLocal(page);

    await page.reload();
    await expect(page.locator('.section-hint').first()).toHaveText(LOCAL_HINT);
    await expect(page.locator('.unresolved-incident__update__timestamp time').first()).toHaveText(/ P[DS]T$/);

    await page.goto('/history/');
    await expect(page.locator('.section-hint')).toHaveText(LOCAL_HINT);

    await page.goto(`/incidents/${fixture('open').slug}/`);
    await expect(page.locator('.incident-details__update__timestamp time').first()).toHaveText(/ P[DS]T$/);
  });

  test('is in the storage of the browser', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    expect(await page.evaluate(() => localStorage.getItem('status:time-mode'))).toBeNull();

    await switchToLocal(page);
    expect(await page.evaluate(() => localStorage.getItem('status:time-mode'))).toBe('local');

    await switchToUtc(page);
    expect(await page.evaluate(() => localStorage.getItem('status:time-mode'))).toBe('utc');
  });

  test('is UTC for a new visitor', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.locator('.section-hint').first()).toHaveText(UTC_HINT);
    await expect(page.locator('.unresolved-incident__update__timestamp time').first()).toHaveText(/ UTC$/);
  });

  test('works in a browser that refuses the storage', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('storage is off'); } });
    });
    await mockApi(page);
    await page.goto('/');
    await switchToLocal(page);

    await expect(page.locator('.section-hint').first()).toHaveText(LOCAL_HINT);
    await expect(page.locator('.unresolved-incident__update__timestamp time').first()).toHaveText(/ P[DS]T$/);
    expect(errors).toEqual([]);
  });
});

test.describe('in local mode', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

  test('a date that has no local form stays in UTC, and says so', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const days = page.locator('#incident-history .incidents-daily__day__title');
    const utc = await days.allInnerTexts();

    expect(utc.some((text) => text.includes('UTC'))).toBe(false);
    await switchToLocal(page);
    await expect(days).toHaveText(utc.map((text) => `${text} (UTC)`));

    await switchToUtc(page);
    await expect(days).toHaveText(utc);
  });

  test('the months of the history say UTC', async ({ page }) => {
    await page.goto('/history/');
    const months = page.locator('.history__month__title');
    const utc = await months.allInnerTexts();
    await switchToLocal(page);

    await expect(months).toHaveText(utc.map((text) => `${text} (UTC)`));
    await expect(page.locator('.history__header__nav span')).toHaveText(`${utc[0]} (UTC) to ${utc[2]} (UTC)`);
  });

  test('the history shows the first and the last update in local time', async ({ page }) => {
    const { file } = fixture('resolved');
    await page.goto('/history/');
    await switchToLocal(page);
    const stamp = page.locator('.history__incident', { hasText: file.name }).locator('.history__incident__timestamp time');

    await expect(stamp).toHaveText([
      await local(page, file.updates[0].date, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      await local(page, file.updates[1].date, TIMESTAMP),
    ]);
  });

  test('a maintenance window is in local time, and keeps its links', async ({ page }) => {
    const { slug, file } = fixture('futureMaintenance');
    const start = file.scheduledTime!;
    const end = new Date(new Date(start).getTime() + Number(file.minutes) * 60_000).toISOString();
    await page.clock.install({ time: new Date(new Date(manifest().builtAt).getTime() - 3_600_000) });
    await page.goto(`/incidents/${slug}/`);
    await switchToLocal(page);
    const row = page.locator('.incident-details__summary__row').first();
    const clock: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    const zone = (await local(page, start, { timeZoneName: 'short' })).split(', ').at(-1);

    await expect(row).toHaveText(
      `Scheduled for: ${await local(page, start, { month: 'short', day: 'numeric' })}, ${await local(page, start, clock)} - ${await local(page, end, clock)} ${zone} · in 3 days`,
    );
    await expect(row.getByRole('link')).toHaveCount(2);
    await expect(row.getByRole('link').first()).toHaveAttribute('href', /^https:\/\/timee\.io\/\d{8}T\d{4}\?tl=/);
  });

  test('a third-party item, which comes after the load, is in local time', async ({ page }) => {
    const date = new Date(new Date(manifest().builtAt).getTime() - 3 * 3_600_000).toISOString();
    await page.addInitScript(() => localStorage.setItem('status:time-mode', 'local'));
    await mockApi(page, {
      feeds: json(
        [{ title: 'Slow API', date, url: 'https://stspg.io/abc', description: 'Text.', status: 'Investigating', ongoing: true, source: { name: 'Imgix', homepageUrl: 'https://status.imgix.com/' } }],
        200,
        { 'X-Unreached-Suppliers': '' },
      ),
    });
    await page.goto('/');

    await expect(page.locator('third-party-components time')).toHaveText(await local(page, date, TIMESTAMP));
  });

  test('the days of the component status are UTC days, and the tooltip says so', async ({ page }) => {
    const today = new Date().toISOString().slice(0, 10);
    await mockApi(page, {
      componentStatus: json(components({ cma: { regions: [region('global', 'up', [{ date: today, downtime: 3600 }])], totalDowntime: 3600 } })),
    });
    await page.goto('/');
    await switchToLocal(page);
    const card = page.locator('.component-status').nth(1);

    await card.locator('rect').last().hover();
    await expect(card.locator('.daily-outage-tooltip-date')).toHaveText(/^[A-Z][a-z]+ \d{1,2}, \d{4} \(UTC\)$/);
    await expect(card.locator('.daily-outage-tooltip-content')).toHaveText('1 hour of outage');
  });

  test('a chart has its axis and its tooltip in local time', async ({ page }) => {
    await mockApi(page, { cloudwatch: json(metric(123)) });
    await page.goto('/');
    const chart = page.locator('.system-metric').first();
    const firstPoint = '2026-09-01T10:00:00.000Z';

    await expect(chart.locator('.ct-label.ct-horizontal').first()).toHaveText('10:00');
    await switchToLocal(page);

    // 10:00 UTC is 3:00 AM in Los Angeles.
    await expect(chart.locator('.ct-label.ct-horizontal').first()).toHaveText(await local(page, firstPoint, { hour: 'numeric', minute: '2-digit' }));
    await expect(chart.locator('.ct-label.ct-horizontal').first()).toHaveText(/^3:00\sAM$/);

    await chart.locator('.ct-point').first().hover({ force: true });
    await expect(chart.locator('.chartist-tooltip-timestamp')).toHaveText(
      await local(page, firstPoint, { weekday: 'long', ...TIMESTAMP }),
    );

    await switchToUtc(page);
    await expect(chart.locator('.ct-label.ct-horizontal').first()).toHaveText('10:00');
  });
});

test.describe('the place of the hint', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });

  /** Each hint, with what is before and after it, as boxes on the page. */
  const boxes = (page: Page) =>
    page.locator('.section-hint').evaluateAll((hints) =>
      hints.map((hint) => {
        const box = (element: Element | null) => {
          if (!element) return null;
          const { top, bottom, left, right } = element.getBoundingClientRect();
          return { top, bottom, left, right };
        };
        const shown = (element: Element | null): Element | null =>
          element && element.getBoundingClientRect().height === 0 ? null : element;

        return {
          hint: box(hint)!,
          before: box(shown(hint.previousElementSibling)),
          after: box(shown(hint.nextElementSibling)),
          page: document.documentElement.clientWidth,
        };
      }),
    );

  const overlap = (a: { top: number; bottom: number; left: number; right: number }, b: typeof a) =>
    a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

  for (const width of [1000, 760, 380]) {
    for (const mode of ['utc', 'local'] as const) {
      test(`covers nothing, and nothing covers it: ${width} pixels, ${mode} mode`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((value) => localStorage.setItem('status:time-mode', value), mode);
        await mockApi(page);

        for (const path of ['/', '/history/', `/incidents/${fixture('completedMaintenance').slug}/`]) {
          await page.goto(path);
          await expect(page.locator('.section-hint button').first()).toBeVisible();
          if (path === '/') await expect(page.locator('.component-status')).toHaveCount(6);

          for (const { hint, before, after, page: pageWidth } of await boxes(page)) {
            if (before) expect(overlap(hint, before), `${path}: the hint and the element before it`).toBe(false);
            if (after) expect(overlap(hint, after), `${path}: the hint and the element after it`).toBe(false);
            expect(hint.left, path).toBeGreaterThanOrEqual(0);
            expect(hint.right, path).toBeLessThanOrEqual(pageWidth);
          }
        }
      });
    }
  }

  test('on an incident page, is close below the subtitle', async ({ page }) => {
    await page.goto(`/incidents/${fixture('completedMaintenance').slug}/`);
    const subtitle = (await page.locator('.incident-details__subtitle').boundingBox())!;
    const hint = (await page.locator('.section-hint').boundingBox())!;
    const summary = (await page.locator('.incident-details__summary').boundingBox())!;

    expect(hint.y - (subtitle.y + subtitle.height)).toBeGreaterThanOrEqual(10);
    expect(hint.y - (subtitle.y + subtitle.height)).toBeLessThanOrEqual(40);
    expect(summary.y - (hint.y + hint.height)).toBeGreaterThanOrEqual(20);
  });

  test('on a history page, is on the line of the months and their buttons', async ({ page }) => {
    await page.goto('/history/');
    const hint = (await page.locator('.history__header .section-hint').boundingBox())!;
    const nav = (await page.locator('.history__header__nav').boundingBox())!;
    const header = (await page.locator('.page-header').boundingBox())!;
    const firstMonth = (await page.locator('.history__month').first().boundingBox())!;

    expect(hint.y).toBeGreaterThanOrEqual(header.y + header.height);
    expect(hint.y + hint.height).toBeLessThanOrEqual(firstMonth.y);
    expect(nav.y + nav.height).toBeLessThanOrEqual(firstMonth.y);
    expect(Math.abs(hint.y + hint.height / 2 - (nav.y + nav.height / 2))).toBeLessThanOrEqual(2);
    expect(hint.x + hint.width).toBeLessThanOrEqual(nav.x);
  });
});
