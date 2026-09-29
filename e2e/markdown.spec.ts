/**
 * Every screen that shows an update must render its Markdown into the same
 * HTML nodes. One fixture update has every kind of Markdown; each test finds
 * that update on one screen and checks the nodes.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { fixture, historyPathFor, manifest, mockApi } from './support.ts';

/** Checks the nodes of `RICH_MARKDOWN` inside the element that holds it. */
const expectRichMarkdown = async (update: Locator) => {
  // Some screens put the status label before the text of the first paragraph.
  await expect(update.locator('p', { hasText: 'First paragraph' })).toHaveText(
    /(^|— )First paragraph with bold, italic, inline code and a link\.$/,
  );
  // One newline stays in the paragraph. A blank line starts a new one.
  await expect(update.locator('p', { hasText: 'Second paragraph' })).toHaveText(
    'Second paragraph: accents é, emoji ☕, and 5 < 6 & 7 > 2. Same paragraph after one newline. See https://status.datocms.com/history for more.',
  );

  await expect(update.locator('strong', { hasText: /^bold$/ })).toHaveCount(2);
  await expect(update.locator('em')).toHaveText('italic');
  await expect(update.locator(':not(pre) > code')).toHaveText('inline code');

  await expect(update.getByRole('link', { name: 'a link' })).toHaveAttribute('href', 'https://www.datocms.com/docs');
  await expect(update.getByRole('link', { name: 'https://status.datocms.com/history' })).toHaveAttribute(
    'href',
    'https://status.datocms.com/history',
  );

  await expect(update.locator('h2')).toHaveText('What happened');
  // A feed entry holds every update, so find the list by its first item.
  await expect(update.locator('ul', { hasText: 'First item' }).locator('> li')).toHaveText([
    'First item',
    'Second item with bold',
  ]);
  await expect(update.locator('ol > li')).toHaveText(['Step one', 'Step two']);
  await expect(update.locator('blockquote')).toHaveText('A quoted line.');
  await expect(update.locator('pre > code')).toHaveText('const x = 1;');

  for (const raw of ['**', '_italic_', '](', '## ', '```', '`inline', '- First', '1. Step', '> A quoted']) {
    await expect(update, `must not show the Markdown characters ${raw}`).not.toContainText(raw);
  }
};

/** Checks `LIST_FIRST_MARKDOWN`, which has the status label before it on some screens. */
const expectListFirst = async (update: Locator, statusLabel?: string) => {
  await expect(update.locator('ul > li')).toHaveText(['Reads work', 'Writes fail']);
  await expect(update).not.toContainText('- Reads work');

  if (statusLabel) {
    await expect(update.locator('strong').first()).toHaveText(statusLabel);
  }
};

const updatesOf = (page: Page, container: string, update: string) =>
  page.locator(container, { hasText: fixture('markdown').file.name }).locator(update);

test.describe('incident updates', () => {
  test('homepage, open incidents', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const updates = updatesOf(page, '.unresolved-incident', '.unresolved-incident__update .ugc');

    await expect(updates).toHaveCount(2);
    await expect(updates.nth(0).locator('strong').first()).toHaveText('Identified');
    await expectRichMarkdown(updates.nth(0));
    await expectListFirst(updates.nth(1), 'Investigating');
  });

  test('homepage, incident history', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const updates = updatesOf(page, '.incidents-daily__incident', '.incidents-daily__incident__update .ugc');

    await expect(updates).toHaveCount(2);
    await expect(updates.nth(0).locator('strong').first()).toHaveText('Identified');
    await expectRichMarkdown(updates.nth(0));
    await expectListFirst(updates.nth(1), 'Investigating');
  });

  test('incident page', async ({ page }) => {
    await page.goto(`/incidents/${fixture('markdown').slug}/`);
    const updates = page.locator('.incident-details__update__message .ugc');

    await expect(updates).toHaveCount(2);
    await expectRichMarkdown(updates.nth(0));
    await expectListFirst(updates.nth(1));
  });

  test('history page', async ({ page }) => {
    const { file } = fixture('markdown');
    await page.goto(historyPathFor(file.updates[0].date, manifest().builtAt));
    const update = updatesOf(page, '.history__incident', '.history__incident__body .ugc');

    await expect(update).toHaveCount(1);
    await expectRichMarkdown(update);
  });
});

test.describe('maintenance announcement', () => {
  test('maintenance page', async ({ page }) => {
    await page.goto(`/incidents/${fixture('completedMaintenance').slug}/`);
    const announcement = page.locator('.incident-details__update__message .ugc').last();

    await expect(announcement.locator('p').first()).toHaveText('Payments will be unavailable during this window.');
    await expectRichMarkdown(announcement);
  });

  test('homepage, incident history', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const announcement = page
      .locator('.incidents-daily__incident', { hasText: fixture('completedMaintenance').file.name })
      .locator('.incidents-daily__incident__update .ugc')
      .last();

    await expect(announcement.locator('p').first()).toHaveText('Scheduled — Payments will be unavailable during this window.');
    await expectRichMarkdown(announcement);
  });
});

/** Turns the XML entities of a feed back into the characters. */
const unescapeXml = (text: string) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&');

/** The HTML of one entry of an RSS or Atom feed. */
const entryHtml = (xml: string, slug: string) => {
  const entry = xml.split(/<(?:item|entry)>/).find((part) => part.includes(`/incidents/${slug}/`));
  const content = /<content(?::encoded)?[^>]*>([\s\S]*?)<\/content(?::encoded)?>/.exec(entry ?? '')?.[1] ?? '';
  const cdata = /^<!\[CDATA\[([\s\S]*)\]\]>$/.exec(content.trim());

  return cdata ? cdata[1] : unescapeXml(content);
};

test.describe('feeds', () => {
  /** Puts the HTML of a feed entry in a page, as a feed reader does. */
  const show = async (page: Page, contentHtml: string) => {
    expect(contentHtml).not.toBe('');
    await page.setContent(`<!doctype html><main>${contentHtml}</main>`);
    return page.locator('main');
  };

  test('JSON feed', async ({ page, request }) => {
    const feed = await (await request.get('/history.json')).json();
    const item = feed.items.find((entry: { id: string }) => entry.id === fixture('markdown').slug);
    const entry = await show(page, item.content_html);

    await expect(entry.locator('strong', { hasText: /^(Identified|Investigating)$/ })).toHaveText([
      'Identified',
      'Investigating',
    ]);
    await expectRichMarkdown(entry);
    await expect(entry.locator('ul > li', { hasText: /^(Reads work|Writes fail)$/ })).toHaveText([
      'Reads work',
      'Writes fail',
    ]);
  });

  for (const path of ['/history.rss', '/history.atom']) {
    test(path, async ({ page, request }) => {
      const xml = await (await request.get(path)).text();
      const entry = await show(page, entryHtml(xml, fixture('markdown').slug));

      await expectRichMarkdown(entry);
      await expect(entry.locator('ul > li', { hasText: /^(Reads work|Writes fail)$/ })).toHaveText([
        'Reads work',
        'Writes fail',
      ]);
    });
  }
});
