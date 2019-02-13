const AWS = require('aws-sdk');
const getTime = require('date-fns/get_time');
const differenceInSeconds = require('date-fns/difference_in_seconds');
const d3Scale = require('d3-scale');
const d3Time = require('d3-time');

const subDays = require('date-fns/sub_days');
const subWeeks = require('date-fns/sub_weeks');
const subMonths = require('date-fns/sub_months');

const cloudWatch = new AWS.CloudWatch({
  region: 'us-east-1',
  accessKeyId: process.env.CLOUDWATCH_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDWATCH_AWS_SECRET_ACCESS_KEY
});

const timestamp = (date) => parseInt(getTime(date) / 1000);
const roundDecimals = (number, decimals) => Math.round(number * Math.pow(10, decimals) + Number.EPSILON) / Math.pow(10, decimals);

function getStartEndTime(timeSpan) {
  const settings = {
    day: {
      func: subDays,
      periodInMinutes: 10,
    },
    week: {
      func: subWeeks,
      periodInMinutes: 30,
    },
    month: {
      func: subMonths,
      periodInMinutes: 60,
    }
  };

  const { func, periodInMinutes } = settings[timeSpan];

  const end = new Date();
  const start = func(new Date(), 1);
  const scale = d3Scale.scaleTime().domain([start, end]);
  const ticks = scale.ticks(d3Time.timeMinute.every(periodInMinutes));

  return [ticks[0], ticks[ticks.length - 1], periodInMinutes * 60];
}

export async function cdaAverageResponseTime(start, end, period) {
  const data = await cloudWatch.getMetricData({
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
      }
    ],
    ScanBy: 'TimestampAscending',
  }).promise();

  const [ overTime, global ] = data.MetricDataResults;

  return {
    overTime: overTime.Timestamps.map((timestamp, i) => ({
      t: timestamp,
      v: Math.round(overTime.Values[i]),
    })),
    global: Math.round(global.Values[0])
  };
}

export async function apiSuccessRate(start, end, period) {
  const data = await cloudWatch.getMetricData({
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
      }
    ],
    ScanBy: 'TimestampAscending',
  }).promise();

  const [
    successOverTime,
    errorOverTime,
    successGlobal,
    errorGlobal
  ] = data.MetricDataResults;

  console.log(JSON.stringify(successOverTime));
  console.log(JSON.stringify(errorOverTime));

  return {
    overTime: successOverTime.Timestamps.map((timestamp, i) => { 
      const successCount = successOverTime.Values[i] || errorOverTime.Values[i] || 1;
      const errorCount = errorOverTime.Values[i] || 0;

      return {
        t: timestamp,
        v: roundDecimals(successCount / (successCount + errorCount) * 100, 3),
      };
    }),
    global: roundDecimals(successGlobal.Values[0] / (successGlobal.Values[0] + errorGlobal.Values[0]) * 100, 3)
  };
}

const graphFunc = {
  'cda.responseTime': cdaAverageResponseTime,
  'api.successRate': apiSuccessRate,
};

export async function handler(event, context) {
  const { graph, time } = event.queryStringParameters;

  const [start, end, period] = getStartEndTime(time);
  const data = await graphFunc[graph](start, end, period);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000'
    },
    body: JSON.stringify(data)
  };
}
