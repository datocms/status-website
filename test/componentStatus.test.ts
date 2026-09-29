import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

vi.mock('astro:env/server', () => ({ STATUSCAKE_API_TOKEN: 'test-token' }));

const { GET } = await import('../src/pages/api/component-status');

const CDA_EUROPE = '6489760';
const CMA = '6489764';

type Handler = (checkId: string, call: number) => Response;

const periods = (data: unknown[]) => Response.json({ data });
const up = () => periods([{ status: 'up', created_at: '2026-01-01T00:00:00+00:00', ended_at: null }]);

const stubStatusCake = (handler: Handler) => {
  const calls: Record<string, number> = {};
  const seen: { url: string; authorization: string | null }[] = [];

  vi.stubGlobal('fetch', async (input: URL | string, init?: RequestInit) => {
    const url = String(input);
    const checkId = /uptime\/(\d+)\/periods/.exec(url)![1];
    calls[checkId] = (calls[checkId] ?? 0) + 1;
    seen.push({ url, authorization: new Headers(init?.headers).get('authorization') });
    return handler(checkId, calls[checkId]);
  });

  return { calls, seen };
};

const get = (query = '') =>
  GET({ url: new URL(`https://status.datocms.com/api/component-status${query}`) } as APIContext) as Promise<Response>;

interface Component {
  id: string;
  status: string;
  totalDowntime: number;
  regions: { id: string; status: string; outagesPerDay: { date: string; downtime: number }[] }[];
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/component-status', () => {
  it('reports every component up, and keeps the reply for 5 minutes', async () => {
    const { seen } = stubStatusCake(up);
    const response = await get('?days=30');
    const body: Component[] = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=300, stale-while-revalidate=600');
    expect(body.map((c) => c.id)).toEqual(['cda', 'cma', 'assets', 'administrativeAreas', 'dashboard', 'site']);
    expect(body.every((c) => c.status === 'up' && c.totalDowntime === 0)).toBe(true);
    expect(body[0].regions.map((r) => r.id)).toEqual(['asia', 'europe', 'southAmerica', 'northAmerica', 'africa', 'oceania']);
    expect(seen).toHaveLength(11);
    expect(seen.every((request) => request.authorization === 'Bearer test-token')).toBe(true);
  });

  it('makes only the region of a failed check unknown', async () => {
    stubStatusCake((checkId) => (checkId === CDA_EUROPE ? new Response('', { status: 401 }) : up()));
    const response = await get();
    const body: Component[] = await response.json();
    const cda = body.find((c) => c.id === 'cda')!;

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=60');
    expect(cda.status).toBe('up');
    expect(cda.regions.find((r) => r.id === 'europe')?.status).toBe('unknown');
    expect(cda.regions.filter((r) => r.status === 'up')).toHaveLength(5);
    expect(body.filter((c) => c.id !== 'cda').every((c) => c.status === 'up')).toBe(true);
  });

  it('does not show a failed check as an outage', async () => {
    stubStatusCake((checkId) => (checkId === CMA ? new Response('', { status: 401 }) : up()));
    const body: Component[] = await (await get()).json();

    expect(body.find((c) => c.id === 'cma')).toMatchObject({ status: 'unknown', totalDowntime: 0 });
  });

  it('replies 503 when no check gave data', async () => {
    stubStatusCake(() => new Response('', { status: 401 }));
    const response = await get();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'StatusCake gave no data for any check' });
  });

  it('does not try again after an error that a new attempt cannot fix', async () => {
    const { calls } = stubStatusCake((checkId) => (checkId === CMA ? new Response('', { status: 401 }) : up()));
    await get();

    expect(calls[CMA]).toBe(1);
  });

  it('tries again after a 429', async () => {
    const { calls } = stubStatusCake((checkId, call) =>
      checkId === CMA && call === 1 ? new Response('', { status: 429 }) : up(),
    );
    const body: Component[] = await (await get()).json();

    expect(calls[CMA]).toBe(2);
    expect(body.find((c) => c.id === 'cma')?.status).toBe('up');
  });

  it('reports a downtime, per day and in total', async () => {
    const now = Date.now();
    const started = new Date(now - 3 * 60 * 60 * 1000);
    const ended = new Date(now - 2 * 60 * 60 * 1000);
    stubStatusCake((checkId) =>
      checkId === CMA
        ? periods([
            { status: 'up', created_at: ended.toISOString(), ended_at: null },
            { status: 'down', created_at: started.toISOString(), ended_at: ended.toISOString() },
          ])
        : up(),
    );
    const body: Component[] = await (await get()).json();
    const cma = body.find((c) => c.id === 'cma')!;

    expect(cma.status).toBe('up');
    expect(cma.totalDowntime).toBe(3600);
    expect(cma.regions[0].outagesPerDay.reduce((sum, day) => sum + day.downtime, 0)).toBe(3600);
  });

  it('shows a check that is down now as an outage', async () => {
    stubStatusCake((checkId) =>
      checkId === CMA
        ? periods([{ status: 'down', created_at: new Date(Date.now() - 600_000).toISOString(), ended_at: null }])
        : up(),
    );
    const body: Component[] = await (await get()).json();
    const cma = body.find((c) => c.id === 'cma')!;

    expect(cma.status).toBe('down');
    expect(cma.totalDowntime).toBeGreaterThanOrEqual(600);
  });
});
