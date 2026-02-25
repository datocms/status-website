import type { APIRoute } from 'astro';
import { Feed } from 'feed';
import { getAll } from '../lib/incidents';
import { renderMarkdown } from '../lib/markdown';

export const GET: APIRoute = async () => {
  const allIncidents = await getAll();

  const feed = new Feed({
    title: 'DatoCMS Incident History',
    id: 'https://status.datocms.com/',
    link: 'https://status.datocms.com/history.atom',
    updated: new Date(),
    feedLinks: {
      rss: 'https://status.datocms.com/history.rss',
      json: 'https://status.datocms.com/history.json',
      atom: 'https://status.datocms.com/history.atom',
    },
    author: {
      name: 'DatoCMS',
      link: 'https://www.datocms.com/',
    },
    copyright: '',
  });

  for (const incident of allIncidents) {
    feed.addItem({
      title: incident.name,
      id: incident.slug,
      link: `https://status.datocms.com/incidents/${incident.slug}/`,
      content: incident.updates
        .map(
          (u) =>
            `<p><strong>${u.statusLabel}</strong> — ${renderMarkdown(u.content)}</p>`,
        )
        .join(''),
      date: incident.lastUpdate.date,
    });
  }

  return new Response(feed.atom1(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
