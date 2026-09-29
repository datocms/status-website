import { expect, test } from '@playwright/test';
import { fixture, manifest } from './support.ts';

test('gives every incident and maintenance in the JSON feed', async ({ request }) => {
  const response = await request.get('/history.json');
  const feed = await response.json();

  expect(response.status()).toBe(200);
  expect(feed.title).toBe('DatoCMS Incident History');
  expect(feed.items.map((item: { id: string }) => item.id).sort()).toEqual(
    Object.values(manifest().items)
      .map(({ slug }) => slug)
      .sort(),
  );
});

test('gives the rendered updates of an incident, newest first', async ({ request }) => {
  const { slug, file } = fixture('open');
  const feed = await (await request.get('/history.json')).json();
  const item = feed.items.find((entry: { id: string }) => entry.id === slug);

  expect(item.title).toBe(file.name);
  expect(item.url).toBe(`https://status.datocms.com/incidents/${slug}/`);
  expect(item.content_html.indexOf('<strong>Identified</strong>')).toBeLessThan(
    item.content_html.indexOf('<strong>Investigating</strong>'),
  );
  expect(item.content_html).toContain('<li>Writes fail</li>');
  expect(item.content_html).toContain('Détails à suivre ☕ — “soon”.');
});

for (const [path, type] of [
  ['/history.rss', 'rss'],
  ['/history.atom', 'feed'],
] as const) {
  test(`gives the incidents in ${path}`, async ({ request }) => {
    const { slug } = fixture('resolved');
    const response = await request.get(path);
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toMatch(new RegExp(`^<\\?xml[^>]*\\?>\\s*<${type}[\\s>]`));
    expect(body).toContain('Slow dashboard');
    expect(body).toContain(`https://status.datocms.com/incidents/${slug}/`);
    expect(body).toContain('écriture ☕');
  });
}
