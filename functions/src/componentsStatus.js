import request from 'axios';
import fromUnixTime from 'date-fns/fromUnixTime';
import formatDate from 'date-fns/format';
import subDays from 'date-fns/subDays';
import getUnixTime from 'date-fns/getUnixTime';
import dotenv from 'dotenv';

dotenv.config();

const headers = {
  'Account-Email': process.env.PINGDOM_ACCOUNT_EMAIL,
  Authorization: `Basic ${process.env.PINGDOM_AUTHORIZATION_KEY}`,
  'App-Key': process.env.PINGDOM_APP_KEY,
};

function debugError(error) {
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log('Error: ', error.message);
  }
}

async function getDailyStats(checkId, days = 90) {
  try {
    const response = await request.get(
      `https://api.pingdom.com/api/2.1/summary.performance/${checkId}`,
      {
        params: {
          resolution: 'day',
          includeuptime: true,
          from: getUnixTime(subDays(new Date(), days)),
        },
        headers,
      },
    );

    return response.data.summary.days;
  } catch (error) {
    debugError(error);
    throw error;
  }
}

async function getTotalDowntime(checkId, days = 90) {
  try {
    const response = await request.get(
      `https://api.pingdom.com/api/2.1/summary.average/${checkId}`,
      {
        params: {
          includeuptime: true,
          from: getUnixTime(subDays(new Date(), days)),
        },
        headers,
      },
    );

    return response.data.summary.status.totaldown;
  } catch (error) {
    debugError(error);
    throw error;
  }
}

async function getStatus(checkId) {
  try {
    const response = await request.get(
      `https://api.pingdom.com/api/2.1/checks/${checkId}`,
      { headers },
    );

    return response.data.check.status;
  } catch (error) {
    debugError(error);
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
                date: formatDate(fromUnixTime(date), 'yyyy-MM-dd'),
                downtime,
              })),
          };
        }),
      );

      const problematicRegions = regions.filter(region => region.status !== 'up');
      const status =
        problematicRegions.length > 0
          ? problematicRegions[0].status
          : 'up';

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

export async function handler(event) {
  const { days } = event.queryStringParameters;
  const body = await getPingdomStats(parseInt(days, 10));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000',
    },
    body: JSON.stringify(body),
  };
}
