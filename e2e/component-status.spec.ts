import { expect, test } from '@playwright/test';
import { components, dayStamp, html, json, mockApi, region } from './support.ts';

const cards = '.component-status';

/** A reply that says JSON, with a body that stops in the middle. */
const brokenJson = (route: import('@playwright/test').Route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '[{"id": "cda", "regio' });
const GREEN = '#2fcc66';
const YELLOW = '#f1c40f';
const GREY = '#eee';

test('shows the six components as operational', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(page.locator(`${cards} .component-status__name`)).toHaveText([
    'Content Delivery API',
    'Content Management API',
    'Assets CDN (Imgix)',
    'Projects administrative interface',
    'Account dashboard interface',
    'Website',
  ]);
  await expect(page.locator(`${cards} .component-status__status`)).toHaveText(Array(6).fill('Operational'));
  await expect(page.locator(`${cards} .component-status__uptime`)).toHaveText(Array(6).fill(/^100%\suptime$/));

  const bars = page.locator(cards).first().locator('rect');
  await expect(bars).toHaveCount(60);
  await expect(bars.first()).toHaveAttribute('fill', GREEN);
});

test('asks for the days that the page shows', async ({ page }) => {
  await mockApi(page);
  const request = page.waitForRequest('**/api/component-status*');
  await page.goto('/');

  expect(new URL((await request).url()).searchParams.get('days')).toBe('60');
});

test('marks a day with downtime and gives its duration', async ({ page }) => {
  const today = dayStamp(new Date());
  await mockApi(page, {
    componentStatus: json(
      components({
        cma: { regions: [region('global', 'up', [{ date: today, downtime: 3600 }])], totalDowntime: 3600 },
      }),
    ),
  });
  await page.goto('/');
  const card = page.locator(cards).nth(1);

  await expect(card.locator('rect').last()).toHaveAttribute('fill', YELLOW);
  await expect(card.locator('rect').first()).toHaveAttribute('fill', GREEN);
  await expect(card.locator('.component-status__uptime')).toHaveText(/^99\.931%\suptime$/);

  await card.locator('rect').last().hover();
  await expect(card.locator('.daily-outage-tooltip-content')).toHaveText('1 hour of outage');

  await card.locator('rect').first().hover();
  await expect(card.locator('.daily-outage-tooltip-content')).toHaveText('No downtime reported for this day');
});

test('names the regions of an outage when a component has many', async ({ page }) => {
  const today = dayStamp(new Date());
  await mockApi(page, {
    componentStatus: json(
      components({
        cda: {
          regions: [
            region('asia', 'up', [{ date: today, downtime: 120 }]),
            region('europe', 'up', [{ date: today, downtime: 1800 }]),
            region('oceania'),
          ],
          totalDowntime: 1800,
        },
      }),
    ),
  });
  await page.goto('/');
  const card = page.locator(cards).first();

  await card.locator('rect').last().hover();
  await expect(card.locator('.daily-outage-tooltip-content-region')).toHaveText([
    '2 minutes of outage in Asia',
    '30 minutes of outage in Europe',
  ]);
});

test('shows an outage that continues now', async ({ page }) => {
  await mockApi(page, {
    componentStatus: json(components({ site: { regions: [region('global', 'down')], totalDowntime: 600 } })),
  });
  await page.goto('/');
  const card = page.locator(cards).nth(5);

  await expect(card).toHaveClass(/component-status--status-down/);
  await expect(card.locator('.component-status__status')).toHaveText('Outage');
});

test('says "No data", and not "no downtime", for a component without data', async ({ page }) => {
  await mockApi(page, {
    componentStatus: json(components({ cma: { regions: [region('global', 'unknown')] } })),
  });
  await page.goto('/');
  const card = page.locator(cards).nth(1);

  await expect(card).toHaveClass(/component-status--status-unknown/);
  await expect(card.locator('.component-status__status')).toHaveText('Unknown');
  await expect(card.locator('.component-status__uptime')).toHaveText('No data');
  await expect(card.locator('rect').last()).toHaveAttribute('fill', GREY);

  await card.locator('rect').last().hover();
  await expect(card.locator('.daily-outage-tooltip-content')).toHaveText('No data for this day');

  await expect(page.locator(cards).nth(2).locator('.component-status__status')).toHaveText('Operational');
});

test('names the regions that gave no data, and does not call them an outage', async ({ page }) => {
  await mockApi(page, {
    componentStatus: json(
      components({
        cda: { regions: [region('asia'), region('europe', 'unknown'), region('africa', 'unknown')] },
      }),
    ),
  });
  await page.goto('/');
  const card = page.locator(cards).first();

  await expect(card.locator('.component-status__status')).toHaveText('Operational');
  await expect(card).toHaveAttribute('title', 'No data for Europe, Africa');

  await card.locator('rect').last().hover();
  await expect(card.locator('.daily-outage-tooltip-content')).toContainText('No downtime reported for this day');
  await expect(card.locator('.daily-outage-tooltip-content-region')).toHaveText('No data for Europe, Africa');
});

test('removes the tooltip when the pointer leaves the day', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const card = page.locator(cards).first();

  await card.locator('rect').nth(30).hover();
  await expect(page.locator('.daily-outage-tooltip')).toHaveCount(1);

  await page.locator('.components-status__title').hover();
  await expect(page.locator('.daily-outage-tooltip')).toHaveCount(0);
});

for (const [name, reply] of [
  ['the uptime monitor gave no data', json({ error: 'StatusCake gave no data for any check' }, 503)],
  ['the token is not set', json({ error: 'not_configured', missing: ['STATUSCAKE_API_TOKEN'], environment: 'netlify' }, 503)],
  ['the host gives an error page', html(502)],
  ['the reply is not a list', json({ unexpected: true })],
  ['the body is not complete', brokenJson],
] as const) {
  test(`says that the monitor, not DatoCMS, is unavailable when ${name}`, async ({ page }) => {
    await mockApi(page, { componentStatus: reply });
    await page.goto('/');

    await expect(page.locator('.components-status__unavailable')).toContainText(
      'Component status is momentarily unavailable, because our uptime monitor does not reply.',
    );
    await expect(page.locator(cards)).toHaveCount(0);
    await expect(page.locator('.components-status')).not.toContainText('STATUSCAKE_API_TOKEN');
    await expect(page.locator('.components-status')).not.toContainText('static mirror');
  });
}

test('says on the static mirror that it has no component status', async ({ page }) => {
  // No reply given: the static host answers 404, as GitHub Pages does.
  await page.route('**/api/feeds', json([]));
  await page.goto('/');

  const notice = page.locator('#component-status .mirror-notice');

  await expect(notice).toHaveText('Component status is not available on this static mirror. See the main status page.');
  await expect(notice.getByRole('link', { name: 'the main status page' })).toHaveAttribute(
    'href',
    'https://status.datocms.com/#component-status',
  );
  await expect(page.locator('.component-status')).toHaveCount(0);
  await expect(page.locator('#component-status')).not.toContainText('uptime monitor');
  await expect(page.locator('.unresolved-incident')).toHaveCount(3);
});
