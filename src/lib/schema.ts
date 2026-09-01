/**
 * Single source of truth for the incident and maintenance data model.
 * Imported by the Astro content schema, i18n, and the maintainer TUI.
 */

export interface Option<Id extends string> {
  id: Id;
  label: string;
  description?: string;
}

export const COMPONENTS = [
  { id: 'cda', label: 'Content Delivery API' },
  { id: 'cma', label: 'Content Management API' },
  { id: 'assets', label: 'Assets CDN (Imgix)' },
  { id: 'administrativeAreas', label: 'Projects administrative interface' },
  { id: 'dashboard', label: 'Account dashboard interface' },
  { id: 'site', label: 'Website' },
  { id: 'billing', label: 'Billing' },
] as const satisfies readonly Option<string>[];

export type ComponentId = (typeof COMPONENTS)[number]['id'];

/** Ids used by old data files that no longer appear in the picker. */
export const LEGACY_COMPONENT_LABELS: Record<string, string> = {
  backend: 'Projects administrative interface',
  imgix: 'Assets CDN (Imgix)',
  dns: 'DNS',
};

export const IMPACTS = [
  { id: 'none', label: 'None', description: 'No user-facing impact' },
  { id: 'minor', label: 'Minor', description: 'Partial degradation, workaround available' },
  { id: 'major', label: 'Major', description: 'Significant service disruption' },
  { id: 'critical', label: 'Critical', description: 'Full outage' },
] as const satisfies readonly Option<string>[];

export type ImpactId = (typeof IMPACTS)[number]['id'];

export const INCIDENT_STATUSES = [
  { id: 'investigating', label: 'Investigating', description: 'Looking into the problem' },
  { id: 'identified', label: 'Identified', description: 'Root cause found, fix in progress' },
  { id: 'monitoring', label: 'Monitoring', description: 'Fix deployed, watching results' },
  { id: 'resolved', label: 'Resolved', description: 'Incident closed' },
] as const satisfies readonly Option<string>[];

export type IncidentStatusId = (typeof INCIDENT_STATUSES)[number]['id'];

export const MAINTENANCE_STATUSES = [
  { id: 'scheduled', label: 'Scheduled', description: 'Announced, not started' },
  { id: 'in_progress', label: 'In progress', description: 'Maintenance underway' },
  { id: 'verifying', label: 'Verifying', description: 'Work done, checking results' },
  { id: 'completed', label: 'Completed', description: 'Maintenance closed' },
] as const satisfies readonly Option<string>[];

export type MaintenanceStatusId = (typeof MAINTENANCE_STATUSES)[number]['id'];

/** Legacy spelling still present in old data files. */
export const LEGACY_STATUS_LABELS: Record<string, string> = {
  'in-progress': 'In progress',
};

const ids = <T extends readonly Option<string>[]>(options: T) =>
  options.map((o) => o.id) as [T[number]['id'], ...T[number]['id'][]];

export const COMPONENT_IDS = ids(COMPONENTS);
export const IMPACT_IDS = ids(IMPACTS);
export const INCIDENT_STATUS_IDS = ids(INCIDENT_STATUSES);
export const MAINTENANCE_STATUS_IDS = ids(MAINTENANCE_STATUSES);

export interface IncidentUpdate {
  date: string;
  status: string;
  content: string;
}

export interface IncidentFile {
  name: string;
  impact: ImpactId;
  components: string[];
  updates: IncidentUpdate[];
}

export interface MaintenanceFile {
  scheduledTime: string;
  name: string;
  minutes: string;
  content: string;
  components: string[];
  updates: IncidentUpdate[];
}
