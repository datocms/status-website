import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page, Route } from '@playwright/test';
import type { Fixture, FixtureName, Manifest } from './fixtures.ts';
import { BASE_URL } from './port.ts';

/** Reads the manifest of the build under test. Call it inside a test. */
export const manifest = (): Manifest =>
  JSON.parse(readFileSync(join(import.meta.dirname, '.data/manifest.json'), 'utf8'));

export const fixture = (name: FixtureName): Fixture => manifest().items[name];

type Reply = (route: Route) => Promise<void>;

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}): Reply => (route) =>
  route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });

export const html = (status: number): Reply => (route) =>
  route.fulfill({ status, contentType: 'text/html', body: '<html><body>error page</body></html>' });

export interface Region {
  id: string;
  status: string;
  outagesPerDay: { date: string; downtime: number }[];
}

export const region = (id: string, status = 'up', outagesPerDay: Region['outagesPerDay'] = []): Region => ({
  id,
  status,
  outagesPerDay,
});

const CDA_REGIONS = ['asia', 'europe', 'southAmerica', 'northAmerica', 'africa', 'oceania'];

/** Six components, all up. Pass regions for a component to replace its own. */
export const components = (overrides: Record<string, { regions: Region[]; totalDowntime?: number }> = {}) =>
  ['cda', 'cma', 'assets', 'administrativeAreas', 'dashboard', 'site'].map((id) => {
    const regions = overrides[id]?.regions ?? (id === 'cda' ? CDA_REGIONS.map((r) => region(r)) : [region('global')]);
    const known = regions.filter((r) => r.status !== 'unknown');
    const problem = known.find((r) => r.status !== 'up');

    return {
      id,
      status: problem?.status ?? (known.length > 0 ? 'up' : 'unknown'),
      regions,
      totalDowntime: overrides[id]?.totalDowntime ?? 0,
    };
  });

export const metric = (global: number) => ({
  global,
  overTime: Array.from({ length: 6 }, (_, i) => ({
    t: new Date(Date.UTC(2026, 8, 1, 10, i * 10)).toISOString(),
    v: global,
  })),
});

interface Replies {
  componentStatus?: Reply;
  cloudwatch?: Reply;
  feeds?: Reply;
}

/**
 * Gives the replies of the three endpoints. The static host has none, so an
 * endpoint without a reply here answers 404, as on the GitHub Pages mirror.
 */
export const mockApi = async (page: Page, replies: Replies = {}) => {
  const {
    componentStatus = json(components()),
    cloudwatch = (route) =>
      json(metric(new URL(route.request().url()).searchParams.get('graph') === 'api.successRate' ? 99.98 : 123))(route),
    feeds = json([], 200, { 'X-Unreached-Suppliers': '' }),
  } = replies;

  await page.route('**/api/component-status*', componentStatus);
  await page.route('**/api/cloudwatch*', cloudwatch);
  await page.route('**/api/feeds', feeds);
};

/** UTC date as the endpoints write it: 2026-09-28. */
export const dayStamp = (date: Date) => date.toISOString().slice(0, 10);

/** Path of the history page that holds the month of a date. */
export const historyPathFor = (date: string, builtAt: string) => {
  const months = (iso: string) => new Date(iso).getUTCFullYear() * 12 + new Date(iso).getUTCMonth();
  const page = Math.floor((months(builtAt) - months(date)) / 3);

  return page === 0 ? '/history/' : `/history/page/${page}/`;
};

export const monthTitle = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * Serves the build under another host name, so that a test can see the page
 * as one of the live hosts gives it. Call it before `mockApi`: the route that
 * a test adds last gets the request first.
 */
export const serveAs = async (page: Page, hostname: string) => {
  await page.route(`http://${hostname}/**`, async (route) => {
    const { pathname, search } = new URL(route.request().url());
    const response = await page.request.fetch(`${BASE_URL}${pathname}${search}`);

    await route.fulfill({ response });
  });

  return `http://${hostname}`;
};
