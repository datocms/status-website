import type { APIRoute } from 'astro';
import { differenceInDays } from 'date-fns';
import sanitizeHtml from 'sanitize-html';
import Parser from 'rss-parser';

export const prerender = false;

const parser = new Parser();

const services = [
  {
    name: 'Cloudflare',
    homepageUrl: 'https://www.cloudflarestatus.com/',
    feedUrl: 'https://www.cloudflarestatus.com/history.atom',
  },
  {
    name: 'AWS EKS',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/eks-eu-west-1.rss',
  },
  {
    name: 'AWS RDS',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/rds-eu-west-1.rss',
  },
  {
    name: 'AWS ElastiCache',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/elasticache-eu-west-1.rss',
  },
  {
    name: 'AWS DynamoDB',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/dynamodb-eu-west-1.rss',
  },
  {
    name: 'AWS CloudFront',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/cloudfront.rss',
  },
  {
    name: 'AWS EC2',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/ec2-eu-west-1.rss',
  },
  {
    name: 'AWS Certificate Manager (1)',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/certificatemanager-eu-west-1.rss',
  },
  {
    name: 'AWS Certificate Manager (2)',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/certificatemanager-us-east-1.rss',
  },
  {
    name: 'Pusher',
    homepageUrl: 'https://status.pusher.com/',
    feedUrl: 'https://status.pusher.com/history.rss',
  },
  {
    name: 'Imgix',
    homepageUrl: 'https://status.imgix.com/',
    feedUrl: 'https://status.imgix.com/history.rss',
  },
  {
    name: 'Mux',
    homepageUrl: 'http://status.mux.com/',
    feedUrl: 'http://status.mux.com/history.rss',
  },
  {
    name: 'Postmark',
    homepageUrl: 'https://status.postmarkapp.com/',
    feedUrl: 'https://feeds.feedburner.com/postmarkstatus',
  },
];

export const GET: APIRoute = async () => {
  const feedsItems = await Promise.all(
    services.map((service) =>
      parser.parseURL(service.feedUrl).then((feed) => feed.items).catch(() => []),
    ),
  );

  const result = feedsItems
    .flatMap((feedItems, index) =>
      feedItems
        .filter(
          (item) =>
            item.pubDate &&
            differenceInDays(new Date(), new Date(item.pubDate)) < 15,
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
        .slice(0, 5)
        .map((item) => ({
          title: item.title || '',
          // RSS pubDate is RFC-822, which parseISO() cannot read; isoDate is
          // normalized by rss-parser for both RSS and Atom.
          date: item.isoDate || item.pubDate || '',
          url: item.link || '',
          description: `${sanitizeHtml(item.contentSnippet || item.content || '', {
            allowedTags: [],
            allowedAttributes: {},
            textFilter: (text: string) => `${text} `,
          }).substring(0, 250)}...`,
          source: {
            name: services[index].name,
            homepageUrl: services[index].homepageUrl,
          },
        })),
    )
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

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
