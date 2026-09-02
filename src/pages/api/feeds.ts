import type { APIRoute } from 'astro';
import { differenceInDays, differenceInHours } from 'date-fns';
import sanitizeHtml from 'sanitize-html';
import Parser from 'rss-parser';

export const prerender = false;

const parser = new Parser();

const ONGOING_DAYS = 7;
const RESOLVED_HOURS = 48;
const MAX_ONGOING_PER_SERVICE = 5;
const MAX_RESOLVED_PER_SERVICE = 2;
const DESCRIPTION_LENGTH = 250;

type StatuspageService = {
  type: 'statuspage';
  name: string;
  homepageUrl: string;
};

type RssService = {
  type: 'rss';
  name: string;
  homepageUrl: string;
  feedUrl: string;
};

type Service = StatuspageService | RssService;

interface StatuspageIncident {
  name: string;
  status: string;
  shortlink: string;
  updated_at: string;
  resolved_at: string | null;
  incident_updates: { body: string; status: string }[];
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
    type: 'rss',
    name: 'AWS EKS',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/eks-eu-west-1.rss',
  },
  {
    type: 'rss',
    name: 'AWS RDS',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/rds-eu-west-1.rss',
  },
  {
    type: 'rss',
    name: 'AWS ElastiCache',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/elasticache-eu-west-1.rss',
  },
  {
    type: 'rss',
    name: 'AWS DynamoDB',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/dynamodb-eu-west-1.rss',
  },
  {
    type: 'rss',
    name: 'AWS CloudFront',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/cloudfront.rss',
  },
  {
    type: 'rss',
    name: 'AWS EC2',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/ec2-eu-west-1.rss',
  },
  {
    type: 'rss',
    name: 'AWS Certificate Manager (1)',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/certificatemanager-eu-west-1.rss',
  },
  {
    type: 'rss',
    name: 'AWS Certificate Manager (2)',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/certificatemanager-us-east-1.rss',
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
    type: 'rss',
    name: 'Postmark',
    homepageUrl: 'https://status.postmarkapp.com/',
    feedUrl: 'https://feeds.feedburner.com/postmarkstatus',
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
  const response = await fetch(url);

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

const fetchRssItems = async (service: RssService): Promise<FeedItem[]> => {
  const feed = await parser.parseURL(service.feedUrl);

  return feed.items
    .filter(
      (item) =>
        item.pubDate &&
        differenceInDays(new Date(), new Date(item.pubDate)) < ONGOING_DAYS,
    )
    .filter((item) => {
      const text =
        ((item.contentSnippet || item.content || '') + (item.title || '')).toLowerCase();
      return (
        !text.includes('resolved') &&
        !text.includes('completed') &&
        !text.includes('this is a scheduled event')
      );
    })
    .slice(0, MAX_ONGOING_PER_SERVICE)
    .map((item) => ({
      title: item.title || '',
      // RSS pubDate is RFC-822, which parseISO() cannot read; isoDate is
      // normalized by rss-parser for both RSS and Atom.
      date: item.isoDate || item.pubDate || '',
      url: item.link || '',
      description: `${stripHtml(item.contentSnippet || item.content || '').substring(0, DESCRIPTION_LENGTH)}...`,
      ongoing: true,
      source: { name: service.name, homepageUrl: service.homepageUrl },
    }));
};

export const GET: APIRoute = async () => {
  const itemsPerService = await Promise.all(
    services.map((service) =>
      (service.type === 'statuspage'
        ? fetchStatuspageItems(service)
        : fetchRssItems(service)
      ).catch(() => [] as FeedItem[]),
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
      'Cache-Control': 'public, s-maxage=1800',
    },
  });
};
