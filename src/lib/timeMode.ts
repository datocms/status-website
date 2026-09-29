/**
 * The choice of the visitor: every time in UTC, or in the local zone where
 * that is possible. Browser only. The default is UTC, which is also what the
 * server writes, so a page without a script is a page in UTC mode.
 */
import {
  localText,
  parseDatetimeAttribute,
  utcText,
  type TimeFormat,
} from './time';

export type TimeMode = 'utc' | 'local';

export const TIME_MODE_EVENT = 'timemodechange';

// localStorage stays when the browser closes. It belongs to one browser on
// one machine, and to one host: status and status2 each keep their own.
const STORAGE_KEY = 'status:time-mode';

export const getTimeMode = (): TimeMode => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'local' ? 'local' : 'utc';
  } catch {
    // A browser can refuse storage, for example in a private window.
    return 'utc';
  }
};

let mode: TimeMode = getTimeMode();

export const currentTimeMode = () => mode;

export const setTimeMode = (next: TimeMode) => {
  mode = next;

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The choice then holds for this page only.
  }

  document.dispatchEvent(new CustomEvent(TIME_MODE_EVENT, { detail: next }));
};

/**
 * The text of a date in the current mode. A date that has no local form
 * stays in UTC, and says so in local mode.
 */
export const modeText = (format: TimeFormat, date: Date): string => {
  if (mode === 'utc') return utcText(format, date);

  return localText(format, date) ?? `${utcText(format, date)} (UTC)`;
};

/** Writes the text of one <time data-format> element for the current mode. */
export const renderTime = (element: HTMLElement) => {
  const date = parseDatetimeAttribute(element.getAttribute('datetime') ?? '');
  if (Number.isNaN(date.getTime())) return;

  const text = modeText(element.dataset.format as TimeFormat, date);
  if (element.textContent !== text) element.textContent = text;
};
