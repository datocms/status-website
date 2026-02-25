import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAll } from '../lib/incidents';
import { renderMarkdown } from '../lib/markdown';

export async function GET(context: APIContext) {
  const allIncidents = await getAll();

  return rss({
    title: 'DatoCMS Incident History',
    description: 'DatoCMS service incident history',
    site: context.site!.toString(),
    items: allIncidents.map((incident) => ({
      title: incident.name,
      pubDate: incident.lastUpdate.date,
      link: `/incidents/${incident.slug}/`,
      content: incident.updates
        .map(
          (u) =>
            `<p><strong>${u.statusLabel}</strong> — ${renderMarkdown(u.content)}</p>`,
        )
        .join(''),
    })),
  });
}
