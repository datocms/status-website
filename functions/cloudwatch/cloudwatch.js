const {
  CloudWatch
} = require("@aws-sdk/client-cloudwatch");

const getTime = require('date-fns/getTime');
const differenceInSeconds = require('date-fns/differenceInSeconds');
const subDays = require('date-fns/subDays');
const subWeeks = require('date-fns/subWeeks');
const subMonths = require('date-fns/subMonths');

const d3Scale = require('d3-scale');
const d3Time = require('d3-time');

const cloudWatch = new CloudWatch({
  credentials: {
    accessKeyId: process.env.CLOUDWATCH_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDWATCH_AWS_SECRET_ACCESS_KEY
  },

  region: process.env.CLOUDWATCH_AWS_REGION || 'us-east-1'
});

const timestamp = date => parseInt(getTime(date) / 1000);
const roundDecimals = (number, decimals) =>
  Math.round(number * 10 ** decimals + Number.EPSILON) / 10 ** decimals;

function getStartEndTime(timeSpan) {
  const settings = {
    day: {
      func: subDays,
      periodInMinutes: 10,
    },
    week: {
      func: subWeeks,
      periodInMinutes: 60,
    },
    month: {
      func: subMonths,
      periodInMinutes: 120,
    },
  };

  const { func, periodInMinutes } = settings[timeSpan];

  const end = new Date();
  const start = func(new Date(), 1);
  const scale = d3Scale.scaleTime().domain([start, end]);
  const ticks = scale.ticks(d3Time.timeMinute.every(periodInMinutes));

  return [ticks[0], ticks[ticks.length - 1], periodInMinutes * 60];
}

function toHash(data) {
  return data.Timestamps.reduce((acc, timestamp, i) => {
    acc[timestamp] = data.Values[i];
    return acc;
  }, {});
}

async function cdaAverageResponseTime(start, end, period) {
  const data = await cloudWatch
    .getMetricData({
      StartTime: timestamp(start),
      EndTime: timestamp(end),
      MetricDataQueries: [
        {
          Id: 'overTime',
          MetricStat: {
            Metric: {
              Dimensions: [],
              MetricName: 'response_time',
              Namespace: 'cda',
            },
            Period: period,
            Stat: 'Average',
          },
          ReturnData: true,
        },
        {
          Id: 'global',
          MetricStat: {
            Metric: {
              Dimensions: [],
              MetricName: 'response_time',
              Namespace: 'cda',
            },
            Period: differenceInSeconds(end, start),
            Stat: 'Average',
          },
          ReturnData: true,
        },
      ],
      ScanBy: 'TimestampAscending',
    });

  const [overTime, global] = data.MetricDataResults;
  const overTimeHash = toHash(overTime);

  return {
    overTime: Object.entries(overTimeHash).map(([timestamp, value]) => ({
      t: timestamp,
      v: Math.round(value),
    })),
    global: Math.round(global.Values[0]),
  };
}

async function apiSuccessRate(start, end, period) {
  const data = await cloudWatch
    .getMetricData({
      StartTime: timestamp(start),
      EndTime: timestamp(end),
      MetricDataQueries: [
        {
          Id: 'success_overTime',
          MetricStat: {
            Metric: {
              Dimensions: [],
              MetricName: 'status_success',
              Namespace: 'rails',
            },
            Period: period,
            Stat: 'Sum',
          },
          ReturnData: true,
        },
        {
          Id: 'error_overTime',
          MetricStat: {
            Metric: {
              Dimensions: [],
              MetricName: 'status_error',
              Namespace: 'rails',
            },
            Period: period,
            Stat: 'Sum',
          },
          ReturnData: true,
        },
        {
          Id: 'success_global',
          MetricStat: {
            Metric: {
              Dimensions: [],
              MetricName: 'status_success',
              Namespace: 'rails',
            },
            Period: differenceInSeconds(end, start),
            Stat: 'Sum',
          },
          ReturnData: true,
        },
        {
          Id: 'error_global',
          MetricStat: {
            Metric: {
              Dimensions: [],
              MetricName: 'status_error',
              Namespace: 'rails',
            },
            Period: differenceInSeconds(end, start),
            Stat: 'Sum',
          },
          ReturnData: true,
        },
      ],
      ScanBy: 'TimestampAscending',
    });

  const [
    successOverTime,
    errorOverTime,
    successGlobal,
    errorGlobal,
  ] = data.MetricDataResults;

  const successOverTimeHash = toHash(successOverTime);
  const errorOverTimeHash = toHash(errorOverTime);

  return {
    overTime: Object.entries(successOverTimeHash).map(
      ([timestamp, successCount]) => {
        const errorCount = errorOverTimeHash[timestamp] || 0;

        return {
          t: timestamp,
          v: roundDecimals(
            (successCount / (successCount + errorCount)) * 100,
            3,
          ),
        };
      },
    ),
    global: roundDecimals(
      (successGlobal.Values[0] /
        ((successGlobal.Values[0] || 0) + (errorGlobal.Values[0] || 0))) *
        100,
      3,
    ),
  };
}

const graphFunc = {
  'cda.responseTime': cdaAverageResponseTime,
  'api.successRate': apiSuccessRate,
};

async function handler(event) {
  const { graph, time } = event.queryStringParameters;

  const [start, end, period] = getStartEndTime(time);
  const data = await graphFunc[graph](start, end, period);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000',
      'Cache-Control': 'public, s-maxage=1800',
    },
    body: JSON.stringify(data),
  };
}

exports.handler = handler;
