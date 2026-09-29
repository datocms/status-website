/**
 * Post-publish verification: poll `history.json` on each host and compare the
 * published item against what we wrote, after rendering differences.
 */

import { marked } from 'marked';

export interface Expected {
  slug: string;
  name: string;
  /** Raw markdown content of every update that must appear. */
  updates: string[];
}

export type CheckResult =
  /** No usable answer: the host did not reply, or the item is not in the feed. */
  | { status: 'pending'; reason: string }
  | { status: 'verified' }
  /**
   * The host serves the item, but not with this text. During a deploy this is
   * the previous version of the page, so it only counts as a failure when it
   * is still the answer at the end of the wait.
   */
  | { status: 'mismatch'; field: 'title' | 'content'; expected: string; found: string };

interface FeedItem {
  id: string;
  title: string;
  content_html: string;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });

export const normalizeWs = (text: string) => text.replace(/\s+/g, ' ').trim();

/** HTML to comparable plain text. */
export const htmlToText = (html: string) => normalizeWs(decodeEntities(html.replace(/<[^>]+>/g, ' ')));

/**
 * The text of HTML without any white space. Two renderings of the same text
 * can differ in white space: "<b>bold</b>," is "bold," on the page, with or
 * without a space before the comma in the HTML.
 */
const squeeze = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, '');

/** The blocks of rendered HTML: paragraphs, list items, headings, cells. */
const blocks = (html: string) =>
  html
    .split(/<\/(?:p|li|h[1-6]|pre|blockquote|td|th|tr)>|<hr\s*\/?>|<br\s*\/?>/i)
    .map((block) => ({ readable: htmlToText(block), squeezed: squeeze(block) }))
    .filter((block) => block.squeezed.length > 0);

/** Compares one host's feed body against what was published. */
export const checkFeed = (feedBody: string, expected: Expected): CheckResult => {
  let items: FeedItem[];
  try {
    items = (JSON.parse(feedBody) as { items: FeedItem[] }).items;
  } catch {
    return { status: 'pending', reason: 'feed is not valid JSON yet' };
  }

  const item = items.find((i) => i.id === expected.slug);
  if (!item) {
    return { status: 'pending', reason: 'item not in feed yet' };
  }
  if (item.title !== expected.name) {
    return { status: 'mismatch', field: 'title', expected: expected.name, found: item.title };
  }

  const page = squeeze(item.content_html);

  for (const update of expected.updates) {
    // The site renders an update with this renderer, so use it here too: a
    // rule for each kind of Markdown would always miss one.
    const html = marked.parse(update, { async: false }) as string;
    if (page.includes(squeeze(html))) continue;

    const missing = blocks(html).find((block) => !page.includes(block.squeezed));
    const text = missing?.readable ?? htmlToText(html);

    return { status: 'mismatch', field: 'content', expected: text, found: nearest(htmlToText(item.content_html), text) };
  }

  return { status: 'verified' };
};

/** Best-effort excerpt of the rendered text near where a line should be. */
const nearest = (rendered: string, line: string) => {
  const head = line.slice(0, 12);
  const index = rendered.indexOf(head);
  const start = index >= 0 ? index : Math.max(0, rendered.length - line.length - 20);
  return rendered.slice(start, start + line.length + 20);
};

export interface HostState {
  name: string;
  origin: string;
  result: CheckResult;
  attempts: number;
}

export interface PollOptions {
  hosts: readonly { name: string; origin: string }[];
  expected: Expected;
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  onUpdate?: (states: HostState[]) => void;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });

/**
 * Polls every host until each is verified, the timeout passes, or the signal
 * aborts. A mismatch does not stop the wait: until the deploy ends, the host
 * serves the previous version. Resolves with the last state of every host.
 */
export const pollHosts = async ({
  hosts,
  expected,
  intervalMs = 5000,
  timeoutMs = 5 * 60_000,
  signal,
  fetchImpl = fetch,
  onUpdate,
}: PollOptions): Promise<HostState[]> => {
  const states: HostState[] = hosts.map((h) => ({
    ...h,
    result: { status: 'pending', reason: 'not checked yet' },
    attempts: 0,
  }));
  const deadline = Date.now() + timeoutMs;
  const isDone = (s: HostState) => s.result.status === 'verified';

  while (!signal?.aborted) {
    await Promise.all(
      states.filter((s) => !isDone(s)).map(async (state) => {
        state.attempts += 1;
        try {
          const res = await fetchImpl(`${state.origin}/history.json?t=${Date.now()}`, {
            signal,
            headers: { 'cache-control': 'no-cache' },
          });
          state.result = res.ok
            ? checkFeed(await res.text(), expected)
            : { status: 'pending', reason: `HTTP ${res.status}` };
        } catch (err) {
          state.result = { status: 'pending', reason: (err as Error).message };
        }
      }),
    );
    onUpdate?.(states.map((s) => ({ ...s })));
    if (states.every(isDone) || Date.now() >= deadline) {
      break;
    }
    await sleep(intervalMs, signal);
  }
  return states;
};
