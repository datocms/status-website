const FeedParser = require('feedparser');
const fetch = require('node-fetch');
const sanitizeHtml = require('sanitize-html');
const { differenceInDays } = require('date-fns');

function parse(url) {
  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser();
    const items = [];

    fetch(url).then(
      res => {
        if (res.status !== 200) {
          reject('Bad status code');
        } else {
          // The response `body` -- res.body -- is a stream
          res.body.pipe(feedparser);
        }
      },
      err => {
        reject(err);
      },
    );

    feedparser.on('error', error => {
      reject(error);
    });

    feedparser.on('readable', function() {
      // `this` is `feedparser`, which is a stream
      let item;

      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      while ((item = this.read())) {
        items.push(item);
      }
    });

    feedparser.on('end', () => {
      resolve(items);
    });
  });
}

const services = [
  {
    name: 'Heroku',
    homepageUrl: 'https://status.heroku.com/',
    feedUrl: 'http://feeds.feedburner.com/herokustatus',
  },
  {
    name: 'Cloudflare',
    homepageUrl: 'https://www.cloudflarestatus.com/',
    feedUrl: ' https://www.cloudflarestatus.com/history.atom',
  },
  {
    name: 'Fastly',
    homepageUrl: 'https://status.fastly.com/',
    feedUrl: 'https://status.fastly.com/history.rss',
  },
  {
    name: 'Redislabs',
    homepageUrl: 'https://status.redislabs.com',
    feedUrl: 'https://status.redislabs.com/history.rss',
  },
  {
    name: 'DigitalOcean',
    homepageUrl: 'https://status.digitalocean.com/',
    feedUrl: 'https://status.digitalocean.com/history.rss',
  },
  {
    name: 'AWS S3',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/s3-eu-west-1.rss',
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

async function handler(event) {
  const feedsItems = await Promise.all(
    services.map(service => parse(service.feedUrl).catch(() => [])),
  );

  const result = feedsItems
    .reduce((acc, feedItems, index) => {
      return [
        ...acc,
        feedItems
          .filter(
            item => differenceInDays(new Date(), new Date(item.pubDate)) < 15,
          )
          .filter(item => {
            const text =
              item.description.toLowerCase() + item.title.toLowerCase();

            return (
              !text.includes('resolved') &&
              !text.includes('completed') &&
              !text.includes('this is a scheduled event')
            );
          })
          .slice(0, 5)
          .map(item => ({
            title: item.title,
            date: item.pubDate,
            url: item.link || item.permalink,
            description: `${sanitizeHtml(item.description, {
              allowedTags: [],
              allowedAttributes: {},
              textFilter: text => `${text} `,
            }).substring(0, 250)}...`,
            source: {
              name: services[index].name,
              homepageUrl: services[index].homepageUrl,
            },
          })),
      ];
    }, [])
    .flat()
    .sort((a, b) => b.date - a.date);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1728000',
      'Cache-Control': 'public, s-maxage=1800',
    },
    body: JSON.stringify(result),
  };
}

exports.handler = handler;
