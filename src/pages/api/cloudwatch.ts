import type { APIRoute } from 'astro';
import {
  CloudWatchClient,
  GetMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import { differenceInSeconds, subDays, subWeeks, subMonths } from 'date-fns';
import * as d3Scale from 'd3-scale';
import * as d3Time from 'd3-time';
import {
  CLOUDWATCH_AWS_REGION,
  CLOUDWATCH_AWS_ACCESS_KEY_ID,
  CLOUDWATCH_AWS_SECRET_ACCESS_KEY,
} from 'astro:env/server';
import { missingVars, notConfigured, upstreamError } from '../../lib/apiErrors';

export const prerender = false;

let cloudWatch: CloudWatchClient;

const getClient = () =>
  (cloudWatch ??= new CloudWatchClient({
    region: CLOUDWATCH_AWS_REGION,
    credentials: {
      accessKeyId: CLOUDWATCH_AWS_ACCESS_KEY_ID!,
      secretAccessKey: CLOUDWATCH_AWS_SECRET_ACCESS_KEY!,
    },
  }));

const roundDecimals = (number: number, decimals: number) =>
  Math.round(number * 10 ** decimals + Number.EPSILON) / 10 ** decimals;

function getStartEndTime(timeSpan: string): [Date, Date, number] {
  const settings: Record<string, { func: (d: Date, n: number) => Date; periodInMinutes: number }> = {
    day: { func: subDays, periodInMinutes: 10 },
    week: { func: subWeeks, periodInMinutes: 60 },
    month: { func: subMonths, periodInMinutes: 120 },
  };

  const { func, periodInMinutes } = settings[timeSpan];
  const end = new Date();
  const start = func(new Date(), 1);
  const scale = d3Scale.scaleTime().domain([start, end]);
  const ticks = scale.ticks(d3Time.timeMinute.every(periodInMinutes)!);

  return [ticks[0], ticks[ticks.length - 1], periodInMinutes * 60];
}

function toHash(data: { Timestamps?: Date[]; Values?: number[] }) {
  return (data.Timestamps || []).reduce(
    (acc: Record<string, number>, timestamp: Date, i: number) => {
      acc[timestamp.toISOString()] = (data.Values || [])[i];
      return acc;
    },
    {},
  );
}

async function cdaAverageResponseTime(start: Date, end: Date, period: number) {
  const data = await getClient().send(
    new GetMetricDataCommand({
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'overTime',
          MetricStat: {
            Metric: { Dimensions: [], MetricName: 'response_time', Namespace: 'cda' },
            Period: period,
            Stat: 'Average',
          },
          ReturnData: true,
        },
        {
          Id: 'global',
          MetricStat: {
            Metric: { Dimensions: [], MetricName: 'response_time', Namespace: 'cda' },
            Period: differenceInSeconds(end, start),
            Stat: 'Average',
          },
          ReturnData: true,
        },
      ],
      ScanBy: 'TimestampAscending',
    }),
  );

  const [overTime, global] = data.MetricDataResults!;
  const overTimeHash = toHash(overTime);

  return {
    overTime: Object.entries(overTimeHash).map(([timestamp, value]) => ({
      t: timestamp,
      v: Math.round(value),
    })),
    global: Math.round(global.Values![0]),
  };
}

async function apiSuccessRate(start: Date, end: Date, period: number) {
  const data = await getClient().send(
    new GetMetricDataCommand({
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'success_overTime',
          MetricStat: {
            Metric: { Dimensions: [], MetricName: 'status_success', Namespace: 'rails' },
            Period: period,
            Stat: 'Sum',
          },
          ReturnData: true,
        },
        {
          Id: 'error_overTime',
          MetricStat: {
            Metric: { Dimensions: [], MetricName: 'status_error', Namespace: 'rails' },
            Period: period,
            Stat: 'Sum',
          },
          ReturnData: true,
        },
        {
          Id: 'success_global',
          MetricStat: {
            Metric: { Dimensions: [], MetricName: 'status_success', Namespace: 'rails' },
            Period: differenceInSeconds(end, start),
            Stat: 'Sum',
          },
          ReturnData: true,
        },
        {
          Id: 'error_global',
          MetricStat: {
            Metric: { Dimensions: [], MetricName: 'status_error', Namespace: 'rails' },
            Period: differenceInSeconds(end, start),
            Stat: 'Sum',
          },
          ReturnData: true,
        },
      ],
      ScanBy: 'TimestampAscending',
    }),
  );

  const [successOverTime, errorOverTime, successGlobal, errorGlobal] =
    data.MetricDataResults!;

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
      (successGlobal.Values![0] /
        ((successGlobal.Values![0] || 0) + (errorGlobal.Values![0] || 0))) *
        100,
      3,
    ),
  };
}

const graphFunc: Record<string, (start: Date, end: Date, period: number) => Promise<any>> = {
  'cda.responseTime': cdaAverageResponseTime,
  'api.successRate': apiSuccessRate,
};

export const GET: APIRoute = async ({ url }) => {
  const graph = url.searchParams.get('graph') || '';
  const time = url.searchParams.get('time') || 'day';

  const handler = graphFunc[graph];
  if (!handler) {
    return new Response(JSON.stringify({ error: 'Invalid graph parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const missing = missingVars({
    CLOUDWATCH_AWS_ACCESS_KEY_ID,
    CLOUDWATCH_AWS_SECRET_ACCESS_KEY,
  });
  if (missing.length > 0) {
    return notConfigured(missing);
  }

  const [start, end, period] = getStartEndTime(time);
  let data;
  try {
    data = await handler(start, end, period);
  } catch (err) {
    return upstreamError('AWS CloudWatch', err);
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000',
      'Cache-Control': 'public, s-maxage=1800',
    },
  });
};
