import { join } from 'node:path';
import {
  COMPONENTS,
  IMPACTS,
  INCIDENT_STATUSES,
  MAINTENANCE_STATUSES,
  type IncidentFile,
  type MaintenanceFile,
  type Option,
} from '../../../src/lib/schema.ts';
import { appendUpdate, buildIncident, buildMaintenance, fileNameFor, slugify, type ItemKind, type OpenItem } from './files.ts';
import { nextFullHour, parseUtcInput, utcDateStamp } from './dates.ts';
import { INCIDENTS_DIR, MAINTENANCES_DIR } from './paths.ts';
import type { Flow } from './git.ts';

export type FieldType = 'text' | 'select' | 'multiselect' | 'multiline' | 'date' | 'number';

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  options?: readonly Option<string>[];
  /** Shown next to the value when it is empty. */
  placeholder?: string;
  /** Read-only field, shown for context. */
  locked?: boolean;
}

export type Values = Record<string, string | string[]>;

export interface FlowContext {
  flow: Flow;
  item?: OpenItem;
  /** Parsed content of `item.path`, for update and resolve. */
  existing?: IncidentFile | MaintenanceFile;
  now: Date;
}

const statusOptions = (kind: ItemKind) => (kind === 'incident' ? INCIDENT_STATUSES : MAINTENANCE_STATUSES);

export const fieldsFor = ({ flow, item }: FlowContext): FieldDef[] => {
  switch (flow) {
    case 'new-incident':
      return [
        { id: 'title', label: 'Title', type: 'text', placeholder: 'Short, customer-facing' },
        { id: 'slug', label: 'Slug', type: 'text', placeholder: 'derived from title' },
        { id: 'impact', label: 'Impact', type: 'select', options: IMPACTS },
        { id: 'components', label: 'Components', type: 'multiselect', options: COMPONENTS },
        { id: 'status', label: 'Status', type: 'select', options: INCIDENT_STATUSES },
        { id: 'message', label: 'Message', type: 'multiline', placeholder: 'What is happening, what users see, what we are doing' },
        { id: 'date', label: 'Date', type: 'date' },
      ];
    case 'new-maintenance':
      return [
        { id: 'title', label: 'Title', type: 'text', placeholder: 'Short, customer-facing' },
        { id: 'slug', label: 'Slug', type: 'text', placeholder: 'derived from title' },
        { id: 'scheduledTime', label: 'Starts', type: 'date' },
        { id: 'minutes', label: 'Minutes', type: 'number' },
        { id: 'components', label: 'Components', type: 'multiselect', options: COMPONENTS },
        { id: 'message', label: 'Description', type: 'multiline', placeholder: 'What will be unavailable and for how long' },
      ];
    case 'update':
      return [
        { id: 'status', label: 'Status', type: 'select', options: statusOptions(item!.kind) },
        { id: 'message', label: 'Message', type: 'multiline', placeholder: 'What changed' },
        { id: 'date', label: 'Date', type: 'date' },
      ];
    case 'resolve':
      return [
        { id: 'status', label: 'Status', type: 'select', options: statusOptions(item!.kind), locked: true },
        { id: 'message', label: 'Message', type: 'multiline' },
        { id: 'date', label: 'Date', type: 'date' },
      ];
  }
};

export const initialValues = ({ flow, item, now }: FlowContext): Values => {
  const nowIso = now.toISOString();
  switch (flow) {
    case 'new-incident':
      return { title: '', slug: '', impact: 'major', components: [], status: 'investigating', message: '', date: nowIso };
    case 'new-maintenance':
      return { title: '', slug: '', scheduledTime: nextFullHour(now).toISOString(), minutes: '120', components: [], message: '' };
    case 'update':
      return { status: item!.status, message: '', date: nowIso };
    case 'resolve':
      return item!.kind === 'incident'
        ? { status: 'resolved', message: 'The issue has been resolved.', date: nowIso }
        : { status: 'completed', message: 'Maintenance completed successfully.', date: nowIso };
  }
};

export interface Draft {
  kind: ItemKind;
  path: string;
  slug: string;
  title: string;
  file: IncidentFile | MaintenanceFile;
  /** Every update text the published page must contain. */
  contents: string[];
  status?: string;
}

export interface DraftResult {
  /** Present as soon as a file name can be formed, even while fields are missing. */
  draft: Draft | null;
  /** Problems that block publishing. */
  errors: string[];
}

const str = (values: Values, id: string) => (values[id] as string) ?? '';
const list = (values: Values, id: string) => (values[id] as string[]) ?? [];

/** Effective slug: the edited value, or one derived from the title. */
export const effectiveSlug = (values: Values) => str(values, 'slug') || slugify(str(values, 'title'));

/** Builds the file and path for the current values and lists what still blocks publishing. */
export const buildDraft = (ctx: FlowContext, values: Values): DraftResult => {
  const errors: string[] = [];
  const message = str(values, 'message').trim();
  if (!message) errors.push('Message is required');

  if (ctx.flow === 'new-incident' || ctx.flow === 'new-maintenance') {
    const title = str(values, 'title').trim();
    const slugPart = effectiveSlug(values);
    if (!title) errors.push('Title is required');
    if (!slugPart) errors.push('Slug is required');
    if (!title || !slugPart) return { draft: null, errors };

    if (ctx.flow === 'new-incident') {
      const date = str(values, 'date');
      const status = str(values, 'status');
      const file = buildIncident({
        name: title,
        impact: str(values, 'impact') as IncidentFile['impact'],
        components: list(values, 'components'),
        status,
        content: message,
        date,
      });
      const slug = `${utcDateStamp(new Date(date))}-${slugPart}`;
      return {
        draft: { kind: 'incident', path: join(INCIDENTS_DIR, `${slug}.json`), slug, title, file, contents: [message], status },
        errors,
      };
    }

    const minutes = Number(str(values, 'minutes'));
    if (!Number.isInteger(minutes) || minutes <= 0) errors.push('Minutes must be a positive whole number');
    const scheduledTime = str(values, 'scheduledTime');
    const file = buildMaintenance({ name: title, scheduledTime, minutes, components: list(values, 'components'), content: message });
    const slug = `${utcDateStamp(new Date(scheduledTime))}-${slugPart}`;
    return {
      draft: { kind: 'maintenance', path: join(MAINTENANCES_DIR, `${slug}.json`), slug, title, file, contents: [message] },
      errors,
    };
  }

  const { item, existing } = ctx;
  const status = str(values, 'status');
  const file = appendUpdate(existing!, { date: str(values, 'date'), status, content: message });
  const contents = [
    ...(item!.kind === 'maintenance' ? [(existing as MaintenanceFile).content ?? ''] : []),
    ...file.updates.map((u) => u.content),
  ].filter(Boolean);
  return {
    draft: { kind: item!.kind, path: item!.path, slug: item!.slug, title: existing!.name, file, contents, status },
    errors,
  };
};

/** Validates one field's text input; returns an error message or null. */
export const validateInput = (field: FieldDef, input: string): string | null => {
  if (field.type === 'date' && !parseUtcInput(input)) return 'Use YYYY-MM-DD HH:mm (UTC) or an ISO date';
  if (field.type === 'number' && !/^\d+$/.test(input.trim())) return 'Whole number required';
  return null;
};

/** Converts committed text input into the stored value. */
export const storeInput = (field: FieldDef, input: string): string => {
  if (field.type === 'date') return parseUtcInput(input)!.toISOString();
  if (field.type === 'number') return String(Number(input.trim()));
  if (field.id === 'slug') return slugify(input);
  return input;
};

export { fileNameFor };
