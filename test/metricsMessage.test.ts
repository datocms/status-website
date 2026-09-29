import { afterEach, describe, expect, it, vi } from 'vitest';
import { metricsMessage, mirrorNotice, readMetrics } from '../src/lib/metricsMessage';

const reply = (status: number, body: string, contentType?: string) =>
  new Response(body, { status, headers: contentType ? { 'content-type': contentType } : {} });

const stubFetch = (response: Response | Error) =>
  vi.stubGlobal('fetch', async () => {
    if (response instanceof Error) throw response;
    return response;
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('readMetrics', () => {
  it('gives the data of a JSON reply', async () => {
    stubFetch(reply(200, '[{"id":"cda"}]', 'application/json'));
    expect(await readMetrics('/api/x')).toEqual({ ok: true, data: [{ id: 'cda' }] });
  });

  it('takes a 404 without JSON for the static mirror', async () => {
    stubFetch(reply(404, '<html>', 'text/html'));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'mirror' } });
  });

  it('does not take an error page of the host for the mirror', async () => {
    stubFetch(reply(502, '<html>', 'text/html'));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'unknown', status: 502 } });

    stubFetch(reply(504, ''));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'unknown', status: 504 } });
  });

  it('reads the two error bodies of the endpoints', async () => {
    stubFetch(reply(503, JSON.stringify({ error: 'not_configured', missing: ['STATUSCAKE_API_TOKEN'], environment: 'dev' }), 'application/json'));
    expect(await readMetrics('/api/x')).toEqual({
      ok: false,
      failure: { kind: 'not_configured', missing: ['STATUSCAKE_API_TOKEN'], environment: 'dev' },
    });

    stubFetch(reply(502, JSON.stringify({ error: 'upstream_error', service: 'AWS CloudWatch', code: 'InvalidClientTokenId' }), 'application/json'));
    expect(await readMetrics('/api/x')).toEqual({
      ok: false,
      failure: { kind: 'upstream_error', service: 'AWS CloudWatch', code: 'InvalidClientTokenId' },
    });
  });

  it('gives the status of a JSON error that it does not know', async () => {
    stubFetch(reply(503, JSON.stringify({ error: 'StatusCake gave no data for any check' }), 'application/json'));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'unknown', status: 503 } });
  });

  it('reports a body that is not JSON, though the reply says that it is', async () => {
    stubFetch(reply(200, '{"id": "cda", "regio', 'application/json'));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'unknown', status: 200 } });

    stubFetch(reply(503, '', 'application/json'));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'unknown', status: 503 } });
  });

  it('reports a request that got no reply', async () => {
    stubFetch(new TypeError('Failed to fetch'));
    expect(await readMetrics('/api/x')).toEqual({ ok: false, failure: { kind: 'network', endpoint: '/api/x' } });
  });
});

describe('metricsMessage', () => {
  it('gives the precise cause on the dev server', () => {
    expect(metricsMessage({ kind: 'not_configured', missing: ['A', 'B'], environment: 'dev' }, true)).toBe(
      'Metrics disabled: A, B not set (local dev).',
    );
    expect(metricsMessage({ kind: 'upstream_error', service: 'StatusCake', code: 'HTTP 401' }, true)).toBe(
      'Metrics unavailable: StatusCake rejected the request (HTTP 401).',
    );
    expect(metricsMessage({ kind: 'network', endpoint: '/api/x' }, true)).toBe('Metrics unavailable: could not reach /api/x.');
  });

  it('gives a neutral line in production and logs the cause', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(metricsMessage({ kind: 'not_configured', missing: ['A'], environment: 'netlify' }, false)).toBe(
      'Metrics temporarily unavailable.',
    );
    expect(warn).toHaveBeenCalledWith('Metrics disabled: A not set (netlify).');
  });

  it('names the mirror in production too, because no secret is involved', () => {
    expect(metricsMessage({ kind: 'mirror' }, false)).toBe('Not available on this static mirror.');
  });
});

describe('mirrorNotice', () => {
  it('names what is missing and links to the same section on the main host', () => {
    expect(mirrorNotice('System metrics are', 'system-metrics', 'status2.datocms.com')).toBe(
      '<div class="mirror-notice">System metrics are not available on this static mirror. ' +
        'See <a href="https://status.datocms.com/#system-metrics">the main status page</a>.</div>',
    );
  });

  it('treats a host that it does not know as a mirror', () => {
    expect(mirrorNotice('Component status is', 'component-status', 'localhost')).toContain(
      'href="https://status.datocms.com/#component-status"',
    );
  });

  it('gives no link when the mirror serves an address of the main host', () => {
    for (const hostname of ['status.datocms.com', 'datocms-status.com']) {
      expect(mirrorNotice('Third-party status is', 'third-party-components', hostname)).toBe(
        '<div class="mirror-notice">Third-party status is not available while this site runs from its static mirror.</div>',
      );
    }
  });
});
