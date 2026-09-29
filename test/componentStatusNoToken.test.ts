import { afterEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

vi.mock('astro:env/server', () => ({ STATUSCAKE_API_TOKEN: undefined }));

const { GET } = await import('../src/pages/api/component-status');

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/component-status without a token', () => {
  it('replies 503 with the name of the variable, and sends no request', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const response = (await GET({
      url: new URL('https://status.datocms.com/api/component-status'),
    } as APIContext)) as Response;

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'not_configured',
      missing: ['STATUSCAKE_API_TOKEN'],
      environment: 'dev',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
