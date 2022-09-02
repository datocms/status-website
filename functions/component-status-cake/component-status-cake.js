const fetch = require('node-fetch');
const qs = require('querystring');
const fromUnixTime = require('date-fns/fromUnixTime');
const subDays = require('date-fns/subDays');
const startOfDay = require('date-fns/startOfDay');
const endOfDay = require('date-fns/endOfDay');
const subMilliseconds = require('date-fns/subMilliseconds');
const isSameDay = require('date-fns/isSameDay');
const differenceInSeconds = require('date-fns/differenceInSeconds');
const { toDate, formatInTimeZone, getTimezoneOffset } = require('date-fns-tz');

const headers = {
  Authorization: `Bearer ${process.env.STATUSCAKE_API_TOKEN}`,
};

function debugError(message, error) {
  console.log('------ Error: ', message, error.message, typeof error.body);
}

async function request({ url, data, headers }) {
  const response = await fetch(url + (data ? '?' + qs.stringify(data) : ''), {
    headers,
  });
  if (response.status !== 200) {
    throw new Error(`Failed ${url} with ${response.status}`);
  }
  const body = await response.json();
  return body;
}

const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function inUtc(date) {
  return subMilliseconds(date, -getTimezoneOffset(serverTimezone));
}

async function getPeriods(checkId, days) {
  const findPeriodsSince = inUtc(startOfDay(subDays(new Date(), days)));

  try {
    let nextUrl = `https://api.statuscake.com/v1/uptime/${checkId}/periods?limit=100`;
    let paginatedPeriods = [];

    while (nextUrl) {
      const response = await request({ url: nextUrl, headers });

      console.log(response);

      const interestingPeriods = response.data
        .map(period => ({
          status: period.status,
          startedAt: toDate(period.created_at),
          endedAt: period.ended_at ? toDate(period.ended_at) : null,
        }))
        .filter(period => {
          return (
            period.startedAt >= findPeriodsSince ||
            period.endedAt >= findPeriodsSince
          );
        });

      nextUrl =
        interestingPeriods.length != response.data ? null : response.links.next;

      paginatedPeriods = [...paginatedPeriods, ...interestingPeriods];
    }

    return paginatedPeriods;
  } catch (error) {
    debugError(`getPeriods ${checkId}`, error);
    throw error;
  }
}

function filterDowntimePeriods(periods) {
  return periods.filter(period => period.status === 'down');
}

function splitPeriodsInBetweenDays(periods) {
  const result = [];

  for (const period of periods) {
    if (isSameDay(period.startedAt, period.endedAt)) {
      result.push(period);
    } else {
      result.push({
        startedAt: period.startedAt,
        endedAt: inUtc(endOfDay(period.startedAt)),
      });
      result.push({
        startedAt: inUtc(startOfDay(period.endedAt)),
        endedAt: period.endedAt,
      });
    }
  }

  return result;
}

function sumOfDowntimeInSeconds(periods) {
  return periods.reduce(
    (acc, period) =>
      acc + differenceInSeconds(period.endedAt, period.startedAt),
    0,
  );
}

function calculateDowntimesPerDay(periods) {
  const result = {};

  for (const period of splitPeriodsInBetweenDays(periods)) {
    const date = formatInTimeZone(period.startedAt, 'Etc/UTC', 'yyyy-MM-dd');

    if (!result[date]) {
      result[date] = 0;
    }

    result[date] += differenceInSeconds(period.endedAt, period.startedAt);
  }

  return Object.entries(result).map(([date, downtime]) => ({ date, downtime }));
}

const components = [
  {
    id: 'cda',
    checks: {
      asia: '6489758',
      europe: '6489760',
      latinAmerica: '6489761',
      northAmerica: '6489762',
    },
  },
  {
    id: 'cma',
    checks: {
      northAmericaAndEurope: '6489764',
    },
  },
  {
    id: 'assets',
    checks: {
      northAmericaAndEurope: '6489849',
    },
  },
  {
    id: 'administrativeAreas',
    checks: {
      northAmericaAndEurope: '6489740',
    },
  },
  {
    id: 'dashboard',
    checks: {
      northAmericaAndEurope: '6489780',
    },
  },
  {
    id: 'site',
    checks: {
      northAmericaAndEurope: '6489782',
    },
  },
];

async function getPingdomStats(days) {
  const result = await Promise.all(
    components.map(async ({ id: componentId, checks }) => {
      const allDowntimes = [];

      const regions = await Promise.all(
        Object.entries(checks).map(async ([regionId, checkId]) => {
          const allPeriods = await getPeriods(checkId, days);
          const downtimePeriods = filterDowntimePeriods(allPeriods);
          const totalDowntime = sumOfDowntimeInSeconds(downtimePeriods);
          const downtimePerDay = calculateDowntimesPerDay(downtimePeriods);

          allDowntimes.push(totalDowntime);

          return {
            id: regionId,
            status: allPeriods[0].status,
            outagesPerDay: downtimePerDay,
          };
        }),
      );

      const problematicRegions = regions.filter(
        region => region.status !== 'up',
      );
      const status =
        problematicRegions.length > 0 ? problematicRegions[0].status : 'up';

      return {
        id: componentId,
        status,
        regions,
        totalDowntime: Math.max(...allDowntimes),
      };
    }),
  );

  return result;
}

async function handler(event) {
  const { days } = event.queryStringParameters;
  const parsedDays = parseInt(days, 10);

  const body = await getPingdomStats(isNaN(parsedDays) ? 0 : parsedDays);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000',
      'Cache-Control': 'public, s-maxage=1800',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = handler;
