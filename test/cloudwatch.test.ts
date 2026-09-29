import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

const send = vi.fn();

vi.mock('astro:env/server', () => ({
  CLOUDWATCH_AWS_REGION: 'us-east-1',
  CLOUDWATCH_AWS_ACCESS_KEY_ID: 'key',
  CLOUDWATCH_AWS_SECRET_ACCESS_KEY: 'secret',
}));

vi.mock('@aws-sdk/client-cloudwatch', () => ({
  CloudWatchClient: class {
    send = send;
  },
  GetMetricDataCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));

const { GET } = await import('../src/pages/api/cloudwatch');

const get = (query: string) =>
  GET({ url: new URL(`https://status.datocms.com/api/cloudwatch${query}`) } as APIContext) as Promise<Response>;

const T1 = new Date('2026-09-01T10:00:00.000Z');
const T2 = new Date('2026-09-01T10:10:00.000Z');

beforeEach(() => {
  send.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/api/cloudwatch', () => {
  it('rejects a graph that it does not know', async () => {
    const response = await get('?graph=nope');

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid graph parameter' });
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a time span that it does not know', async () => {
    for (const query of ['?graph=cda.responseTime&time=bogus', '?graph=cda.responseTime&time=day?r=1', '?graph=cda.responseTime&time=__proto__']) {
      expect((await get(query)).status, query).toBe(400);
    }

    const response = await get('?graph=cda.responseTime&time=year');
    expect(await response.json()).toEqual({ error: 'Invalid time parameter' });
    expect(send).not.toHaveBeenCalled();
  });

  it('gives the response time over time and as one value', async () => {
    send.mockResolvedValue({
      MetricDataResults: [
        { Timestamps: [T1, T2], Values: [120.4, 130.6] },
        { Timestamps: [T1], Values: [125.5] },
      ],
    });
    const response = await get('?graph=cda.responseTime&time=day');

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=1800');
    expect(await response.json()).toEqual({
      overTime: [
        { t: T1.toISOString(), v: 120 },
        { t: T2.toISOString(), v: 131 },
      ],
      global: 126,
    });
  });

  it('computes the success rate from the success and error counts', async () => {
    send.mockResolvedValue({
      MetricDataResults: [
        { Timestamps: [T1, T2], Values: [999, 500] },
        { Timestamps: [T1], Values: [1] },
        { Timestamps: [T1], Values: [9990] },
        { Timestamps: [T1], Values: [10] },
      ],
    });
    const body = await (await get('?graph=api.successRate&time=week')).json();

    expect(body).toEqual({
      overTime: [
        { t: T1.toISOString(), v: 99.9 },
        { t: T2.toISOString(), v: 100 },
      ],
      global: 99.9,
    });
  });

  it('asks for a longer period when the time span is longer', async () => {
    send.mockResolvedValue({ MetricDataResults: [{ Timestamps: [], Values: [] }, { Timestamps: [], Values: [1] }] });

    const periodFor = async (time: string) => {
      send.mockClear();
      await get(`?graph=cda.responseTime&time=${time}`);
      return send.mock.calls[0][0].input.MetricDataQueries[0].MetricStat.Period;
    };

    expect(await periodFor('day')).toBe(600);
    expect(await periodFor('week')).toBe(3600);
    expect(await periodFor('month')).toBe(7200);
  });

  it('replies 502 with the error name when AWS rejects the request', async () => {
    send.mockRejectedValue(Object.assign(new Error('The security token is invalid'), { name: 'InvalidClientTokenId' }));
    const response = await get('?graph=cda.responseTime');

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'upstream_error',
      service: 'AWS CloudWatch',
      code: 'InvalidClientTokenId',
    });
  });
});
