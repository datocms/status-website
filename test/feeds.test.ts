import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';
import { GET } from '../src/pages/api/feeds';

const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

type Handler = () => Response | Promise<Response>;

const json = (body: unknown) => () => Response.json(body);
const fail = (status: number) => () => new Response('', { status });
const timeout = () => () => Promise.reject(new DOMException('The operation timed out', 'TimeoutError'));

/** The AWS dashboard serves UTF-16BE. */
const awsBody = (events: unknown[]) => () =>
  new Response(Buffer.from(JSON.stringify(events), 'utf16le').swap16());

const SUPPLIERS = {
  Cloudflare: 'www.cloudflarestatus.com',
  AWS: 'health.aws.amazon.com',
  Pusher: 'status.pusher.com',
  Imgix: 'status.imgix.com',
  Mux: 'status.mux.com',
  Postmark: 'status.postmarkapp.com',
} as const;

const quiet: Record<keyof typeof SUPPLIERS, Handler> = {
  Cloudflare: json({ incidents: [] }),
  AWS: awsBody([]),
  Pusher: json({ incidents: [] }),
  Imgix: json({ incidents: [] }),
  Mux: json({ incidents: [] }),
  Postmark: json({ notices: [] }),
};

const stubSuppliers = (overrides: Partial<Record<keyof typeof SUPPLIERS, Handler>>) => {
  const handlers = { ...quiet, ...overrides };
  vi.stubGlobal('fetch', async (input: URL | string) => {
    const { hostname } = new URL(String(input));
    const name = (Object.keys(SUPPLIERS) as (keyof typeof SUPPLIERS)[]).find((key) => SUPPLIERS[key] === hostname);
    if (!name) throw new Error(`Unexpected request to ${hostname}`);
    return handlers[name]();
  });
};

const get = () => GET({} as APIContext) as Promise<Response>;

const statuspageIncident = (overrides: Record<string, unknown> = {}) => ({
  name: 'Image rendering errors',
  status: 'investigating',
  shortlink: 'https://stspg.io/abc',
  updated_at: ago(HOUR),
  resolved_at: null,
  incident_updates: [{ body: 'We are investigating.', status: 'investigating' }],
  ...overrides,
});

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/feeds', () => {
  it('gives an empty list when every supplier replies and none has an incident', async () => {
    stubSuppliers({});
    const response = await get();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(response.headers.get('x-unreached-suppliers')).toBe('');
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=300');
  });

  it('names a supplier that gave no reply, and keeps the reply for less time', async () => {
    stubSuppliers({ Imgix: timeout(), Mux: fail(500) });
    const response = await get();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(response.headers.get('x-unreached-suppliers')).toBe('Imgix,Mux');
    expect(response.headers.get('access-control-expose-headers')).toBe('X-Unreached-Suppliers');
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=60');
  });

  it('keeps the items of the suppliers that replied', async () => {
    stubSuppliers({ Imgix: timeout(), Mux: json({ incidents: [statuspageIncident({ name: 'Slow API' })] }) });
    const items = await (await get()).json();

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: 'Slow API',
      status: 'Investigating',
      ongoing: true,
      url: 'https://stspg.io/abc',
      description: 'We are investigating.',
      source: { name: 'Mux', homepageUrl: 'https://status.mux.com/' },
    });
  });

  it('replies 503 when no supplier gave a reply', async () => {
    stubSuppliers({
      Cloudflare: fail(500),
      AWS: fail(500),
      Pusher: fail(500),
      Imgix: timeout(),
      Mux: fail(503),
      Postmark: fail(502),
    });
    const response = await get();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'No supplier status could be retrieved' });
  });

  it('puts ongoing incidents first, then the newest first', async () => {
    stubSuppliers({
      Imgix: json({
        incidents: [
          statuspageIncident({ name: 'Resolved now', status: 'resolved', resolved_at: ago(HOUR), updated_at: ago(HOUR) }),
          statuspageIncident({ name: 'Ongoing old', updated_at: ago(30 * HOUR) }),
        ],
      }),
      Mux: json({ incidents: [statuspageIncident({ name: 'Ongoing new', updated_at: ago(2 * HOUR) })] }),
    });
    const items = await (await get()).json();

    expect(items.map((item: { title: string }) => item.title)).toEqual(['Ongoing new', 'Ongoing old', 'Resolved now']);
  });

  it('drops incidents that are stale or resolved long ago', async () => {
    stubSuppliers({
      Imgix: json({
        incidents: [
          statuspageIncident({ name: 'Open for a month', updated_at: ago(30 * 24 * HOUR) }),
          statuspageIncident({ name: 'Resolved last week', status: 'resolved', resolved_at: ago(7 * 24 * HOUR) }),
          statuspageIncident({ name: 'Postmortem today', status: 'postmortem', resolved_at: ago(3 * HOUR) }),
        ],
      }),
    });
    const items = await (await get()).json();

    expect(items.map((item: { title: string }) => item.title)).toEqual(['Postmortem today']);
    expect(items[0].ongoing).toBe(false);
  });

  it('skips the fixed closing phrase of Statuspage and cuts a long text', async () => {
    const long = 'x'.repeat(300);
    stubSuppliers({
      Imgix: json({
        incidents: [
          statuspageIncident({
            status: 'resolved',
            resolved_at: ago(HOUR),
            incident_updates: [
              { body: 'This incident has been resolved.', status: 'resolved' },
              { body: long, status: 'monitoring' },
            ],
          }),
        ],
      }),
    });
    const [item] = await (await get()).json();

    expect(item.description).toBe(`${'x'.repeat(250)}...`);
  });

  it('decodes the UTF-16BE reply of AWS and keeps only our regions and services', async () => {
    const event = (overrides: Record<string, unknown>) => ({
      service: 'RDS',
      region: 'eu-west-1',
      startTime: String(Date.now() - 2 * HOUR),
      lastUpdatedTime: String(Date.now() - HOUR),
      metadata: {
        EVENT_LOG: JSON.stringify([
          { summary: 'Increased error rates', message: 'First message.' },
          { summary: '[RESOLVED] Increased error rates — café', message: 'Last message.' },
        ]),
      },
      ...overrides,
    });
    stubSuppliers({
      AWS: awsBody([
        event({}),
        event({ region: 'ap-south-1' }),
        event({ service: 'LAMBDA' }),
        event({ service: 'EC2', endTime: String(Date.now() - HOUR) }),
      ]),
    });
    const items = await (await get()).json();

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: 'RDS (eu-west-1) — Increased error rates — café',
      description: 'Last message.',
      status: 'Ongoing',
      ongoing: true,
      source: { name: 'AWS' },
    });
    expect(items[1]).toMatchObject({ status: 'Resolved', ongoing: false });
  });

  it('gives every date in UTC, also from a supplier that uses another zone', async () => {
    // Imgix gives its dates in Pacific time.
    const recent = new Date(Date.now() - HOUR);
    const pacific = new Date(recent.getTime() - 7 * HOUR).toISOString().replace('Z', '-07:00');
    stubSuppliers({
      Imgix: json({ incidents: [statuspageIncident({ updated_at: pacific })] }),
      Postmark: json({
        notices: [
          {
            subject: 'Delayed delivery',
            type: 'unplanned',
            state: 'in_progress',
            url: 'https://status.postmarkapp.com/notices/1',
            ended_at: null,
            updated_at: recent.toISOString().replace('Z', '+00:00'),
            latest_update: null,
          },
        ],
      }),
    });
    const items: { date: string }[] = await (await get()).json();

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.date)).toEqual([recent.toISOString(), recent.toISOString()]);
  });

  it('leaves out the planned notices of Postmark', async () => {
    const notice = (overrides: Record<string, unknown>) => ({
      subject: 'Delayed delivery',
      type: 'unplanned',
      state: 'in_progress',
      url: 'https://status.postmarkapp.com/notices/1',
      ended_at: null,
      updated_at: ago(HOUR),
      latest_update: { state: 'in_progress', content: 'We are working on it.' },
      ...overrides,
    });
    stubSuppliers({
      Postmark: json({ notices: [notice({}), notice({ subject: 'Planned work', type: 'planned' })] }),
    });
    const items = await (await get()).json();

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: 'Delayed delivery',
      status: 'In progress',
      ongoing: true,
      description: 'We are working on it.',
      source: { name: 'Postmark' },
    });
  });
});
