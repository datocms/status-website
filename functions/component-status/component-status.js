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
const Redis = require('ioredis');

const components = [
  {
    id: 'cda',
    checks: {
      asia: '6489758',
      europe: '6489760',
      southAmerica: '6489761',
      northAmerica: '6489762',
      africa: '7076631',
      oceania: '7076632'
    },
  },
  {
    id: 'cma',
    checks: {
      global: '6489764',
    },
  },
  {
    id: 'assets',
    checks: {
      global: '6489849',
    },
  },
  {
    id: 'administrativeAreas',
    checks: {
      global: '6489740',
    },
  },
  {
    id: 'dashboard',
    checks: {
      global: '6489780',
    },
  },
  {
    id: 'site',
    checks: {
      global: '6489782',
    },
  },
];

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
  if (response.status === 429) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await request({ url, data, headers });
  }
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
    const response = await request({
      url: `https://api.statuscake.com/v1/uptime/${checkId}/periods?limit=100`,
      headers,
    });

    const interestingPeriods = response.data
      .map(period => ({
        status: period.status,
        startedAt: toDate(period.created_at),
        endedAt: period.ended_at ? toDate(period.ended_at) : null,
      }))
      .filter(period => {
        return (
          period.startedAt >= findPeriodsSince ||
          !period.endedAt ||
          period.endedAt >= findPeriodsSince
        );
      });

    return interestingPeriods;
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
    if (!period.endedAt || isSameDay(period.startedAt, period.endedAt)) {
      result.push(period);
    } else {
      result.push({
        status: periods.status,
        startedAt: period.startedAt,
        endedAt: inUtc(endOfDay(period.startedAt)),
      });
      result.push({
        status: periods.status,
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

    result[date] += differenceInSeconds(
      period.endedAt || new Date(),
      period.startedAt,
    );
  }

  return Object.entries(result).map(([date, downtime]) => ({ date, downtime }));
}

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

async function getMaybeCachedPingdomStats(days) {
  // const client = new Redis(process.env.REDIS_URL);
  // const result = await client.get(`status_cake.${days}_days`);

  // if (result) {
  //   return JSON.parse(result);
  // }

  const body = await getPingdomStats(days);
  // await client.set(`status_cake.${days}_days`, JSON.stringify(body), 'EX', 60);

  return body;
}

async function handler(event) {
  const { days } = event.queryStringParameters;
  const parsedDays = parseInt(days, 10);

  const body = await getMaybeCachedPingdomStats(
    isNaN(parsedDays) ? 60 : parsedDays,
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = handler;
