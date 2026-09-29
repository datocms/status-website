import { expect, test } from '@playwright/test';
import { fixture, manifest, mockApi, monthTitle } from './support.ts';

test.describe('open incidents', () => {
  for (const name of ['open', 'markdown', 'futureMaintenance'] as const) {
    test(`the title of "${name}" links to its page`, async ({ page }) => {
      const { slug, file } = fixture(name);
      await mockApi(page);
      await page.goto('/');
      const title = page.locator('.unresolved-incident__title', { hasText: file.name });

      await expect(title.getByRole('link', { name: file.name })).toHaveAttribute('href', `/incidents/${slug}/`);

      await title.getByRole('link').click();
      await expect(page).toHaveURL(new RegExp(`/incidents/${slug}/$`));
      await expect(page.locator('.incident-details__title')).toHaveText(file.name);
    });
  }

  test('the link keeps the look of the title', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const link = page.locator('.unresolved-incident__title a').first();

    await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(link).toHaveCSS('text-decoration-line', 'none');
    await link.hover();
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
  });
});

const SECTIONS = [
  ['component-status', 'Component Status'],
  ['system-metrics', 'System Metrics'],
  ['third-party-components', 'Third-Party Components'],
  ['incident-history', 'Incident History'],
] as const;

test.describe('homepage sections', () => {
  for (const [id, title] of SECTIONS) {
    test(`the title "${title}" is a link to its section`, async ({ page }) => {
      await mockApi(page);
      await page.goto('/');
      const heading = page.locator(`#${id} .section-title`);
      const link = heading.getByRole('link', { name: title, exact: true });

      await expect(heading).toHaveText(title);
      await expect(link).toHaveAttribute('href', `#${id}`);

      // The brand orange.
      await expect(heading).toHaveCSS('color', 'rgb(255, 119, 81)');

      // It looks like the title until the pointer is on it.
      await expect(link).toHaveCSS('color', await heading.evaluate((el) => getComputedStyle(el).color));
      await expect(link).toHaveCSS('text-decoration-line', 'none');
      await link.hover();
      await expect(link).toHaveCSS('text-decoration-line', 'underline');

      await link.click();
      await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    });

    test(`the title "${title}" has no sign after it`, async ({ page }) => {
      await mockApi(page);
      await page.goto('/');
      const heading = page.locator(`#${id} .section-title`);

      await expect(heading.locator('a')).toHaveCount(1);
      expect(await heading.evaluate((el) => getComputedStyle(el.querySelector('a')!, '::before').content)).toBe('none');
      expect(await heading.evaluate((el) => getComputedStyle(el.querySelector('a')!, '::after').content)).toBe('none');
    });

    test(`a link to "${title}" opens the page at that section`, async ({ page }) => {
      await mockApi(page);
      await page.goto(`/#${id}`);

      await expect(page.locator(`#${id} .section-title`)).toBeInViewport();
    });
  }

  test('stays at the section while slow sections above it get their content', async ({ page }) => {
    const slow = (body: unknown) => async (route: import('@playwright/test').Route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    };
    await mockApi(page, { feeds: slow([]), cloudwatch: slow({ global: 1, overTime: [] }) });
    await page.goto('/#incident-history');
    await expect(page.locator('third-party-components p')).toHaveText('All third-party components are operational.');

    await expect(page.locator('#incident-history .section-title')).toBeInViewport();
  });

  test('does not move the page after the reader scrolled', async ({ page }) => {
    let release = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await mockApi(page, {
      feeds: async (route) => {
        await held;
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      },
    });
    await page.goto('/#incident-history');
    await page.mouse.wheel(0, -5000);
    await expect(page.locator('.page-header__logo')).toBeInViewport();

    release();
    await expect(page.locator('third-party-components p')).toHaveText('All third-party components are operational.');
    await expect(page.locator('.page-header__logo')).toBeInViewport();
  });

  test('shows a keyboard user that the title is a link', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const link = page.locator('#incident-history .section-title a');

    // Tab gives keyboard focus, which `focus()` from a script does not show.
    await page.locator('#incident-history').evaluate((el) => {
      const before = document.createElement('button');
      el.before(before);
      before.focus();
    });
    await page.keyboard.press('Tab');

    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
  });

  test('gives each id to one element only', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    for (const [id] of SECTIONS) {
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    }
  });
});

test.describe('history months', () => {
  test('the title of each month is a link to it', async ({ page }) => {
    const month = manifest().builtAt;
    const id = `month-${month.slice(0, 7)}`;
    await page.goto('/history/');
    const heading = page.locator(`#${id} .section-title`);

    await expect(page.locator('.history__month[id^="month-"]')).toHaveCount(3);
    const link = heading.getByRole('link', { name: monthTitle(month), exact: true });

    await expect(heading).toHaveText(monthTitle(month));
    await expect(link).toHaveAttribute('href', `#${id}`);

    await link.hover();
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/history/?#${id}$`));
  });
});
