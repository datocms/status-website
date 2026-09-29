import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { checkFeed, decodeEntities, htmlToText, pollHosts } from '../src/lib/verify.ts';

const feed = (items: unknown[]) => JSON.stringify({ version: 'https://jsonfeed.org/version/1', items });

test('decodeEntities handles named, decimal, and hex entities', () => {
  assert.equal(decodeEntities('a &amp; b &lt;c&gt; &#39;d&#39; &#x1F4C5; &quot;e&quot;'), `a & b <c> 'd' 📅 "e"`);
});

test('htmlToText strips tags and collapses whitespace', () => {
  assert.equal(
    htmlToText('<p><strong>Resolved</strong> — <p>The issue\nhas been resolved.</p>\n</p>'),
    'Resolved — The issue has been resolved.',
  );
});

/** One item of the feed, as the site writes it: the label of each update, then its rendered text. */
const feedItem = (id: string, title: string, updates: [label: string, markdown: string][]) => ({
  id,
  title,
  content_html: updates
    .map(([label, markdown]) => `<p><strong>${label}</strong> — ${marked.parse(markdown, { async: false })}</p>`)
    .join(''),
});

const MARKDOWN: Record<string, string> = {
  'bold before a comma': 'First **bold**, then text.',
  'italic before a full stop': 'This is _important_.',
  'a link before a full stop': 'See [the docs](https://www.datocms.com/docs).',
  'an address without a link': 'See https://status.datocms.com/history for more.',
  'inline code': 'Run `npm run tui`, then wait.',
  'fenced code': 'Run this:\n\n```\nnpm run tui -- --help\nif (a < b && c > d) {}\n```',
  'a horizontal rule': 'Above\n\n---\n\nBelow',
  'a table': '| Region | State |\n|---|---|\n| Europe | up |',
  'a heading and lists': '## What happened\n\n- First **item**\n- Second\n\n1. Step one\n2. Step two',
  'a quote': '> Cloudflare is investigating.\n\nWe wait.',
  'one newline in a paragraph': 'Line one\nline two of the same paragraph.',
  'emoji, accents and signs': '📅 Accès rétabli — “ok” & 5 < 6 > 2',
  'raw HTML': 'Text with <b>bold</b> and <br> a break.',
};

for (const [name, markdown] of Object.entries(MARKDOWN)) {
  test(`checkFeed verifies an update with ${name}`, () => {
    const body = feed([feedItem('s', 'T', [['Identified', markdown], ['Investigating', 'We are investigating.']])]);

    assert.deepEqual(checkFeed(body, { slug: 's', name: 'T', updates: ['We are investigating.', markdown] }), { status: 'verified' });
  });
}

test('checkFeed names the part of the text that the page does not show', () => {
  const body = feed([feedItem('s', 'T', [['Identified', 'First **bold**, then text.\n\nSecond paragraph, cut sho']])]);
  const result = checkFeed(body, { slug: 's', name: 'T', updates: ['First **bold**, then text.\n\nSecond paragraph, cut short.'] });

  assert.equal(result.status, 'mismatch');
  assert.equal((result as { expected: string }).expected, 'Second paragraph, cut short.');
});

test('checkFeed sees a character that the host damaged', () => {
  const body = feed([feedItem('s', 'T', [['Resolved', 'AccÃ¨s rÃ©tabli']])]);
  const result = checkFeed(body, { slug: 's', name: 'T', updates: ['Accès rétabli'] });

  assert.equal(result.status, 'mismatch');
  assert.equal((result as { expected: string }).expected, 'Accès rétabli');
});

const expected = {
  slug: '2026-09-01-imgix',
  name: 'Imgix outage',
  updates: ['We are investigating.\n\n- Some images **fail** to load\n- Uploads work'],
};

test('checkFeed is pending when the item is not there yet', () => {
  assert.deepEqual(checkFeed(feed([]), expected), { status: 'pending', reason: 'item not in feed yet' });
  assert.equal(checkFeed('<html>', expected).status, 'pending');
});

test('checkFeed verifies rendered content with entities and emoji', () => {
  const body = feed([
    {
      id: '2026-09-01-imgix',
      title: 'Imgix outage',
      content_html:
        '<p><strong>Investigating</strong> — <p>We are investigating.</p>\n<ul>\n<li>Some images <strong>fail</strong> to load</li>\n<li>Uploads work</li>\n</ul>\n</p>',
    },
  ]);
  assert.deepEqual(checkFeed(body, expected), { status: 'verified' });
});

test('checkFeed verifies accented characters and quotes survive', () => {
  const body = feed([
    {
      id: 's',
      title: 'Problème d’accès',
      content_html: '<p><strong>Resolved</strong> — <p>L&#39;accès est rétabli &amp; stable — “ok”.</p></p>',
    },
  ]);
  assert.deepEqual(
    checkFeed(body, { slug: 's', name: 'Problème d’accès', updates: ["L'accès est rétabli & stable — “ok”."] }),
    { status: 'verified' },
  );
});

test('checkFeed reports a title mismatch', () => {
  const body = feed([{ id: '2026-09-01-imgix', title: 'Imgix outage?', content_html: '' }]);
  assert.deepEqual(checkFeed(body, expected), { status: 'mismatch', field: 'title', expected: 'Imgix outage', found: 'Imgix outage?' });
});

test('checkFeed reports the first missing content line', () => {
  const body = feed([
    { id: '2026-09-01-imgix', title: 'Imgix outage', content_html: '<p>We are investigating.</p><p>Some images fail to lo</p>' },
  ]);
  const result = checkFeed(body, expected);
  assert.equal(result.status, 'mismatch');
  assert.equal((result as { expected: string }).expected, 'Some images fail to load');
});

test('pollHosts stops when every host is verified and reports attempts', async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    const ready = calls > 2;
    return new Response(ready ? feed([{ id: 's', title: 'T', content_html: '<p>Hi</p>' }]) : feed([]), { status: 200 });
  }) as unknown as typeof fetch;

  const states = await pollHosts({
    hosts: [{ name: 'A', origin: 'https://a' }, { name: 'B', origin: 'https://b' }],
    expected: { slug: 's', name: 'T', updates: ['Hi'] },
    intervalMs: 1,
    fetchImpl,
  });
  assert.deepEqual(
    states.map((s) => s.result.status),
    ['verified', 'verified'],
  );
  assert.ok(states.every((s) => s.attempts >= 1));
});

test('pollHosts stops on abort and on timeout', async () => {
  const fetchImpl = (async () => new Response(feed([]), { status: 200 })) as unknown as typeof fetch;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 5);
  const aborted = await pollHosts({
    hosts: [{ name: 'A', origin: 'https://a' }],
    expected: { slug: 's', name: 'T', updates: [] },
    intervalMs: 1,
    signal: controller.signal,
    fetchImpl,
  });
  assert.equal(aborted[0].result.status, 'pending');

  const timedOut = await pollHosts({
    hosts: [{ name: 'A', origin: 'https://a' }],
    expected: { slug: 's', name: 'T', updates: [] },
    intervalMs: 1,
    timeoutMs: 5,
    fetchImpl,
  });
  assert.equal(timedOut[0].result.status, 'pending');
});

test('pollHosts keeps waiting while the host serves the previous version', async () => {
  const old = feed([{ id: 's', title: 'T', content_html: '<p>First update.</p>' }]);
  const fresh = feed([{ id: 's', title: 'T', content_html: '<p>First update.</p><p>Second update.</p>' }]);
  let calls = 0;
  const fetchImpl = (async () => new Response((calls += 1) > 3 ? fresh : old, { status: 200 })) as unknown as typeof fetch;
  const seen: string[] = [];
  const states = await pollHosts({
    hosts: [{ name: 'A', origin: 'https://a' }],
    expected: { slug: 's', name: 'T', updates: ['First update.', 'Second update.'] },
    intervalMs: 1,
    fetchImpl,
    onUpdate: (s) => seen.push(s[0].result.status),
  });
  assert.deepEqual(seen, ['mismatch', 'mismatch', 'mismatch', 'verified']);
  assert.equal(states[0].attempts, 4);
});

test('pollHosts reports a mismatch that is still there at the end of the wait', async () => {
  const old = feed([{ id: 's', title: 'T', content_html: '<p>First update.</p>' }]);
  const fetchImpl = (async () => new Response(old, { status: 200 })) as unknown as typeof fetch;
  const states = await pollHosts({
    hosts: [{ name: 'A', origin: 'https://a' }],
    expected: { slug: 's', name: 'T', updates: ['First update.', 'Second update.'] },
    intervalMs: 1,
    timeoutMs: 10,
    fetchImpl,
  });
  assert.deepEqual(states[0].result, { status: 'mismatch', field: 'content', expected: 'Second update.', found: states[0].result.status === 'mismatch' ? states[0].result.found : '' });
  assert.ok(states[0].attempts > 1);
});
