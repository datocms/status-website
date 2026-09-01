import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { IncidentFile, IncidentUpdate, MaintenanceFile } from '../../../src/lib/schema.ts';
import { INCIDENTS_DIR, MAINTENANCES_DIR } from './paths.ts';
import { utcDateStamp } from './dates.ts';

export type ItemKind = 'incident' | 'maintenance';

export interface OpenItem {
  kind: ItemKind;
  path: string;
  slug: string;
  name: string;
  /** Current status: last update by date, or `scheduled` for a fresh maintenance. */
  status: string;
  /** Last activity: last update date, or scheduled time when there are none. */
  date: Date;
  isOpen: boolean;
}

/** Lowercase, non-alphanumerics collapsed to single hyphens, emoji dropped. */
export const slugify = (title: string) =>
  title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const fileNameFor = (title: string, date: Date) =>
  `${utcDateStamp(date)}-${slugify(title)}.json`;

export const slugFromPath = (path: string) => basename(path, '.json');

export interface NewIncidentInput {
  name: string;
  impact: IncidentFile['impact'];
  components: string[];
  status: string;
  content: string;
  date: string;
}

export const buildIncident = (input: NewIncidentInput): IncidentFile => ({
  name: input.name,
  impact: input.impact,
  components: input.components,
  updates: [{ date: input.date, status: input.status, content: input.content }],
});

export interface NewMaintenanceInput {
  name: string;
  scheduledTime: string;
  minutes: number;
  components: string[];
  content: string;
}

export const buildMaintenance = (input: NewMaintenanceInput): MaintenanceFile => ({
  scheduledTime: input.scheduledTime,
  name: input.name,
  minutes: String(input.minutes),
  content: input.content,
  components: input.components,
  updates: [],
});

export const appendUpdate = <T extends { updates: IncidentUpdate[] }>(file: T, update: IncidentUpdate): T => ({
  ...file,
  updates: [...file.updates, { date: update.date, status: update.status, content: update.content }],
});

/** Two-space indent and a trailing newline, matching the existing files. */
export const serialize = (file: unknown) => `${JSON.stringify(file, null, 2)}\n`;

export const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;

export const writeJson = (path: string, file: unknown) => writeFileSync(path, serialize(file));

const latestUpdate = (updates: IncidentUpdate[]) =>
  [...updates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).at(-1);

const readDir = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f)) : [];

/** All items across both directories, newest first. */
export const listItems = (dirs = { incidents: INCIDENTS_DIR, maintenances: MAINTENANCES_DIR }): OpenItem[] => {
  const incidents = readDir(dirs.incidents).map((path): OpenItem => {
    const file = readJson<IncidentFile>(path);
    const last = latestUpdate(file.updates ?? []);
    const status = last?.status ?? 'investigating';
    return {
      kind: 'incident',
      path,
      slug: slugFromPath(path),
      name: file.name,
      status,
      date: new Date(last?.date ?? 0),
      isOpen: status !== 'resolved',
    };
  });

  const maintenances = readDir(dirs.maintenances).map((path): OpenItem => {
    const file = readJson<MaintenanceFile>(path);
    const last = latestUpdate(file.updates ?? []);
    const status = last?.status ?? 'scheduled';
    return {
      kind: 'maintenance',
      path,
      slug: slugFromPath(path),
      name: file.name,
      status,
      date: new Date(last?.date ?? file.scheduledTime),
      isOpen: status !== 'completed',
    };
  });

  return [...incidents, ...maintenances].sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const listOpenItems = (dirs?: Parameters<typeof listItems>[0]) =>
  listItems(dirs).filter((item) => item.isOpen);

/** Recent update texts, used as style examples in Claude prompts. */
export const recentUpdateExamples = (count: number, dirs?: Parameters<typeof listItems>[0]): string[] =>
  listItems(dirs)
    .filter((item) => item.kind === 'incident')
    .slice(0, count)
    .flatMap((item) => {
      const file = readJson<IncidentFile>(item.path);
      const first = file.updates[0];
      return first ? [first.content] : [];
    });
