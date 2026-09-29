import {
  COMPONENTS,
  INCIDENT_STATUSES,
  LEGACY_COMPONENT_LABELS,
  LEGACY_STATUS_LABELS,
  MAINTENANCE_STATUSES,
} from './schema';

const labels = (prefix: string, options: readonly { id: string; label: string }[]) =>
  Object.fromEntries(options.map((o) => [`${prefix}.${o.id}`, o.label]));

const i18n: Record<string, string> = {
  ...labels('status', INCIDENT_STATUSES),
  ...labels('status', MAINTENANCE_STATUSES),
  ...labels('status', Object.entries(LEGACY_STATUS_LABELS).map(([id, label]) => ({ id, label }))),
  ...labels('component', COMPONENTS),
  ...labels('component', Object.entries(LEGACY_COMPONENT_LABELS).map(([id, label]) => ({ id, label }))),

  'status.operational': 'Operational',
  'status.up': 'Up',
  'status.down': 'Outage',
  'status.unconfirmed_down': 'Unconfirmed Down',
  'status.unknown': 'Unknown',
  'status.paused': 'Paused',
  'status.under-maintenance': 'Under maintenance',
  'status.degraded-performance': 'Degraded performance',
  'status.partial-outage': 'Partial outage',
  'status.major-outage': 'Major outage',


  'region.asia': 'Asia',
  'region.southAmerica': 'South America',
  'region.northAmerica': 'North America',
  'region.europe': 'Europe',
  'region.africa': 'Africa',
  'region.oceania': 'Oceania',
};

export default i18n;
