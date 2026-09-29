/**
 * Browser-side helper: fetch a metrics endpoint and turn any failure into a
 * short message. Precise in dev, neutral in production.
 */

import { HOSTS } from './hosts';

export type MetricsFailure =
  | { kind: 'not_configured'; missing: string[]; environment: string }
  | { kind: 'upstream_error'; service: string; code: string }
  | { kind: 'mirror' }
  | { kind: 'network'; endpoint: string }
  | { kind: 'unknown'; status: number };

export type MetricsResult<T> =
  | { ok: true; data: T }
  | { ok: false; failure: MetricsFailure };

export async function readMetrics<T>(endpoint: string): Promise<MetricsResult<T>> {
  let res: Response;
  try {
    res = await fetch(endpoint);
  } catch {
    return { ok: false, failure: { kind: 'network', endpoint } };
  }

  const isJson = (res.headers.get('content-type') || '').includes('json');
  if (!isJson) {
    // The static mirror has no server endpoints: 404 with an HTML body. Any
    // other non-JSON reply is an error page from the host or a proxy.
    return {
      ok: false,
      failure: res.status === 404 ? { kind: 'mirror' } : { kind: 'unknown', status: res.status },
    };
  }

  let body;
  try {
    body = await res.json();
  } catch {
    // The reply says JSON, but the body is empty or stops in the middle.
    return { ok: false, failure: { kind: 'unknown', status: res.status } };
  }

  if (res.ok) {
    return { ok: true, data: body as T };
  }
  if (body.error === 'not_configured') {
    return { ok: false, failure: { kind: 'not_configured', missing: body.missing, environment: body.environment } };
  }
  if (body.error === 'upstream_error') {
    return { ok: false, failure: { kind: 'upstream_error', service: body.service, code: body.code } };
  }
  return { ok: false, failure: { kind: 'unknown', status: res.status } };
}

const preciseMessage = (failure: MetricsFailure): string => {
  switch (failure.kind) {
    case 'not_configured':
      return `Metrics disabled: ${failure.missing.join(', ')} not set (${failure.environment === 'dev' ? 'local dev' : failure.environment}).`;
    case 'upstream_error':
      return `Metrics unavailable: ${failure.service} rejected the request (${failure.code}).`;
    case 'mirror':
      return 'Not available on this static mirror.';
    case 'network':
      return `Metrics unavailable: could not reach ${failure.endpoint}.`;
    case 'unknown':
      return `Metrics unavailable: unexpected response (${failure.status}).`;
  }
};

/**
 * Message to show in the UI. In production the precise reason goes to the
 * console only, except for the mirror case, which is safe to show.
 */
export function metricsMessage(failure: MetricsFailure, isDev: boolean): string {
  const precise = preciseMessage(failure);
  if (isDev || failure.kind === 'mirror') {
    return precise;
  }
  console.warn(precise);
  return 'Metrics temporarily unavailable.';
}

/**
 * What a section shows on the static mirror, which has no endpoint to give
 * it data. `subject` starts the sentence: "System metrics are".
 *
 * The fallback procedure can point an address of the main host at the mirror.
 * A link to the main host then leads back to the same page, so it has none.
 */
export const mirrorNotice = (
  subject: string,
  sectionId: string,
  hostname: string = location.hostname,
) => {
  const [main] = HOSTS;
  const text = main.hostnames.includes(hostname)
    ? `${subject} not available while this site runs from its static mirror.`
    : `${subject} not available on this static mirror. See <a href="${main.origin}/#${sectionId}">the main status page</a>.`;

  return `<div class="mirror-notice">${text}</div>`;
};
