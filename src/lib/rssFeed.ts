/*
 * DISABLED: the RSS path of the supplier feeds.
 *
 * WHY
 * No supplier uses it. Since 2026-09-02 every supplier has a JSON API, which
 * src/pages/api/feeds.ts reads. The endpoint loads the packages of each path
 * on every request, also of a path that never runs. The packages of this one
 * took /api/feeds down two times, on Netlify only, where a CommonJS package
 * cannot require() an ES module. So the code is off and its two packages,
 * rss-parser and htmlparser2, are not installed.
 *
 * The code below is complete and had 19 passing tests when it went off. It is
 * here for a supplier that publishes only an RSS or Atom feed.
 *
 * HOW TO TURN IT ON
 * 1. Install the packages:
 *      npm install --save-exact rss-parser@3.13.0 htmlparser2@12.0.0
 * 2. In this file, delete this note and the line `export {};`. Then remove
 *    the `// ` at the start of each line below: select the lines and use the
 *    "toggle line comment" command of the editor.
 * 3. In src/pages/api/feeds.ts, do the same to the 4 lines below each note
 *    "RSS path, disabled".
 * 4. In test/rssFeed.test.ts, remove `{ fails: true }` from the 2 `describe`
 *    blocks. Until you do, each test reports "Expect test to fail", because
 *    the code works again.
 * 5. Add the supplier to `services` in src/pages/api/feeds.ts, with the type
 *    'rss' and an `isOngoing` rule for its items.
 * 6. Run `npm run check` and `npm run test:unit`.
 * 7. Open a pull request, and request /api/feeds on its Netlify preview. Only
 *    Netlify shows a package that cannot load there.
 */
export {};

// /**
//  * Reads the status of a supplier that publishes only an RSS or Atom feed.
//  */
// import { differenceInDays, differenceInHours } from 'date-fns';
// import { Parser as HtmlParser } from 'htmlparser2';
// import RssParser from 'rss-parser';
// import {
//   MAX_ONGOING_PER_SERVICE,
//   MAX_RESOLVED_PER_SERVICE,
//   ONGOING_DAYS,
//   REQUEST_TIMEOUT,
//   RESOLVED_HOURS,
//   truncate,
//   type FeedItem,
// } from './supplierItems';
//
// export type RssItem = RssParser.Item;
//
// // A feed item carries no lifecycle field and no generic rule can invent one,
// // so each feed has to say how its own items report being over.
// export type RssService = {
//   type: 'rss';
//   name: string;
//   homepageUrl: string;
//   feedUrl: string;
//   isOngoing: (item: RssItem) => boolean;
// };
//
// /** Elements whose content a page does not show as text. */
// const HIDDEN_ELEMENTS = new Set(['script', 'style', 'textarea', 'option']);
//
// /** Elements inside a line of text. Every other element starts a new line. */
// const INLINE_ELEMENTS = new Set([
//   'a', 'abbr', 'b', 'code', 'em', 'i', 'mark', 'small', 'span', 'strong', 'sub', 'sup', 'u',
// ]);
//
// /**
//  * The text of an HTML fragment, without any tag. The parser decodes the
//  * entities, and the browser escapes the result again before it shows it.
//  *
//  * Only feeds carry markup. Running this over the JSON APIs, which return plain
//  * text, would delete anything shaped like a tag: an AWS region written as
//  * <eu-west-1>, or every character after a stray "<".
//  */
// export const toPlainText = (html: string): string => {
//   let text = '';
//   let hiddenDepth = 0;
//
//   // A block separates words: "<p>One</p><p>Two</p>" is "One Two". An inline
//   // element does not: "<b>Done</b>." is "Done.". The parser gives an entity
//   // as a text of its own, and that must not get a space.
//   const separate = (name: string) => {
//     if (!INLINE_ELEMENTS.has(name)) text += ' ';
//   };
//
//   const parser = new HtmlParser({
//     onopentagname: (name) => {
//       separate(name);
//       if (HIDDEN_ELEMENTS.has(name)) hiddenDepth += 1;
//     },
//     onclosetag: (name) => {
//       separate(name);
//       if (HIDDEN_ELEMENTS.has(name)) hiddenDepth = Math.max(0, hiddenDepth - 1);
//     },
//     ontext: (part) => {
//       if (hiddenDepth === 0) text += part;
//     },
//   });
//
//   parser.write(html);
//   parser.end();
//
//   return text.replace(/\s+/g, ' ').trim();
// };
//
// const rssParser = new RssParser();
//
// const itemDate = (item: RssItem) =>
//   new Date(item.isoDate || item.pubDate || '');
//
// const toRssFeedItem = (item: RssItem, service: RssService): FeedItem => ({
//   title: item.title || '',
//   // RSS pubDate is RFC-822, which parseISO() cannot read; isoDate is
//   // normalized by rss-parser for both RSS and Atom.
//   date: item.isoDate || item.pubDate || '',
//   url: item.link || '',
//   description: truncate(toPlainText(item.content || item.contentSnippet || '')),
//   status: service.isOngoing(item) ? 'Ongoing' : 'Resolved',
//   ongoing: service.isOngoing(item),
//   source: { name: service.name, homepageUrl: service.homepageUrl },
// });
//
// export const fetchRssItems = async (
//   service: RssService,
// ): Promise<FeedItem[]> => {
//   // The same request and the same time limit as the other suppliers.
//   const response = await fetch(service.feedUrl, {
//     signal: AbortSignal.timeout(REQUEST_TIMEOUT),
//   });
//
//   if (!response.ok) {
//     throw new Error(`${service.name} returned ${response.status}`);
//   }
//
//   const feed = await rssParser.parseString(await response.text());
//   const now = new Date();
//
//   // An item's own timestamp is the only date a feed offers, so it stands in
//   // for the resolution time too.
//   const items = feed.items.filter((item) => item.isoDate || item.pubDate);
//
//   const ongoing = items
//     .filter(
//       (item) =>
//         service.isOngoing(item) &&
//         differenceInDays(now, itemDate(item)) < ONGOING_DAYS,
//     )
//     .slice(0, MAX_ONGOING_PER_SERVICE);
//
//   const resolved = items
//     .filter(
//       (item) =>
//         !service.isOngoing(item) &&
//         differenceInHours(now, itemDate(item)) < RESOLVED_HOURS,
//     )
//     .slice(0, MAX_RESOLVED_PER_SERVICE);
//
//   return [...ongoing, ...resolved].map((item) => toRssFeedItem(item, service));
// };
