import type { APIRoute } from 'astro';
import { differenceInDays, differenceInHours } from 'date-fns';
import sanitizeHtml from 'sanitize-html';

export const prerender = false;

const ONGOING_DAYS = 7;
const RESOLVED_HOURS = 48;
const MAX_ONGOING_PER_SERVICE = 5;
const MAX_RESOLVED_PER_SERVICE = 2;
const DESCRIPTION_LENGTH = 250;
// Netlify caps synchronous functions around 10s and every supplier is fetched
// in parallel, so a hung one must give up well before that.
const REQUEST_TIMEOUT = 5000;

const AWS_EVENTS_URL = 'https://health.aws.amazon.com/public/events';
const AWS_REGIONS = ['eu-west-1', 'us-east-1', 'global'];
const AWS_SERVICE_LABELS: Record<string, string> = {
  EKS: 'EKS',
  RDS: 'RDS',
  ELASTICACHE: 'ElastiCache',
  DYNAMODB: 'DynamoDB',
  CLOUDFRONT: 'CloudFront',
  EC2: 'EC2',
  CERTIFICATEMANAGER: 'Certificate Manager',
  MULTIPLE_SERVICES: 'Multiple services',
};

type StatuspageService = {
  type: 'statuspage';
  name: string;
  homepageUrl: string;
};

type AwsService = {
  type: 'aws';
  name: string;
  homepageUrl: string;
};

type SorryappService = {
  type: 'sorryapp';
  name: string;
  homepageUrl: string;
};

type Service = StatuspageService | AwsService | SorryappService;

interface StatuspageIncident {
  name: string;
  status: string;
  shortlink: string;
  updated_at: string;
  resolved_at: string | null;
  incident_updates: { body: string; status: string }[];
}

interface AwsEvent {
  service: string;
  region: string;
  startTime: string;
  endTime?: string;
  lastUpdatedTime: string;
  metadata: { EVENT_LOG?: string };
}

interface AwsEventLog {
  summary: string;
  message: string;
}

interface SorryappNotice {
  subject: string;
  type: string;
  state: string;
  url: string;
  ended_at: string | null;
  updated_at: string;
  latest_update: { state: string; content: string } | null;
}

interface FeedItem {
  title: string;
  date: string;
  url: string;
  description: string;
  ongoing: boolean;
  source: { name: string; homepageUrl: string };
}

const services: Service[] = [
  {
    type: 'statuspage',
    name: 'Cloudflare',
    homepageUrl: 'https://www.cloudflarestatus.com/',
  },
  {
    type: 'aws',
    name: 'AWS',
    homepageUrl: 'https://health.aws.amazon.com/health/status',
  },
  {
    type: 'statuspage',
    name: 'Pusher',
    homepageUrl: 'https://status.pusher.com/',
  },
  {
    type: 'statuspage',
    name: 'Imgix',
    homepageUrl: 'https://status.imgix.com/',
  },
  {
    type: 'statuspage',
    name: 'Mux',
    homepageUrl: 'https://status.mux.com/',
  },
  {
    type: 'sorryapp',
    name: 'Postmark',
    homepageUrl: 'https://status.postmarkapp.com/',
  },
];

const stripHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text: string) => `${text} `,
  }).trim();

const truncate = (text: string) =>
  text.length > DESCRIPTION_LENGTH
    ? `${text.substring(0, DESCRIPTION_LENGTH)}...`
    : text;

const isResolved = (incident: StatuspageIncident) =>
  incident.status === 'resolved' || incident.status === 'postmortem';

const statusLabel = (status: string) => {
  const words = status.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// Updates are newest first. A resolved incident's newest update is always the
// boilerplate "This incident has been resolved", so the oldest one — which
// describes what actually happened — is the useful summary.
const summaryUpdate = (incident: StatuspageIncident) =>
  isResolved(incident)
    ? incident.incident_updates[incident.incident_updates.length - 1]
    : incident.incident_updates[0];

const toFeedItem = (
  incident: StatuspageIncident,
  service: StatuspageService,
): FeedItem => ({
  title: incident.name,
  date: incident.updated_at,
  url: incident.shortlink,
  description: `${statusLabel(incident.status)} — ${truncate(
    stripHtml(summaryUpdate(incident)?.body || ''),
  )}`,
  ongoing: !isResolved(incident),
  source: { name: service.name, homepageUrl: service.homepageUrl },
});

// Statuspage returns incidents newest first, so slicing keeps the most recent.
const fetchStatuspageItems = async (
  service: StatuspageService,
): Promise<FeedItem[]> => {
  const url = new URL('api/v2/incidents.json', service.homepageUrl);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`${service.name} returned ${response.status}`);
  }

  const { incidents } = (await response.json()) as {
    incidents: StatuspageIncident[];
  };
  const now = new Date();

  // Suppliers leave incidents open for months, so stale ones are dropped too.
  const ongoing = incidents
    .filter(
      (incident) =>
        !isResolved(incident) &&
        differenceInDays(now, new Date(incident.updated_at)) < ONGOING_DAYS,
    )
    .slice(0, MAX_ONGOING_PER_SERVICE);

  const resolved = incidents
    .filter(
      (incident) =>
        isResolved(incident) &&
        incident.resolved_at &&
        differenceInHours(now, new Date(incident.resolved_at)) < RESOLVED_HOURS,
    )
    .slice(0, MAX_RESOLVED_PER_SERVICE);

  return [...ongoing, ...resolved].map((incident) =>
    toFeedItem(incident, service),
  );
};

const msToDate = (value: string) => new Date(Number(value));

// The closing update repeats the summary tagged "[RESOLVED]", which the status
// label already says.
const eventSummary = (summary: string) => summary.replace(/^\[[^\]]+\]\s*/, '');

const toAwsFeedItem = (event: AwsEvent, service: AwsService): FeedItem => {
  // AWS orders updates oldest first, and unlike Statuspage its closing message
  // is a full write-up rather than boilerplate, so the newest one always wins.
  const log = JSON.parse(event.metadata?.EVENT_LOG || '[]') as AwsEventLog[];
  const latest = log[log.length - 1];

  return {
    title: `${AWS_SERVICE_LABELS[event.service]} (${event.region}) — ${eventSummary(latest?.summary || '')}`,
    date: msToDate(event.lastUpdatedTime).toISOString(),
    url: service.homepageUrl,
    description: `${event.endTime ? 'Resolved' : 'Ongoing'} — ${truncate(
      stripHtml(latest?.message || ''),
    )}`,
    ongoing: !event.endTime,
    source: { name: service.name, homepageUrl: service.homepageUrl },
  };
};

const fetchAwsItems = async (service: AwsService): Promise<FeedItem[]> => {
  const response = await fetch(AWS_EVENTS_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`${service.name} returned ${response.status}`);
  }

  // The dashboard serves UTF-16BE, which response.json() cannot decode.
  const body = new TextDecoder('utf-16be').decode(await response.arrayBuffer());

  const events = (JSON.parse(body) as AwsEvent[])
    .filter(
      (event) =>
        AWS_REGIONS.includes(event.region) &&
        event.service in AWS_SERVICE_LABELS,
    )
    .sort((a, b) => Number(b.lastUpdatedTime) - Number(a.lastUpdatedTime));

  const now = new Date();

  const ongoing = events
    .filter(
      (event) =>
        !event.endTime &&
        differenceInDays(now, msToDate(event.lastUpdatedTime)) < ONGOING_DAYS,
    )
    .slice(0, MAX_ONGOING_PER_SERVICE);

  const resolved = events
    .filter(
      (event) =>
        event.endTime &&
        differenceInHours(now, msToDate(event.endTime)) < RESOLVED_HOURS,
    )
    .slice(0, MAX_RESOLVED_PER_SERVICE);

  return [...ongoing, ...resolved].map((event) => toAwsFeedItem(event, service));
};

// Like AWS, SorryApp's closing update is a real write-up rather than
// boilerplate, so the newest one is always the useful summary.
const toSorryappFeedItem = (
  notice: SorryappNotice,
  service: SorryappService,
): FeedItem => ({
  title: notice.subject,
  date: notice.updated_at,
  url: notice.url,
  description: `${statusLabel(notice.state)} — ${truncate(
    stripHtml(notice.latest_update?.content || ''),
  )}`,
  ongoing: !notice.ended_at,
  source: { name: service.name, homepageUrl: service.homepageUrl },
});

const fetchSorryappItems = async (
  service: SorryappService,
): Promise<FeedItem[]> => {
  const url = new URL('api/v1/notices', service.homepageUrl);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`${service.name} returned ${response.status}`);
  }

  const { notices } = (await response.json()) as { notices: SorryappNotice[] };
  const now = new Date();

  // 'planned' notices are scheduled maintenance, which this page leaves out.
  const incidents = notices
    .filter((notice) => notice.type === 'unplanned')
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

  const ongoing = incidents
    .filter(
      (notice) =>
        !notice.ended_at &&
        differenceInDays(now, new Date(notice.updated_at)) < ONGOING_DAYS,
    )
    .slice(0, MAX_ONGOING_PER_SERVICE);

  const resolved = incidents
    .filter(
      (notice) =>
        notice.ended_at &&
        differenceInHours(now, new Date(notice.ended_at)) < RESOLVED_HOURS,
    )
    .slice(0, MAX_RESOLVED_PER_SERVICE);

  return [...ongoing, ...resolved].map((notice) =>
    toSorryappFeedItem(notice, service),
  );
};

const fetchServiceItems = (service: Service): Promise<FeedItem[]> => {
  switch (service.type) {
    case 'statuspage':
      return fetchStatuspageItems(service);
    case 'aws':
      return fetchAwsItems(service);
    case 'sorryapp':
      return fetchSorryappItems(service);
  }
};

export const GET: APIRoute = async () => {
  const itemsPerService = await Promise.all(
    services.map((service) =>
      fetchServiceItems(service).catch((error) => {
        // A supplier that quietly drops out stays dropped: the AWS feeds died
        // unnoticed, and Postmark's went stale for nearly four years.
        console.error(`[api/feeds] ${service.name} failed:`, error);
        return [] as FeedItem[];
      }),
    ),
  );

  const result = itemsPerService.flat().sort((a, b) => {
    if (a.ongoing !== b.ongoing) {
      return a.ongoing ? -1 : 1;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000',
      'Cache-Control': 'public, s-maxage=300',
    },
  });
};
