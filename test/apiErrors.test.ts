import { afterEach, describe, expect, it, vi } from 'vitest';
import { missingVars, notConfigured, upstreamError } from '../src/lib/apiErrors';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('missingVars', () => {
  it('names the variables that have no value', () => {
    expect(missingVars({ A: 'x', B: undefined, C: '' })).toEqual(['B', 'C']);
    expect(missingVars({ A: 'x' })).toEqual([]);
  });
});

describe('notConfigured', () => {
  it('replies 503 with the names and never a value', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const response = notConfigured(['STATUSCAKE_API_TOKEN']);

    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      error: 'not_configured',
      missing: ['STATUSCAKE_API_TOKEN'],
      environment: 'dev',
    });
  });

  it('says netlify when Netlify runs the function', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('DEV', false);
    vi.stubEnv('NETLIFY', 'true');

    expect((await notConfigured(['A']).json()).environment).toBe('netlify');
  });
});

describe('upstreamError', () => {
  it('replies 502 with the service and the error name', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = Object.assign(new Error('The security token is invalid'), { name: 'InvalidClientTokenId' });
    const response = upstreamError('AWS CloudWatch', error);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'upstream_error',
      service: 'AWS CloudWatch',
      code: 'InvalidClientTokenId',
    });
  });
});
