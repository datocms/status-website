/**
 * Fixture data for the end-to-end tests. The dates are relative to now,
 * because the homepage shows only open items and the last 7 days.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface Update {
  date: string;
  status: string;
  content: string;
}

export interface Fixture {
  kind: 'incidents' | 'maintenances';
  slug: string;
  file: {
    name: string;
    impact?: string;
    scheduledTime?: string;
    minutes?: string;
    content?: string;
    components: string[];
    updates: Update[];
  };
}

export type FixtureName =
  | 'open'
  | 'markdown'
  | 'resolved'
  | 'old'
  | 'futureMaintenance'
  | 'completedMaintenance';

export interface Manifest {
  /** The moment the fixtures were made, which the build took for "now". */
  builtAt: string;
  items: Record<FixtureName, Fixture>;
}

/**
 * One update with every kind of Markdown that the real updates use, and some
 * that they can use. `e2e/markdown.spec.ts` names the node of each line.
 */
export const RICH_MARKDOWN = [
  'First paragraph with **bold**, _italic_, `inline code` and [a link](https://www.datocms.com/docs).',
  '',
  'Second paragraph: accents é, emoji ☕, and 5 < 6 & 7 > 2.',
  'Same paragraph after one newline. See https://status.datocms.com/history for more.',
  '',
  '## What happened',
  '',
  '- First item',
  '- Second item with **bold**',
  '',
  '1. Step one',
  '2. Step two',
  '',
  '> A quoted line.',
  '',
  '```',
  'const x = 1;',
  '```',
].join('\n');

/** An update that starts with a block, where a prefix on the same line breaks it. */
export const LIST_FIRST_MARKDOWN = '- Reads work\n- Writes fail';

const slugFor = (date: string, name: string) => `${date.slice(0, 10)}-${name}`;

export const buildManifest = (now = Date.now()): Manifest => {
  const at = (offset: number) => new Date(now + offset).toISOString();

  const openStart = at(-2 * HOUR);
  const markdownStart = at(-3 * HOUR);
  const resolvedStart = at(-50 * HOUR);
  const oldStart = at(-210 * DAY);
  const futureStart = at(3 * DAY);
  const completedStart = at(-3 * DAY);

  const items: Manifest['items'] = {
    open: {
      kind: 'incidents',
      slug: slugFor(openStart, 'api-errors'),
      file: {
        name: 'API errors — écriture ☕ & <b>tags</b>',
        impact: 'major',
        components: ['cda', 'cma'],
        updates: [
          {
            date: openStart,
            status: 'investigating',
            content:
              'We are investigating **elevated** error rates.\n\n- Reads work\n- Writes fail\n\nDétails à suivre ☕ — “soon”.',
          },
          {
            date: at(-1 * HOUR),
            status: 'identified',
            content: 'We found the cause: a node stopped. See [the docs](https://www.datocms.com/docs).',
          },
        ],
      },
    },
    markdown: {
      kind: 'incidents',
      slug: slugFor(markdownStart, 'markdown-in-updates'),
      file: {
        name: 'Markdown in updates',
        impact: 'critical',
        components: ['site'],
        updates: [
          { date: markdownStart, status: 'investigating', content: LIST_FIRST_MARKDOWN },
          { date: at(-30 * MINUTE), status: 'identified', content: RICH_MARKDOWN },
        ],
      },
    },
    resolved: {
      kind: 'incidents',
      slug: slugFor(resolvedStart, 'slow-dashboard'),
      file: {
        name: 'Slow dashboard',
        impact: 'minor',
        components: ['dashboard'],
        updates: [
          { date: resolvedStart, status: 'investigating', content: 'The dashboard is slow.' },
          { date: at(-49 * HOUR), status: 'resolved', content: 'The issue has been resolved.' },
        ],
      },
    },
    old: {
      kind: 'incidents',
      slug: slugFor(oldStart, 'asset-upload-failures'),
      file: {
        name: 'Asset upload failures',
        impact: 'critical',
        components: ['assets'],
        updates: [
          { date: oldStart, status: 'investigating', content: 'Uploads fail.' },
          {
            date: at(-210 * DAY + HOUR),
            status: 'resolved',
            content:
              'Uploads work again.\n\n**What happened**\n\nA disk was full — “café” ☕.\n\n- We added space\n- We added an alarm',
          },
        ],
      },
    },
    futureMaintenance: {
      kind: 'maintenances',
      slug: slugFor(futureStart, 'database-upgrade'),
      file: {
        scheduledTime: futureStart,
        name: '🛠️ Database upgrade',
        minutes: '120',
        content: 'We are going to upgrade the database. The system will be read-only.',
        components: ['cda', 'cma'],
        updates: [],
      },
    },
    completedMaintenance: {
      kind: 'maintenances',
      slug: slugFor(completedStart, 'billing-maintenance'),
      file: {
        scheduledTime: completedStart,
        name: 'Billing maintenance',
        minutes: '90',
        content: `Payments will be unavailable during this window.\n\n${RICH_MARKDOWN}`,
        components: ['billing'],
        updates: [
          { date: at(-3 * DAY + MINUTE), status: 'in-progress', content: 'The maintenance has started.' },
          { date: at(-3 * DAY + 60 * MINUTE), status: 'verifying', content: 'We are verifying the result.' },
          { date: at(-3 * DAY + 90 * MINUTE), status: 'completed', content: 'All systems are nominal.' },
        ],
      },
    },
  };

  return { builtAt: new Date(now).toISOString(), items };
};
