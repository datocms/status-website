import { describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

vi.mock('astro:env/server', () => ({
  CLOUDWATCH_AWS_REGION: 'us-east-1',
  CLOUDWATCH_AWS_ACCESS_KEY_ID: undefined,
  CLOUDWATCH_AWS_SECRET_ACCESS_KEY: undefined,
}));

const { GET } = await import('../src/pages/api/cloudwatch');

describe('/api/cloudwatch without keys', () => {
  it('replies 503 with the names of the variables', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const response = (await GET({
      url: new URL('https://status.datocms.com/api/cloudwatch?graph=cda.responseTime'),
    } as APIContext)) as Response;

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'not_configured',
      missing: ['CLOUDWATCH_AWS_ACCESS_KEY_ID', 'CLOUDWATCH_AWS_SECRET_ACCESS_KEY'],
      environment: 'dev',
    });
  });
});
