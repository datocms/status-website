import { expect, test } from '@playwright/test';
import { fixture, json, mockApi } from './support.ts';

const h1 = (page: import('@playwright/test').Page) => page.getByRole('heading', { level: 1 });

test('the homepage has "DatoCMS Status" as its one main heading', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(h1(page)).toHaveCount(1);
  await expect(h1(page)).toHaveAccessibleName('DatoCMS Status');
  await expect(h1(page)).toBeVisible();
});

test('the heading shows the icon and the name as text, and links to the homepage', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const link = h1(page).getByRole('link', { name: 'DatoCMS Status' });

  await expect(link).toHaveAttribute('href', '/');
  await expect(link).toHaveText('DatoCMS Status');
  // The brand orange of the icon.
  await expect(link.locator('.page-header__name')).toHaveCSS('color', 'rgb(255, 119, 81)');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
});

test('the icon is a local file, and adds nothing to the name of the heading', async ({ page }) => {
  await mockApi(page);
  const icon = page.waitForResponse((response) => response.url().endsWith('/logo-icon.svg'));
  await page.goto('/');
  const image = h1(page).locator('img');

  expect((await icon).status()).toBe(200);
  expect((await icon).headers()['content-type']).toContain('image/svg+xml');
  await expect(image).toHaveAttribute('src', '/logo-icon.svg');
  await expect(image).toHaveAttribute('alt', '');
  await expect(image).toBeVisible();
  expect(await image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

  const box = (await image.boundingBox())!;
  expect(Math.round(box.height)).toBe(50);
  expect(Math.round(box.width)).toBe(50);
});

test('the homepage stays the same after the live sections get their content', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.locator('.component-status')).toHaveCount(6);

  await expect(h1(page)).toHaveCount(1);
});

test('a history page has its title as the main heading, and the same header', async ({ page }) => {
  for (const path of ['/history/', '/history/page/1/']) {
    await page.goto(path);

    await expect(h1(page)).toHaveCount(1);
    await expect(h1(page)).toHaveText('DatoCMS Status: Incident History');
    await expect(h1(page)).toHaveAccessibleName('DatoCMS Status: Incident History');
    // The name of the site goes to the homepage. The name of the page is text.
    await expect(h1(page).getByRole('link')).toHaveText('DatoCMS Status');
    await expect(h1(page).getByRole('link')).toHaveAttribute('href', '/');
    await expect(page.locator('.history h1, .history__header__title')).toHaveCount(0);
  }
});

test('an incident page has the header as the main heading, and the name of the incident below it', async ({ page }) => {
  for (const [name, title] of [
    ['open', 'DatoCMS Status: Incident Detail'],
    ['resolved', 'DatoCMS Status: Incident Detail'],
    ['completedMaintenance', 'DatoCMS Status: Maintenance'],
    ['futureMaintenance', 'DatoCMS Status: Maintenance'],
  ] as const) {
    const { slug, file } = fixture(name);
    await page.goto(`/incidents/${slug}/`);

    await expect(h1(page)).toHaveCount(1);
    await expect(h1(page)).toHaveText(title);
    await expect(h1(page)).toHaveAccessibleName(title);
    await expect(h1(page).getByRole('link')).toHaveAttribute('href', '/');
    await expect(page.locator('h2.incident-details__title')).toHaveText(file.name);
    await expect(page.getByRole('button', { name: 'Subscribe to Updates' })).toBeVisible();
  }
});

test('the 404 page keeps its own main heading', async ({ page }) => {
  await page.goto('/no-such-page/');

  await expect(h1(page)).toHaveCount(1);
  await expect(h1(page)).toHaveText('404');
  await expect(page.locator('.page-header').getByRole('link', { name: 'DatoCMS Status' })).toBeVisible();
});

test('the title of a page keeps its look as a main heading', async ({ page }) => {
  const { slug } = fixture('open');
  await page.goto(`/incidents/${slug}/`);
  await expect(page.locator('.incident-details__title')).toHaveCSS('font-size', '35px');
  await expect(page.locator('.incident-details__title')).toHaveCSS('font-weight', '500');
  await expect(page.locator('.incident-details__title')).toHaveCSS('text-align', 'center');

  // On a history page the name of the page looks the same as the name of the site.
  await page.goto('/history/');
  for (const property of ['font-size', 'font-weight', 'color', 'line-height']) {
    const name = await page.locator('.page-header__name').evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);
    await expect(page.locator('.page-header__page').last(), property).toHaveCSS(property, name);
  }
  await expect(page.locator('.page-header__page').last()).toHaveCSS('color', 'rgb(255, 119, 81)');
});

test('names the history the same way in every place', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(page.locator('#incident-history .section-title')).toHaveText('Incident History');
  await expect(page.locator('.page-footer__link a')).toHaveText('Incident History');
  await expect(page.locator('body')).not.toContainText(/Incidents History/i);
  await expect(page.locator('body')).not.toContainText(/Components Status/i);

  await page.locator('.page-footer__link a').click();
  await expect(page).toHaveTitle('Incident History - DatoCMS Status');
  await expect(h1(page)).toHaveText('DatoCMS Status: Incident History');
  await expect(page.locator('body')).not.toContainText(/Incidents History/i);
});

test('the heading and the subscribe button have the same middle line', async ({ page }) => {
  await mockApi(page);
  for (const path of ['/', '/history/']) {
    await page.goto(path);
    const middle = async (selector: string) => {
      const box = (await page.locator(selector).boundingBox())!;
      return box.y + box.height / 2;
    };

    expect(Math.abs((await middle('.page-header__logo a')) - (await middle('.subscribe__button'))), path).toBeLessThanOrEqual(1);
    expect(Math.abs((await middle('.page-header__logo img')) - (await middle('.page-header__name'))), path).toBeLessThanOrEqual(1);
  }
});

test('on a narrow screen, the button sits below the heading with a space between them', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 800 });
  await mockApi(page);
  await page.goto('/');
  const heading = (await page.locator('.page-header__logo a').boundingBox())!;
  const button = (await page.locator('.subscribe__button').boundingBox())!;

  expect(button.y - (heading.y + heading.height)).toBeGreaterThanOrEqual(20);
});

/** The headings of the page in the order of the document. Markdown of an update is left out. */
const outline = (page: import('@playwright/test').Page) =>
  page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) =>
    headings
      .filter((heading) => !heading.closest('.ugc'))
      .map((heading) => `${heading.tagName.toLowerCase()} ${heading.textContent!.trim().replace(/\s+/g, ' ')}`),
  );

const expectNoSkippedLevel = (headings: string[]) => {
  expect(headings[0]).toMatch(/^h1 /);
  expect(headings.filter((heading) => heading.startsWith('h1 '))).toHaveLength(1);

  headings.slice(1).forEach((heading, index) => {
    const level = Number(heading[1]);
    const before = Number(headings[index][1]);
    expect(level, `"${heading}" after "${headings[index]}"`).toBeLessThanOrEqual(before + 1);
  });
};

const feedItem = (ongoing: boolean) => ({
  title: ongoing ? 'Slow API' : 'Image errors',
  date: '2026-09-27T10:00:00.000Z',
  url: 'https://stspg.io/abc',
  description: 'Text.',
  status: ongoing ? 'Investigating' : 'Resolved',
  ongoing,
  source: { name: 'Mux', homepageUrl: 'https://status.mux.com/' },
});

test.describe('the outline of the headings', () => {
  test('homepage: sections are h2, their parts h3, and the items of a part h4', async ({ page }) => {
    await mockApi(page, { feeds: json([feedItem(true), feedItem(false)], 200, { 'X-Unreached-Suppliers': '' }) });
    await page.goto('/');
    await expect(page.locator('.component-status')).toHaveCount(6);
    await expect(page.locator('third-party-components .incidents-daily__incident')).toHaveCount(2);
    const headings = await outline(page);

    expectNoSkippedLevel(headings);
    expect(headings.filter((heading) => heading.startsWith('h2 '))).toEqual([
      `h2 ${fixture('open').file.name}`,
      `h2 ${fixture('markdown').file.name}`,
      `h2 ${fixture('futureMaintenance').file.name}`,
      'h2 Component Status',
      'h2 System Metrics',
      'h2 Third-Party Components',
      'h2 Incident History',
    ]);

    const under = (title: string) => {
      const start = headings.indexOf(`h2 ${title}`);
      const end = headings.findIndex((heading, index) => index > start && heading.startsWith('h2 '));
      return headings.slice(start + 1, end === -1 ? undefined : end);
    };

    expect(under('Component Status')).toEqual([
      'h3 Content Delivery API',
      'h3 Content Management API',
      'h3 Assets CDN (Imgix)',
      'h3 Projects administrative interface',
      'h3 Account dashboard interface',
      'h3 Website',
    ]);
    expect(under('System Metrics')).toEqual(['h3 Content Delivery API response time', 'h3 API success rate']);
    expect(under('Third-Party Components')).toEqual([
      'h3 Ongoing',
      'h4 Mux: Slow API',
      'h3 Recently resolved',
      'h4 Mux: Image errors',
    ]);

    const history = under('Incident History');
    expect(history.filter((heading) => heading.startsWith('h3 '))).toHaveLength(7);
    expect(history).toContain(`h4 ${fixture('resolved').file.name}`);
    expect(history.every((heading) => /^h[34] /.test(heading))).toBe(true);
  });

  test('homepage on the static mirror', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mirror-notice')).toHaveCount(3);
    const headings = await outline(page);

    expectNoSkippedLevel(headings);
    expect(headings).toContain('h2 System Metrics');
    expect(headings).toContain('h2 Third-Party Components');
  });

  test('history page: months are h2 and incidents h3', async ({ page }) => {
    await page.goto('/history/');
    const headings = await outline(page);

    expectNoSkippedLevel(headings);
    expect(headings[0]).toBe('h1 DatoCMS Status: Incident History');
    expect(headings.filter((heading) => heading.startsWith('h2 '))).toHaveLength(3);
    expect(headings).toContain(`h3 ${fixture('open').file.name}`);
    expect(headings.every((heading) => /^h[123] /.test(heading))).toBe(true);
  });

  test('incident page: the incident is an h2, and the status of each update an h3', async ({ page }) => {
    await page.goto(`/incidents/${fixture('completedMaintenance').slug}/`);
    const headings = await outline(page);

    expectNoSkippedLevel(headings);
    expect(headings).toEqual([
      'h1 DatoCMS Status: Maintenance',
      `h2 ${fixture('completedMaintenance').file.name}`,
      'h3 Completed',
      'h3 Verifying',
      'h3 In progress',
      'h3 Scheduled',
    ]);
  });

  test('no page has an h5 or an h6', async ({ page }) => {
    await mockApi(page, { feeds: json([feedItem(true)], 200, { 'X-Unreached-Suppliers': '' }) });

    for (const path of ['/', '/history/', `/incidents/${fixture('open').slug}/`, '/no-such-page/']) {
      await page.goto(path);
      await expect(page.locator('h5, h6'), path).toHaveCount(0);
    }
  });
});

test('the name of a page stays on the line of the name of the site, or goes below it', async ({ page }) => {
  for (const width of [1000, 380]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/history/');
    const name = (await page.locator('.page-header__name').boundingBox())!;
    const pageName = (await page.locator('.page-header__page').last().boundingBox())!;
    const button = (await page.locator('.subscribe__button').boundingBox())!;
    const isOnSameLine = Math.abs(name.y - pageName.y) < 5;

    expect(isOnSameLine || pageName.y >= name.y + name.height - 1, `width ${width}`).toBe(true);
    expect(pageName.x + pageName.width, `width ${width}`).toBeLessThanOrEqual(width);
    // The button is beside the heading or below it, never on it.
    const isBeside = pageName.x + pageName.width <= button.x;
    expect(isBeside || button.y >= pageName.y + pageName.height, `width ${width}`).toBe(true);
  }
});

test('the header of an incident page has the width of the other pages', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await mockApi(page);
  await page.goto('/');
  const home = (await page.locator('.page-header').boundingBox())!;

  await page.goto(`/incidents/${fixture('open').slug}/`);
  const incident = (await page.locator('.page-header').boundingBox())!;
  const box = (await page.locator('.incident-details').boundingBox())!;

  expect(incident.x).toBe(home.x);
  expect(incident.width).toBe(home.width);
  expect(incident.height).toBe(home.height);
  // The header has its space, and the report starts below it.
  expect(box.y - (incident.y + incident.height)).toBeGreaterThanOrEqual(40);
  expect(box.y - (incident.y + incident.height)).toBeLessThanOrEqual(80);
});

test('the colon stays with the name of the site on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 800 });
  await page.goto('/history/');
  const name = (await page.locator('.page-header__name').boundingBox())!;
  const [colon, pageName] = await page.locator('.page-header__page').evaluateAll((parts) =>
    parts.map((part) => ({ text: part.textContent, ...part.getBoundingClientRect().toJSON() })),
  );

  expect(colon.text).toBe(':');
  expect(pageName.text).toBe('Incident History');
  expect(Math.abs(colon.top - name.y)).toBeLessThan(5);
  expect(colon.left).toBeGreaterThanOrEqual(name.x + name.width - 1);
  expect(pageName.top).toBeGreaterThan(name.y + name.height - 1);
});

test('the homepage and the 404 page have the name of the site alone', async ({ page }) => {
  await mockApi(page);
  for (const path of ['/', '/no-such-page/']) {
    await page.goto(path);
    await expect(page.locator('.page-header__page'), path).toHaveCount(0);
    await expect(page.locator('.page-header__logo'), path).toHaveText('DatoCMS Status');
  }
});
