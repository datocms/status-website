import { beforeEach, describe, expect, it, vi } from 'vitest';

const collections: Record<string, { id: string; data: unknown }[]> = {
  incidents: [],
  maintenances: [],
};

vi.mock('astro:content', () => ({
  getCollection: async (name: string) => collections[name],
}));

const { getAll, getFutureMaintenances, getUnresolved, getAllSince, ofDay, ofMonth, getFirst } =
  await import('../src/lib/incidents');

const incident = (id: string, updates: { date: string; status: string; content: string }[], extra = {}) => ({
  id,
  data: { name: `Incident ${id}`, impact: 'major', components: ['cda'], updates, ...extra },
});

const maintenance = (id: string, scheduledTime: string, updates: { date: string; status: string; content: string }[] = []) => ({
  id,
  data: { name: `Maintenance ${id}`, scheduledTime, minutes: '90', content: 'Announcement.', components: ['cma', 'billing'], updates },
});

beforeEach(() => {
  collections.incidents = [];
  collections.maintenances = [];
});

describe('incidents', () => {
  it('orders updates newest first, whatever the order in the file', async () => {
    collections.incidents = [
      incident('a', [
        { date: '2026-01-01T12:00:00.000Z', status: 'identified', content: 'Second.' },
        { date: '2026-01-01T10:00:00.000Z', status: 'investigating', content: 'First.' },
        { date: '2026-01-01T14:00:00.000Z', status: 'resolved', content: 'Third.' },
      ]),
    ];
    const [item] = await getAll();

    expect(item.updates.map((u) => u.content)).toEqual(['Third.', 'Second.', 'First.']);
    expect(item.firstUpdate.content).toBe('First.');
    expect(item.lastUpdate.content).toBe('Third.');
    expect(item.status).toBe('resolved');
    expect(item.date.toISOString()).toBe('2026-01-01T10:00:00.000Z');
    expect(item.updates.every((u) => !u.isAnnouncement)).toBe(true);
  });

  it('labels statuses and components, and keeps an unknown id as it is', async () => {
    collections.incidents = [
      incident('a', [{ date: '2026-01-01T10:00:00.000Z', status: 'monitoring', content: 'Text.' }], {
        components: ['cda', 'imgix', 'mystery'],
      }),
    ];
    const [item] = await getAll();

    expect(item.affectedComponents).toEqual(['Content Delivery API', 'Assets CDN (Imgix)', 'mystery']);
    expect(item.lastUpdate.statusLabel).toBe('Monitoring');
    expect(item.lastUpdate.contentWithStatus).toBe('**Monitoring** — Text.');
  });

  it('puts the status label on its own line before a text that starts with a block', async () => {
    const starts = ['- one\n- two', '* one', '1. one', '## Title', '> quote', '```\ncode\n```', '  - indented'];
    collections.incidents = starts.map((content, i) =>
      incident(String(i), [{ date: `2026-01-0${i + 1}T10:00:00.000Z`, status: 'identified', content }]),
    );
    const all = await getAll();

    for (const content of starts) {
      const item = all.find((i) => i.lastUpdate.content === content)!;
      expect(item.lastUpdate.contentWithStatus, content).toBe(`**Identified**\n\n${content}`);
    }
  });

  it('keeps the label on the line of a text that only looks like a block', async () => {
    const starts = ['-5% of requests fail', '*Note*: text', '2026 was calm', '#1 cause: a disk'];
    collections.incidents = starts.map((content, i) =>
      incident(String(i), [{ date: `2026-01-0${i + 1}T10:00:00.000Z`, status: 'identified', content }]),
    );
    const all = await getAll();

    for (const content of starts) {
      const item = all.find((i) => i.lastUpdate.content === content)!;
      expect(item.lastUpdate.contentWithStatus, content).toBe(`**Identified** — ${content}`);
    }
  });

  it('is unresolved until the last update says resolved', async () => {
    collections.incidents = [
      incident('open', [{ date: '2026-01-01T10:00:00.000Z', status: 'monitoring', content: 'x' }]),
      incident('closed', [{ date: '2026-01-02T10:00:00.000Z', status: 'resolved', content: 'x' }]),
    ];
    const all = await getAll();

    expect(getUnresolved(all).map((i) => i.id)).toEqual(['open']);
  });

  it('uses impact none when the file gives no impact', async () => {
    collections.incidents = [incident('a', [{ date: '2026-01-01T10:00:00.000Z', status: 'resolved', content: 'x' }], { impact: undefined })];

    expect((await getAll())[0].impact).toBe('none');
  });
});

describe('maintenances', () => {
  it('makes the announcement from the content, flagged and last', async () => {
    collections.maintenances = [
      maintenance('m', '2026-09-19T05:30:00.000Z', [
        { date: '2026-09-19T05:31:00.000Z', status: 'in-progress', content: 'Started.' },
        { date: '2026-09-19T08:00:00.000Z', status: 'completed', content: 'Done.' },
      ]),
    ];
    const [item] = await getAll();

    expect(item.isMaintenance).toBe(true);
    expect(item.impact).toBe('maintenance');
    expect(item.updates.map((u) => [u.status, u.isAnnouncement])).toEqual([
      ['completed', false],
      ['in-progress', false],
      ['scheduled', true],
    ]);
    expect(item.updates[2].content).toBe('Announcement.');
    expect(item.updates[1].statusLabel).toBe('In progress');
    expect(item.scheduledEnd?.toISOString()).toBe('2026-09-19T07:00:00.000Z');
    expect(item.date.toISOString()).toBe('2026-09-19T05:30:00.000Z');
  });

  it('is a future maintenance, and not unresolved, while it has no update', async () => {
    collections.maintenances = [maintenance('m', '2030-01-01T05:00:00.000Z')];
    const all = await getAll();

    expect(all[0].status).toBe('scheduled');
    expect(getFutureMaintenances(all).map((i) => i.id)).toEqual(['m']);
    expect(getUnresolved(all)).toEqual([]);
  });

  it('is unresolved while in progress or verifying, and not after completion', async () => {
    const at = (status: string) => [{ date: '2026-09-19T06:00:00.000Z', status, content: 'x' }];
    collections.maintenances = [
      maintenance('progress', '2026-09-19T05:30:00.000Z', at('in-progress')),
      maintenance('legacy', '2026-09-19T05:30:00.000Z', at('in_progress')),
      maintenance('verifying', '2026-09-19T05:30:00.000Z', at('verifying')),
      maintenance('completed', '2026-09-19T05:30:00.000Z', at('completed')),
    ];
    const all = await getAll();

    expect(getUnresolved(all).map((i) => i.id).sort()).toEqual(['legacy', 'progress', 'verifying']);
    expect(all.find((i) => i.id === 'legacy')?.lastUpdate.statusLabel).toBe('In progress');
  });
});

describe('lists', () => {
  it('sorts incidents and maintenances together, newest first', async () => {
    collections.incidents = [
      incident('old', [{ date: '2025-01-01T10:00:00.000Z', status: 'resolved', content: 'x' }]),
      incident('new', [{ date: '2026-06-01T10:00:00.000Z', status: 'resolved', content: 'x' }]),
    ];
    collections.maintenances = [maintenance('mid', '2026-01-01T05:00:00.000Z')];
    const all = await getAll();

    expect(all.map((i) => i.id)).toEqual(['new', 'mid', 'old']);
    expect(getFirst(all)?.id).toBe('old');
    expect(getAllSince(all, new Date('2025-12-31T00:00:00.000Z')).map((i) => i.id)).toEqual(['new', 'mid']);
  });

  it('selects by day and by month', async () => {
    collections.incidents = [
      incident('a', [{ date: '2026-06-10T10:00:00.000Z', status: 'resolved', content: 'x' }]),
      incident('b', [{ date: '2026-06-20T10:00:00.000Z', status: 'resolved', content: 'x' }]),
      incident('c', [{ date: '2026-07-20T10:00:00.000Z', status: 'resolved', content: 'x' }]),
    ];
    const all = await getAll();

    expect(ofMonth(all, new Date('2026-06-15T12:00:00.000Z')).map((i) => i.id)).toEqual(['b', 'a']);
    expect(ofDay(all, new Date('2026-06-20T12:00:00.000Z')).map((i) => i.id)).toEqual(['b']);
  });
});

describe('dates', () => {
  it('reads a stored date without a zone as UTC', async () => {
    collections.incidents = [incident('a', [{ date: '2026-09-28T06:30:00', status: 'resolved', content: 'x' }])];
    collections.maintenances = [maintenance('m', '2026-09-19 05:30')];
    const all = await getAll();

    expect(all.find((i) => i.id === 'a')?.date.toISOString()).toBe('2026-09-28T06:30:00.000Z');
    expect(all.find((i) => i.id === 'm')?.scheduledStart?.toISOString()).toBe('2026-09-19T05:30:00.000Z');
  });

  it('puts an incident in the UTC day and month of its start', async () => {
    // 23:30 UTC on the last day of August: September 1 in Rome and in Tokyo.
    collections.incidents = [incident('a', [{ date: '2026-08-31T23:30:00.000Z', status: 'resolved', content: 'x' }])];
    const all = await getAll();

    expect(ofDay(all, new Date('2026-08-31T00:00:00.000Z')).map((i) => i.id)).toEqual(['a']);
    expect(ofDay(all, new Date('2026-09-01T00:00:00.000Z'))).toEqual([]);
    expect(ofMonth(all, new Date('2026-08-01T00:00:00.000Z')).map((i) => i.id)).toEqual(['a']);
    expect(ofMonth(all, new Date('2026-09-01T00:00:00.000Z'))).toEqual([]);
  });
});
