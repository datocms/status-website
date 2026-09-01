import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFeed, decodeEntities, htmlToText, markdownLines, pollHosts } from '../src/lib/verify.ts';

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

test('markdownLines strips list markers, headings, emphasis, and links', () => {
  const lines = markdownLines(
    '📅 Timeline:\n- Full window begins: **05:30 UTC**\n1. Step one\n\n## Heading\nSee [the docs](https://x.y) for `details`.\n> quoted\n\n',
  );
  assert.deepEqual(lines, [
    '📅 Timeline:',
    'Full window begins: 05:30 UTC',
    'Step one',
    'Heading',
    'See the docs for details.',
    'quoted',
  ]);
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
  assert.deepEqual(checkFeed(body, expected), { status: 'mismatch', expected: 'Imgix outage', found: 'Imgix outage?' });
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
