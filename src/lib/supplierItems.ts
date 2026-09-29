/** What every reader of a supplier's status has in common. */

export interface FeedItem {
  title: string;
  date: string;
  url: string;
  description: string;
  // Kept apart from the description so the page can drop it where a heading
  // already says the same thing.
  status: string;
  ongoing: boolean;
  source: { name: string; homepageUrl: string };
}

export const ONGOING_DAYS = 7;
export const RESOLVED_HOURS = 48;
export const MAX_ONGOING_PER_SERVICE = 5;
export const MAX_RESOLVED_PER_SERVICE = 2;
export const DESCRIPTION_LENGTH = 250;
// Netlify caps synchronous functions around 10s and every supplier is fetched
// in parallel, so a hung one must give up well before that.
export const REQUEST_TIMEOUT = 5000;

export const truncate = (text: string) =>
  text.length > DESCRIPTION_LENGTH
    ? `${text.substring(0, DESCRIPTION_LENGTH)}...`
    : text;
