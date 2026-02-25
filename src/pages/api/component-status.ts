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

const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function inUtc(date: Date): Date {
  return subMilliseconds(date, -getTimezoneOffset(serverTimezone));
}

async function request({
  url,
  data,
  headers,
}: {
  url: string;
  data?: Record<string, string>;
  headers: Record<string, string>;
}): Promise<any> {
  const queryString = data
    ? '?' + new URLSearchParams(data).toString()
    : '';
  const response = await fetch(url + queryString, { headers });
  if (response.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return await request({ url, data, headers });
  }
  if (response.status !== 200) {
    throw new Error(`Failed ${url} with ${response.status}`);
  }
  return response.json();
}

interface Period {
  status: string;
  startedAt: Date;
  endedAt: Date | null;
}

async function getPeriods(
  checkId: string,
  days: number,
  headers: Record<string, string>,
): Promise<Period[]> {
  const findPeriodsSince = inUtc(startOfDay(subDays(new Date(), days)));

  const response = await request({
    url: `https://api.statuscake.com/v1/uptime/${checkId}/periods?limit=100`,
    headers,
  });

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
      acc + differenceInSeconds(period.endedAt!, period.startedAt),
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
  const headers = {
    Authorization: `Bearer ${STATUSCAKE_API_TOKEN}`,
  };

  return await Promise.all(
    components.map(async ({ id: componentId, checks }) => {
      const allDowntimes: number[] = [];

      const regions = await Promise.all(
        Object.entries(checks).map(async ([regionId, checkId]) => {
          const allPeriods = await getPeriods(checkId, days, headers);
          const downtimePeriods = filterDowntimePeriods(allPeriods);
          const totalDowntime = sumOfDowntimeInSeconds(downtimePeriods);
          const downtimePerDay = calculateDowntimesPerDay(downtimePeriods);

          allDowntimes.push(totalDowntime);

          return {
            id: regionId,
            status: allPeriods[0]?.status || 'up',
            outagesPerDay: downtimePerDay,
          };
        }),
      );

      const problematicRegions = regions.filter((r) => r.status !== 'up');
      const status =
        problematicRegions.length > 0 ? problematicRegions[0].status : 'up';

      return {
        id: componentId,
        status,
        regions,
        totalDowntime: Math.max(...allDowntimes, 0),
      };
    }),
  );
}

export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '60', 10);
  const body = await getStats(isNaN(days) ? 60 : days);

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
};
