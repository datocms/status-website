const fetch = require('node-fetch');
const qs = require('querystring');
const fromUnixTime = require('date-fns/fromUnixTime');
const subDays = require('date-fns/subDays');
const getUnixTime = require('date-fns/getUnixTime');
const { format: formatDate } = require('date-fns-tz');

const headers = {
  Authorization: `Bearer ${process.env.PINGDOM_API_TOKEN}`,
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

async function getDailyStats(checkId, days = 90) {
  try {
    const response = await request({
      url: `https://api.pingdom.com/api/3.1/summary.performance/${checkId}`,
      data: {
        resolution: 'day',
        includeuptime: true,
        from: getUnixTime(subDays(new Date(), days)),
      },
      headers,
    });

    return response.summary.days;
  } catch (error) {
    debugError(`getDailyStats ${checkId}`, error);
    throw error;
  }
}

async function getTotalDowntime(checkId, days = 90) {
  try {
    const response = await request({
      url: `https://api.pingdom.com/api/3.1/summary.average/${checkId}`,
      data: {
        includeuptime: true,
        from: getUnixTime(subDays(new Date(), days)),
      },
      headers,
    });

    return response.summary.status.totaldown;
  } catch (error) {
    debugError(`getTotalDowntime ${checkId}`, error);
    throw error;
  }
}

async function getStatus(checkId) {
  try {
    const response = await request({
      url: `https://api.pingdom.com/api/3.1/checks/${checkId}`,
      headers,
    });

    return response.check.status;
  } catch (error) {
    debugError(`getStatus ${checkId}`, error);
    throw error;
  }
}

const components = [
  {
    id: 'cda',
    checks: {
      asia: '5311673',
      europe: '5311672',
      latinAmerica: '5311680',
      northAmerica: '5306107',
    },
  },
  {
    id: 'cma',
    checks: {
      northAmericaAndEurope: '5311760',
    },
  },
  {
    id: 'assets',
    checks: {
      northAmericaAndEurope: '5318433',
    },
  },
  {
    id: 'administrativeAreas',
    checks: {
      northAmericaAndEurope: '5311757',
    },
  },
  {
    id: 'dashboard',
    checks: {
      northAmericaAndEurope: '5311755',
    },
  },
  {
    id: 'site',
    checks: {
      northAmericaAndEurope: '5311758',
    },
  },
];

async function getPingdomStats(days) {
  const result = await Promise.all(
    components.map(async ({ id: componentId, checks }) => {
      const allDowntimes = [];

      const regions = await Promise.all(
        Object.entries(checks).map(async ([regionId, checkId]) => {
          const [dailyStats, status, downTimePerRegion] = await Promise.all([
            getDailyStats(checkId, days),
            getStatus(checkId),
            getTotalDowntime(checkId, days),
          ]);

          allDowntimes.push(downTimePerRegion);

          return {
            id: regionId,
            status,
            outagesPerDay: dailyStats
              .filter(({ downtime }) => downtime > 0)
              .map(({ starttime: date, downtime }) => ({
                // - unix timestamps are in seconds
                // - unix timestamps should be always relative to UTC, but Pingdom returns them based on Account settings (in our case, UTC)
                //   -> fromUnixTime returns dates in UTC
                // - JS getTimezoneOffset() method returns the time zone difference, in minutes, from current locale (host system settings) to UTC.
                date: formatDate(fromUnixTime(date), 'yyyy-MM-dd', {
                  timeZone: 'UTC',
                }),
                rawDate: date,
                downtime,
              })),
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
