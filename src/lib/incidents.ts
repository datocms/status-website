import { getCollection } from 'astro:content';
import { addMinutes, startOfDay, startOfMonth, isEqual } from 'date-fns';
import i18n from './i18n';

export interface UpdateData {
  content: string;
  status: string;
  date: string;
}

export interface Update {
  content: string;
  status: string;
  statusLabel: string;
  contentWithStatus: string;
  date: Date;
}

export interface Incident {
  id: string;
  slug: string;
  name: string;
  impact: string;
  isMaintenance: boolean;
  isUnresolved: boolean;
  status: string;
  date: Date;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  affectedComponents: string[];
  components: string[];
  updates: Update[];
  firstUpdate: Update;
  lastUpdate: Update;
}

function makeUpdate(data: UpdateData | { content: string; status: string; date: Date }): Update {
  const date = data.date instanceof Date ? data.date : new Date(data.date);
  const status = data.status;
  const statusLabel = i18n[`status.${status}`] || status;

  return {
    content: data.content,
    status,
    statusLabel,
    contentWithStatus: `**${statusLabel}** — ${data.content}`,
    date,
  };
}

interface RawIncidentData {
  id: string;
  data: {
    name: string;
    impact?: string;
    components?: string[];
    updates?: UpdateData[];
    scheduledTime?: string;
    minutes?: string | number;
    content?: string;
  };
}

function makeIncident(entry: RawIncidentData): Incident {
  const { data } = entry;
  const slug = entry.id;

  const scheduledStart = data.scheduledTime ? new Date(data.scheduledTime) : null;
  const scheduledEnd =
    scheduledStart && data.minutes
      ? addMinutes(scheduledStart, Number(data.minutes))
      : null;
  const isMaintenance = !!scheduledStart;

  const updates: Update[] = (data.updates || [])
    .map((u) => makeUpdate(u))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .reverse();

  if (isMaintenance) {
    updates.push(
      makeUpdate({
        content: data.content || '',
        status: 'scheduled',
        date: scheduledStart!,
      }),
    );
  }

  const firstUpdate = updates[updates.length - 1];
  const lastUpdate = updates[0];
  const status = lastUpdate?.status || '';
  const date = isMaintenance ? scheduledStart! : firstUpdate?.date;

  const isUnresolved = isMaintenance
    ? status !== 'completed' && status !== 'scheduled'
    : status !== 'resolved';

  const impact = isMaintenance ? 'maintenance' : data.impact || 'none';
  const components = data.components || [];

  return {
    id: entry.id,
    slug,
    name: data.name,
    impact,
    isMaintenance,
    isUnresolved,
    status,
    date,
    scheduledStart,
    scheduledEnd,
    affectedComponents: components.map((id) => i18n[`component.${id}`] || id),
    components,
    updates,
    firstUpdate,
    lastUpdate,
  };
}

export async function getAll(): Promise<Incident[]> {
  const [incidentEntries, maintenanceEntries] = await Promise.all([
    getCollection('incidents'),
    getCollection('maintenances'),
  ]);

  const all = [
    ...incidentEntries.map((e) => makeIncident(e as unknown as RawIncidentData)),
    ...maintenanceEntries.map((e) => makeIncident(e as unknown as RawIncidentData)),
  ];

  return all.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getUnresolved(incidents: Incident[]): Incident[] {
  return incidents.filter((i) => i.isUnresolved);
}

export function getFutureMaintenances(incidents: Incident[]): Incident[] {
  return incidents.filter((i) => i.isMaintenance && i.status === 'scheduled');
}

export function getAllSince(incidents: Incident[], date: Date): Incident[] {
  return incidents.filter((i) => i.date > date);
}

export function ofMonth(incidents: Incident[], date: Date): Incident[] {
  return incidents.filter((i) =>
    isEqual(startOfMonth(i.date), startOfMonth(date)),
  );
}

export function ofDay(incidents: Incident[], date: Date): Incident[] {
  return incidents.filter((i) =>
    isEqual(startOfDay(i.date), startOfDay(date)),
  );
}

export function getPast(incidents: Incident[]): Incident[] {
  return incidents.filter((i) => i.date < new Date());
}

export function getFirst(incidents: Incident[]): Incident | undefined {
  return incidents[incidents.length - 1];
}
