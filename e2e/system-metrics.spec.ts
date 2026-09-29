import { expect, test } from '@playwright/test';
import { html, json, metric, mockApi } from './support.ts';

const average = '.system-metric__avg';

test('shows both metrics with their value and a chart', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(page.locator('.system-metric__name')).toHaveText([
    'Content Delivery API response time',
    'API success rate',
  ]);
  await expect(page.locator(average)).toHaveText(['123ms', '99.98%']);
  await expect(page.locator('.system-metric svg.ct-chart-line')).toHaveCount(2);
  await expect(page.locator('.system-metric').first().locator('.ct-point')).toHaveCount(6);
});

test('loads the metrics again for another period', async ({ page }) => {
  const periods: string[] = [];
  await mockApi(page, {
    cloudwatch: (route) => {
      const { searchParams } = new URL(route.request().url());
      periods.push(`${searchParams.get('graph')}:${searchParams.get('time')}`);
      return json(metric(searchParams.get('time') === 'week' ? 250 : 123))(route);
    },
  });
  await page.goto('/');
  await expect(page.locator(average).first()).toHaveText('123ms');

  await page.getByRole('button', { name: 'Week' }).click();

  await expect(page.locator(average).first()).toHaveText('250ms');
  await expect(page.getByRole('button', { name: 'Week' })).toHaveClass(/is-active/);
  await expect(page.getByRole('button', { name: 'Day' })).not.toHaveClass(/is-active/);
  expect(periods.sort()).toEqual([
    'api.successRate:day',
    'api.successRate:week',
    'cda.responseTime:day',
    'cda.responseTime:week',
  ]);
});

test('shows the value of a point on hover', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const chart = page.locator('.system-metric').first();

  await chart.locator('.ct-point').nth(2).hover({ force: true });

  await expect(chart.locator('.chartist-tooltip-value')).toHaveText('Response time: 123ms');
  await expect(chart.locator('.chartist-tooltip-timestamp')).toHaveText('Tuesday, Sep 1, 10:20 UTC');
});

for (const [name, reply] of [
  ['the keys are not set', json({ error: 'not_configured', missing: ['CLOUDWATCH_AWS_ACCESS_KEY_ID'], environment: 'netlify' }, 503)],
  ['AWS rejects the keys', json({ error: 'upstream_error', service: 'AWS CloudWatch', code: 'InvalidClientTokenId' }, 502)],
  ['the host gives an error page', html(504)],
  ['the body is not complete', (route: import('@playwright/test').Route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"global": 12' })],
] as const) {
  test(`gives a neutral message in production when ${name}`, async ({ page }) => {
    await mockApi(page, { cloudwatch: reply });
    await page.goto('/');

    await expect(page.locator(average)).toHaveText(Array(2).fill('Metrics temporarily unavailable.'));
    await expect(page.locator('.system-metrics')).not.toContainText('CLOUDWATCH');
    await expect(page.locator('.system-metrics')).not.toContainText('InvalidClientTokenId');
    await expect(page.locator('.system-metric svg')).toHaveCount(0);
  });
}

test('logs the precise cause, which the page does not show', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (message) => message.type() === 'warning' && warnings.push(message.text()));
  await mockApi(page, {
    cloudwatch: json({ error: 'upstream_error', service: 'AWS CloudWatch', code: 'InvalidClientTokenId' }, 502),
  });
  await page.goto('/');
  await expect(page.locator(average).first()).toHaveText('Metrics temporarily unavailable.');

  expect(warnings).toContain('Metrics unavailable: AWS CloudWatch rejected the request (InvalidClientTokenId).');
});

test('says on the static mirror that it has no metrics', async ({ page }) => {
  await page.route('**/api/feeds', json([]));
  await page.goto('/');

  const notice = page.locator('#system-metrics .mirror-notice');

  await expect(notice).toHaveText('System metrics are not available on this static mirror. See the main status page.');
  await expect(notice.getByRole('link', { name: 'the main status page' })).toHaveAttribute(
    'href',
    'https://status.datocms.com/#system-metrics',
  );
  // One notice for the section: no empty chart, no "Loading...", no period to choose.
  await expect(page.locator('.system-metric')).toHaveCount(0);
  await expect(page.locator('.system-metrics__period')).toHaveCount(0);
  await expect(page.locator('#system-metrics')).not.toContainText('Loading');
});

test.describe('one chart for each metric', () => {
  /** Replies after a delay, so that a second request starts before the first one ends. */
  const slow = (delay: number) => async (route: import('@playwright/test').Route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(metric(123)) });
  };

  const expectOneChartEach = async (page: import('@playwright/test').Page) => {
    await expect(page.locator('.system-metric').first().locator('svg.ct-chart-line')).toHaveCount(1);
    await page.waitForTimeout(900);
    for (const metricBox of await page.locator('.system-metric').all()) {
      await expect(metricBox.locator('svg.ct-chart-line')).toHaveCount(1);
      await expect(metricBox.locator('.ct-chart')).toHaveCount(1);
    }
  };

  test('after two fast switches of the time mode', async ({ page }) => {
    await mockApi(page, { cloudwatch: slow(300) });
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to local?' }).first().click();
    await page.getByRole('button', { name: 'Switch to UTC?' }).first().click();
    await page.getByRole('button', { name: 'Switch to local?' }).first().click();

    await expectOneChartEach(page);
    await expect(page.locator('.system-metric .ct-label.ct-horizontal').first()).not.toHaveText('10:00');
  });

  test('after fast clicks on the periods', async ({ page }) => {
    await mockApi(page, { cloudwatch: slow(300) });
    await page.goto('/');
    await page.getByRole('button', { name: 'Week' }).click();
    await page.getByRole('button', { name: 'Month' }).click();
    await page.getByRole('button', { name: 'Day' }).click();

    await expectOneChartEach(page);
    await expect(page.getByRole('button', { name: 'Day' })).toHaveClass(/is-active/);
  });

  test('shows the reply of the last request, not of the slowest one', async ({ page }) => {
    await mockApi(page, {
      cloudwatch: async (route) => {
        const time = new URL(route.request().url()).searchParams.get('time');
        // The reply for "week" comes after the reply for "month".
        await new Promise((resolve) => setTimeout(resolve, time === 'week' ? 600 : 100));
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(metric(time === 'week' ? 700 : time === 'month' ? 300 : 123)) });
      },
    });
    await page.goto('/');
    await expect(page.locator('.system-metric__avg').first()).toHaveText('123ms');
    await page.getByRole('button', { name: 'Week' }).click();
    await page.getByRole('button', { name: 'Month' }).click();

    await expect(page.locator('.system-metric__avg').first()).toHaveText('300ms');
    await page.waitForTimeout(800);
    await expect(page.locator('.system-metric__avg').first()).toHaveText('300ms');
    await expectOneChartEach(page);
  });
});
