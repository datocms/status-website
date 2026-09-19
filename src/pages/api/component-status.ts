import type { APIRoute } from 'astro';
import {
  subDays,
  startOfDay,
  endOfDay,
  subMilliseconds,
  isSameDay,
  differenceInSeconds,
} from 'date-fns';
import { toDate, formatInTimeZone, getTimezoneOffset } from 'date-fns-tz';
import pMap from 'p-map';
import { STATUSCAKE_API_TOKEN } from 'astro:env/server';

export const prerender = false;

const components = [
  {
    id: 'cda',
    checks: {
      asia: '6489758',
      europe: '6489760',
      southAmerica: '6489761',
      northAmerica: '6489762',
      africa: '7076631',
      oceania: '7076632',
    },
  },
  { id: 'cma', checks: { global: '6489764' } },
  { id: 'assets', checks: { global: '6489849' } },
  { id: 'administrativeAreas', checks: { global: '6489740' } },
  { id: 'dashboard', checks: { global: '6489780' } },
  { id: 'site', checks: { global: '6489782' } },
];

// StatusCake replies with 429 and 5xx errors when too many requests arrive at
// the same moment. There are 11 checks: send them a few at a time, and let a
// request that failed try again.
const MAX_PARALLEL_REQUESTS = 3;
const MAX_ATTEMPTS = 3;
const FIRST_RETRY_DELAY_IN_MS = 300;
const ATTEMPT_TIMEOUT_IN_MS = 4000;

// Netlify stops a synchronous function after 10 seconds. Pro and Enterprise
// plans can ask Netlify to move this limit to 26 seconds; if that happens for
// this site, you can make the budget below larger. Stop the requests before
// the limit and give the data that is available: a reply that is not complete
// is better than a function that Netlify kills.
const TOTAL_BUDGET_IN_MS = 8000;

const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function inUtc(date: Date): Date {
  return subMilliseconds(date, -getTimezoneOffset(serverTimezone));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const headers = { Authorization: `Bearer ${STATUSCAKE_API_TOKEN}` };

async function request(url: string, deadline: AbortSignal): Promise<any> {
  let failure = 'no time left';

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS && !deadline.aborted;
    attempt += 1
  ) {
    if (attempt > 1) {
      // Wait longer at each attempt. The random part keeps the parallel
      // requests from trying again all at the same moment.
      await sleep(
        FIRST_RETRY_DELAY_IN_MS * 2 ** (attempt - 2) + Math.random() * 250,
      );
    }

    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.any([
          deadline,
          AbortSignal.timeout(ATTEMPT_TIMEOUT_IN_MS),
        ]),
      });

      if (response.ok) {
        return await response.json();
      }

      failure = `HTTP ${response.status}`;

      // Too many requests and server errors go away after some time. Other
      // codes, such as a bad token, give the same result at each attempt.
      if (response.status !== 429 && response.status < 500) {
        break;
      }
    } catch (error) {
      // There is no reply: the network failed, or the request took too much
      // time.
      failure = (error as Error).message;
    }
  }

  throw new Error(`${url} failed (${failure})`);
}

interface Period {
  status: string;
  startedAt: Date;
  endedAt: Date | null;
}

async function getPeriods(
  checkId: string,
  days: number,
  deadline: AbortSignal,
): Promise<Period[]> {
  const findPeriodsSince = inUtc(startOfDay(subDays(new Date(), days)));

  const response = await request(
    `https://api.statuscake.com/v1/uptime/${checkId}/periods?limit=100`,
    deadline,
  );

  return response.data
    .map((period: any) => ({
      status: period.status,
      startedAt: toDate(period.created_at),
      endedAt: period.ended_at ? toDate(period.ended_at) : null,
    }))
    .filter((period: Period) => {
      return (
        period.startedAt >= findPeriodsSince ||
        !period.endedAt ||
        period.endedAt >= findPeriodsSince
      );
    });
}

function filterDowntimePeriods(periods: Period[]): Period[] {
  return periods.filter((period) => period.status === 'down');
}

function splitPeriodsInBetweenDays(periods: Period[]): Period[] {
  const result: Period[] = [];

  for (const period of periods) {
    if (!period.endedAt || isSameDay(period.startedAt, period.endedAt)) {
      result.push(period);
    } else {
      result.push({
        status: period.status,
        startedAt: period.startedAt,
        endedAt: inUtc(endOfDay(period.startedAt)),
      });
      result.push({
        status: period.status,
        startedAt: inUtc(startOfDay(period.endedAt)),
        endedAt: period.endedAt,
      });
    }
  }

  return result;
}

function sumOfDowntimeInSeconds(periods: Period[]): number {
  return periods.reduce(
    (acc, period) =>
      acc +
      // A downtime that continues has no end date: count it until now.
      differenceInSeconds(period.endedAt || new Date(), period.startedAt),
    0,
  );
}

function calculateDowntimesPerDay(periods: Period[]) {
  const result: Record<string, number> = {};

  for (const period of splitPeriodsInBetweenDays(periods)) {
    const date = formatInTimeZone(period.startedAt, 'Etc/UTC', 'yyyy-MM-dd');
    if (!result[date]) result[date] = 0;
    result[date] += differenceInSeconds(
      period.endedAt || new Date(),
      period.startedAt,
    );
  }

  return Object.entries(result).map(([date, downtime]) => ({ date, downtime }));
}

async function getStats(days: number) {
  // One time budget for all the checks together. When it ends, the checks that
  // are not done stop immediately and become `unknown`.
  const deadline = AbortSignal.timeout(TOTAL_BUDGET_IN_MS);

  // Put all the checks in one flat list, then do them a few at a time.
  const checks = components.flatMap(({ id: componentId, checks }) =>
    Object.entries(checks).map(([regionId, checkId]) => ({
      componentId,
      regionId,
      checkId,
    })),
  );

  const results = await pMap(
    checks,
    async ({ componentId, regionId, checkId }) => {
      // A check that fails must not stop the checks of the other components.
      const allPeriods = await getPeriods(checkId, days, deadline).catch(
        (error) => {
          console.error(
            `StatusCake check ${checkId} (${componentId}/${regionId}) failed: ${error.message}`,
          );
          return null;
        },
      );
      const downtimePeriods = filterDowntimePeriods(allPeriods ?? []);

      return {
        componentId,
        region: {
          id: regionId,
          // Show a check that failed as `unknown`, not as an outage: a
          // StatusCake problem is not a DatoCMS problem, and this page must
          // not report a false outage.
          status: allPeriods ? allPeriods[0]?.status || 'up' : 'unknown',
          outagesPerDay: calculateDowntimesPerDay(downtimePeriods),
        },
        totalDowntime: sumOfDowntimeInSeconds(downtimePeriods),
      };
    },
    { concurrency: MAX_PARALLEL_REQUESTS },
  );

  return components.map(({ id }) => {
    const componentResults = results.filter(
      (result) => result.componentId === id,
    );
    const regions = componentResults.map((result) => result.region);
    const knownRegions = regions.filter(
      (region) => region.status !== 'unknown',
    );
    const problematicRegion = knownRegions.find(
      (region) => region.status !== 'up',
    );

    return {
      id,
      status:
        problematicRegion?.status ??
        (knownRegions.length > 0 ? 'up' : 'unknown'),
      regions,
      totalDowntime: Math.max(
        ...componentResults.map((result) => result.totalDowntime),
        0,
      ),
    };
  });
}

function jsonResponse(body: unknown, status: number, cacheControl: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': cacheControl,
    },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '60', 10);
  const body = await getStats(isNaN(days) ? 60 : days);

  // No check gave data at all: tell the client, and do not keep this reply in
  // the CDN.
  if (body.every((component) => component.status === 'unknown')) {
    return jsonResponse(
      { error: 'StatusCake gave no data for any check' },
      503,
      'no-store',
    );
  }

  const isComplete = body.every((component) =>
    component.regions.every((region) => region.status !== 'unknown'),
  );

  // Keep the reply in the CDN, because each visitor must not start a new group
  // of 11 StatusCake requests. Data that is not complete stays for less time,
  // so that it goes away quickly.
  return jsonResponse(
    body,
    200,
    isComplete
      ? 'public, s-maxage=300, stale-while-revalidate=600'
      : 'public, s-maxage=60',
  );
};
