const FeedParser = require('feedparser');
const fetch = require('node-fetch');
var sanitizeHtml = require('sanitize-html');

function parse(url) {
  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser();
    const items = [];

    fetch(url).then(
      function(res) {
        if (res.status !== 200) {
          reject('Bad status code');
        } else {
          // The response `body` -- res.body -- is a stream
          res.body.pipe(feedparser);
        }
      },
      function(err) {
        reject(err);
      },
    );

    feedparser.on('error', function(error) {
      reject(error);
    });

    feedparser.on('readable', function() {
      var stream = this; // `this` is `feedparser`, which is a stream
      var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item;

      while ((item = stream.read())) {
        items.push(item);
      }
    });

    feedparser.on('end', function() {
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
    name: 'AWS Cloudfront',
    homepageUrl: 'https://status.aws.amazon.com/',
    feedUrl: 'https://status.aws.amazon.com/rss/cloudfront.rss',
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
  {
    name: "Let's Encrypt",
    homepageUrl: 'https://letsencrypt.status.io/',
    feedUrl: 'https://letsencrypt.status.io/pages/55957a99e800baa4470002da/rss',
  },
];

async function handler(event) {
  const feedsItems = await Promise.all(
    services.map(service => parse(service.feedUrl)),
  );

  const result = feedsItems
    .reduce((acc, feedItems, index) => {
      return [
        ...acc,
        feedItems
          .filter(item => {
            const text =
              item.description.toLowerCase() + item.title.toLowerCase();
            return !text.includes('resolved') && !text.includes('completed');
          })
          .slice(0, 5)
          .map(item => ({
            title: item.title,
            date: item.pubDate,
            url: item.link || item.permalink,
            description:
              sanitizeHtml(item.description, {
                allowedTags: [],
                allowedAttributes: {},
                textFilter: text => text + ' ',
              }).substring(0, 250) + '...',
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
    },
    body: JSON.stringify(result),
  };
}

exports.handler = handler;
