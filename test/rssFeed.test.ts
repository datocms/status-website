/*
 * EXPECTED TO FAIL: the RSS path of the supplier feeds is disabled.
 *
 * src/lib/rssFeed.ts has the reason and the steps to turn the path on. While
 * it is off, the module exports nothing, so each test here fails, and
 * `{ fails: true }` makes Vitest count that as correct ("expected fail").
 *
 * When the path is on again, each test passes, and Vitest reports "Expect
 * test to fail". To make the tests normal again, remove `{ fails: true }` from
 * the 2 `describe` blocks below. Nothing else in this file changes.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FeedItem } from '../src/lib/supplierItems';

/** The same type as in src/lib/rssFeed.ts, which exports nothing while it is off. */
interface RssService {
  type: 'rss';
  name: string;
  homepageUrl: string;
  feedUrl: string;
  isOngoing: (item: { title?: string }) => boolean;
}

interface RssFeedModule {
  toPlainText: (html: string) => string;
  fetchRssItems: (service: RssService) => Promise<FeedItem[]>;
}

// Top-level await: the module loads in both states. While the path is off,
// the two names are undefined, and a call to one of them fails the test.
const { fetchRssItems, toPlainText } = (await import('../src/lib/rssFeed')) as unknown as RssFeedModule;

const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toPlainText', { fails: true }, () => {
  it('keeps the text and removes the tags', () => {
    expect(toPlainText('<p>We are <strong>investigating</strong> the issue.</p>')).toBe(
      'We are investigating the issue.',
    );
  });

  it('puts a space between the text of two blocks', () => {
    expect(toPlainText('<p>First.</p><p>Second.</p><ul><li>One</li><li>Two</li></ul>')).toBe(
      'First. Second. One Two',
    );
    expect(toPlainText('Line one<br>line two')).toBe('Line one line two');
  });

  it('decodes the entities one time', () => {
    expect(toPlainText('5 &lt; 6 &amp; 7 &gt; 2 &quot;ok&quot; &#39;x&#39; caf&eacute; &#x2615;')).toBe(
      `5 < 6 & 7 > 2 "ok" 'x' café ☕`,
    );
    expect(toPlainText('&amp;lt;b&amp;gt;')).toBe('&lt;b&gt;');
  });

  it('leaves out what a page does not show as text', () => {
    expect(toPlainText('Before<script>alert(1)</script><style>p { color: red }</style>after')).toBe(
      'Before after',
    );
    expect(toPlainText('<!-- a comment -->Text')).toBe('Text');
  });

  it('gives back the text of a link, and nothing of its address', () => {
    expect(toPlainText('<a href="javascript:alert(1)">link</a>')).toBe('link');
    expect(toPlainText('<img src=x onerror=alert(1)>')).toBe('');
    expect(toPlainText('<svg><animate onbegin=alert(1)></svg>')).toBe('');
  });

  it('adds no space for an element inside a line', () => {
    expect(toPlainText('<p>We are <b>done</b>.</p>')).toBe('We are done.');
    expect(toPlainText('See <a href="https://x.test">the <em>docs</em></a>, please.')).toBe('See the docs, please.');
    expect(toPlainText('H<sub>2</sub>O')).toBe('H2O');
  });

  it('reads markup that is not complete', () => {
    expect(toPlainText('<p>open <b>never closed')).toBe('open never closed');
  });

  it('keeps an entity that stands for a tag as text', () => {
    expect(toPlainText('Region &lt;eu-west-1&gt; is slow')).toBe('Region <eu-west-1> is slow');
  });

  it('collapses the white space and trims', () => {
    expect(toPlainText('  <p>\n  A   lot\n\n of   space </p>  ')).toBe('A lot of space');
    expect(toPlainText('')).toBe('');
  });
});

const service: RssService = {
  type: 'rss',
  name: 'Example',
  homepageUrl: 'https://status.example.com/',
  feedUrl: 'https://status.example.com/history.rss',
  isOngoing: (item) => !(item.title || '').startsWith('[Resolved]'),
};

interface Entry {
  title: string;
  date: Date;
  html?: string;
  link?: string;
}

const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rss = (entries: Entry[]) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Example status</title>
${entries
  .map(
    ({ title, date, html = '<p>Text.</p>', link = 'https://status.example.com/incidents/1' }) =>
      `<item><title>${escapeXml(title)}</title><link>${link}</link><pubDate>${date.toUTCString()}</pubDate><description>${escapeXml(html)}</description></item>`,
  )
  .join('\n')}
</channel></rss>`;

const atom = (entries: Entry[]) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Example status</title>
${entries
  .map(
    ({ title, date, html = '<p>Text.</p>', link = 'https://status.example.com/incidents/1' }) =>
      `<entry><title>${escapeXml(title)}</title><link href="${link}"/><updated>${date.toISOString()}</updated><content type="html">${escapeXml(html)}</content></entry>`,
  )
  .join('\n')}
</feed>`;

const stubFeed = (body: string, status = 200) => {
  const requests: { url: string; hasTimeLimit: boolean }[] = [];
  vi.stubGlobal('fetch', async (input: URL | string, init?: RequestInit) => {
    requests.push({ url: String(input), hasTimeLimit: init?.signal instanceof AbortSignal });
    return new Response(body, { status });
  });
  return requests;
};

describe('fetchRssItems', { fails: true }, () => {
  it('reads the feed of the supplier, with a time limit', async () => {
    const requests = stubFeed(rss([{ title: 'Slow API', date: ago(HOUR) }]));
    await fetchRssItems(service);

    expect(requests).toEqual([{ url: 'https://status.example.com/history.rss', hasTimeLimit: true }]);
  });

  it('gives each item with plain text, its date in ISO form, and the supplier', async () => {
    const date = ago(HOUR);
    stubFeed(
      rss([
        {
          title: 'Slow API & errors',
          date,
          html: '<p>We are <b>investigating</b>.</p><p>caf&eacute; &lt;eu-west-1&gt;</p><script>alert(1)</script>',
          link: 'https://status.example.com/incidents/42',
        },
      ]),
    );

    expect(await fetchRssItems(service)).toEqual([
      {
        title: 'Slow API & errors',
        date: new Date(Math.floor(date.getTime() / 1000) * 1000).toISOString(),
        url: 'https://status.example.com/incidents/42',
        description: 'We are investigating. café <eu-west-1>',
        status: 'Ongoing',
        ongoing: true,
        source: { name: 'Example', homepageUrl: 'https://status.example.com/' },
      },
    ]);
  });

  it('asks the supplier rule which items are over', async () => {
    stubFeed(
      rss([
        { title: 'Slow API', date: ago(HOUR) },
        { title: '[Resolved] Login errors', date: ago(2 * HOUR) },
      ]),
    );
    const items = await fetchRssItems(service);

    expect(items.map(({ title, status, ongoing }) => [title, status, ongoing])).toEqual([
      ['Slow API', 'Ongoing', true],
      ['[Resolved] Login errors', 'Resolved', false],
    ]);
  });

  it('drops an ongoing item after 7 days and a resolved one after 48 hours', async () => {
    stubFeed(
      rss([
        { title: 'Ongoing, 6 days', date: ago(6 * 24 * HOUR) },
        { title: 'Ongoing, 8 days', date: ago(8 * 24 * HOUR) },
        { title: '[Resolved] 47 hours', date: ago(47 * HOUR) },
        { title: '[Resolved] 49 hours', date: ago(49 * HOUR) },
      ]),
    );

    expect((await fetchRssItems(service)).map((item) => item.title)).toEqual([
      'Ongoing, 6 days',
      '[Resolved] 47 hours',
    ]);
  });

  it('keeps 5 ongoing items and 2 resolved items at most', async () => {
    stubFeed(
      rss([
        ...Array.from({ length: 7 }, (_, i) => ({ title: `Ongoing ${i}`, date: ago((i + 1) * HOUR) })),
        ...Array.from({ length: 4 }, (_, i) => ({ title: `[Resolved] ${i}`, date: ago((i + 1) * HOUR) })),
      ]),
    );
    const items = await fetchRssItems(service);

    expect(items.filter((item) => item.ongoing)).toHaveLength(5);
    expect(items.filter((item) => !item.ongoing)).toHaveLength(2);
  });

  it('cuts a long description', async () => {
    stubFeed(rss([{ title: 'Slow API', date: ago(HOUR), html: `<p>${'x'.repeat(300)}</p>` }]));
    const [item] = await fetchRssItems(service);

    expect(item.description).toBe(`${'x'.repeat(250)}...`);
  });

  it('leaves out an item without a date', async () => {
    stubFeed(
      '<?xml version="1.0"?><rss version="2.0"><channel><title>t</title><item><title>No date</title><description>x</description></item></channel></rss>',
    );

    expect(await fetchRssItems(service)).toEqual([]);
  });

  it('reads an Atom feed too', async () => {
    stubFeed(atom([{ title: 'Slow API', date: ago(HOUR), html: '<p>Atom <i>text</i>.</p>' }]));
    const [item] = await fetchRssItems(service);

    expect(item).toMatchObject({
      title: 'Slow API',
      url: 'https://status.example.com/incidents/1',
      description: 'Atom text.',
      ongoing: true,
    });
  });

  it('fails when the supplier gives an error, so that the endpoint can name it', async () => {
    stubFeed('', 503);
    await expect(fetchRssItems(service)).rejects.toThrow('Example returned 503');
  });

  it('fails when the reply is not a feed', async () => {
    stubFeed('<html><body>Maintenance</body></html>');
    await expect(fetchRssItems(service)).rejects.toThrow();
  });
});
