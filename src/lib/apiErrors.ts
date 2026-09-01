/**
 * JSON error responses for the metrics endpoints. The browser components map
 * these to a human message via `metricsMessage.ts`.
 */

const environment = () =>
  import.meta.env.DEV ? 'dev' : process.env.NETLIFY ? 'netlify' : 'unknown';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** 503 when one or more secrets are unset in this environment. */
export const notConfigured = (missing: string[]) => {
  console.warn(`[metrics] not configured: ${missing.join(', ')} unset`);
  return json({ error: 'not_configured', missing, environment: environment() }, 503);
};

/** 502 when the upstream provider rejects or fails the request. */
export const upstreamError = (service: string, err: unknown) => {
  const code =
    (err as { name?: string; code?: string })?.name ||
    (err as { code?: string })?.code ||
    (err instanceof Error ? err.message : String(err));
  console.warn(`[metrics] ${service} failed: ${code}`);
  return json({ error: 'upstream_error', service, code }, 502);
};

/** Returns the names of the given variables whose value is empty. */
export const missingVars = (vars: Record<string, string | undefined>) =>
  Object.entries(vars)
    .filter(([, value]) => !value)
    .map(([name]) => name);
