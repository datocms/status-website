import { expect, test, type Page } from '@playwright/test';
import { fixture, mockApi, serveAs } from './support.ts';

const MAIN = 'https://status.datocms.com';
const MIRROR = 'https://status2.datocms.com';

const hosts = (page: Page) => page.locator('.page-footer__other');
const main = (page: Page) => hosts(page).getByRole('link', { name: 'Main' });
const mirror = (page: Page) => hosts(page).getByRole('link', { name: 'Static Mirror' });

const open = async (page: Page, hostname: string, path = '/') => {
  const origin = await serveAs(page, hostname);
  await mockApi(page);
  await page.goto(`${origin}${path}`);
};

test('links to both hosts', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main / Static Mirror');
  await expect(main(page)).toHaveAttribute('href', `${MAIN}/`);
  await expect(mirror(page)).toHaveAttribute('href', `${MIRROR}/`);
});

test('marks no host on a host that it does not know', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(hosts(page)).not.toContainText('this page');
  await expect(hosts(page).locator('[aria-current]')).toHaveCount(0);
});

for (const hostname of ['status.datocms.com', 'datocms-status.com', 'www.datocms-status.com']) {
  test(`marks the main host on ${hostname}`, async ({ page }) => {
    await open(page, hostname);

    await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main (this page) / Static Mirror');
    await expect(main(page)).toHaveAttribute('aria-current', 'page');
    await expect(mirror(page)).not.toHaveAttribute('aria-current');
  });
}

test('marks the mirror on status2.datocms.com', async ({ page }) => {
  await open(page, 'status2.datocms.com');

  await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main / Static Mirror (this page)');
  await expect(mirror(page)).toHaveAttribute('aria-current', 'page');
  await expect(main(page)).not.toHaveAttribute('aria-current');
});

test('links to the same incident on the other host', async ({ page }) => {
  const path = `/incidents/${fixture('open').slug}/`;
  await open(page, 'status2.datocms.com', path);

  await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main / Static Mirror (this page)');
  await expect(main(page)).toHaveAttribute('href', `${MAIN}${path}`);
  await expect(mirror(page)).toHaveAttribute('href', `${MIRROR}${path}`);
});

test('links to the address that the reader asked for, on the 404 page', async ({ page }) => {
  await open(page, 'status.datocms.com', '/incidents/2020-01-01-no-such-incident/');

  await expect(page.getByText('Page not found.')).toBeVisible();
  await expect(mirror(page)).toHaveAttribute('href', `${MIRROR}/incidents/2020-01-01-no-such-incident/`);
});

test('works without JavaScript, then with no mark', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const path = `/incidents/${fixture('resolved').slug}/`;
  await page.goto(path);

  await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main / Static Mirror');
  await expect(main(page)).toHaveAttribute('href', `${MAIN}${path}`);
  await expect(mirror(page)).toHaveAttribute('href', `${MIRROR}${path}`);
  await context.close();
});

test('keeps the link to the history beside the hosts', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(page.locator('.page-footer__link a')).toHaveText('Incident History');
  await expect(main(page)).toHaveCSS('color', 'rgb(153, 153, 153)');
  await expect(main(page)).toHaveCSS('text-decoration-line', 'underline');
});

test('keeps each name on one line on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 700 });
  await mockApi(page);
  await page.goto('/');

  for (const link of [main(page), mirror(page)]) {
    await expect(link).toHaveCSS('white-space', 'nowrap');
    expect((await link.boundingBox())!.height).toBeLessThan(25);
  }
});

test.describe('the link back', () => {
  for (const [name, path] of [
    ['an incident page', () => `/incidents/${fixture('open').slug}/`],
    ['a history page', () => '/history/'],
    ['an older history page', () => '/history/page/1/'],
    ['the 404 page', () => '/no-such-page/'],
  ] as const) {
    test(`${name} has "Back to status page", and the links to both hosts`, async ({ page }) => {
      await mockApi(page);
      await page.goto(path());
      const back = page.locator('.page-footer__link a');

      await expect(back).toHaveText('Back to status page');
      await expect(page.locator('body')).not.toContainText('Current Status');
      await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main / Static Mirror');

      await back.click();
      await expect(page).toHaveURL(/localhost:\d+\/$/);
      await expect(page.locator('#incident-history')).toBeVisible();
    });
  }

  test('the homepage links to the history', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.locator('.page-footer__link a')).toHaveText('Incident History');
    await expect(page.locator('.page-footer__link a')).toHaveAttribute('href', '/history/');
  });

  test('a history page links to the same page on the other host', async ({ page }) => {
    await serveAs(page, 'status2.datocms.com');
    await page.goto('http://status2.datocms.com/history/page/1/');

    await expect(hosts(page)).toHaveText('DatoCMS Status Page: Main / Static Mirror (this page)');
    await expect(main(page)).toHaveAttribute('href', `${MAIN}/history/page/1/`);
  });
});

test.describe('the mirror notice', () => {
  const notices = (page: Page) => page.locator('.mirror-notice');

  test('links to the main host from the mirror', async ({ page }) => {
    await serveAs(page, 'status2.datocms.com');
    await page.goto('http://status2.datocms.com/');

    await expect(notices(page)).toHaveCount(3);
    await expect(notices(page).getByRole('link')).toHaveCount(3);
  });

  test('does not link to itself when the mirror serves the main address', async ({ page }) => {
    // The fallback procedure points status.datocms.com at the static mirror.
    await serveAs(page, 'status.datocms.com');
    await page.goto('http://status.datocms.com/');

    await expect(notices(page)).toHaveText([
      'Component status is not available while this site runs from its static mirror.',
      'System metrics are not available while this site runs from its static mirror.',
      'Third-party status is not available while this site runs from its static mirror.',
    ]);
    await expect(notices(page).getByRole('link')).toHaveCount(0);
  });
});
