import { expect, type Locator, type Page, test } from '@playwright/test';
import { mockApi } from './support.ts';

// The two tooltips use the caption role of the website: 13px on a phone, 14px
// from 768px. No line of a tooltip is smaller.
const fontSize = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).fontSize);

async function showTooltips(page: Page) {
  await mockApi(page);
  await page.goto('/');

  const chart = page.locator('.system-metric').first();
  await chart.locator('.ct-point').nth(2).hover({ force: true });
  await expect(chart.locator('.chartist-tooltip')).toHaveClass(/tooltip-show/);
  const metricTooltip = chart.locator('.chartist-tooltip');

  await page.locator('.component-status').first().locator('rect').last().hover();
  const statusTooltip = page.locator('.daily-outage-tooltip');
  await expect(statusTooltip).toHaveCount(1);

  return { metricTooltip, statusTooltip };
}

for (const [device, width, size] of [
  ['a phone', 390, '13px'],
  ['a desktop', 1280, '14px'],
] as const) {
  test(`gives both tooltips the caption size on ${device}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const { metricTooltip, statusTooltip } = await showTooltips(page);

    for (const line of [
      statusTooltip.locator('.daily-outage-tooltip-date'),
      statusTooltip.locator('.daily-outage-tooltip-content p').first(),
      metricTooltip.locator('.chartist-tooltip-timestamp'),
      metricTooltip.locator('.chartist-tooltip-value'),
    ]) {
      expect(await fontSize(line)).toBe(size);
    }
  });
}
