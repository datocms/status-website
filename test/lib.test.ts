import { describe, expect, it } from 'vitest';
import i18n from '../src/lib/i18n';
import { renderMarkdown } from '../src/lib/markdown';
import { timeLink } from '../src/lib/timeLink';
import { COMPONENTS, IMPACT_IDS, INCIDENT_STATUSES, MAINTENANCE_STATUSES } from '../src/lib/schema';

describe('schema and i18n', () => {
  it('gives a label to every component and status of the schema', () => {
    for (const { id, label } of COMPONENTS) expect(i18n[`component.${id}`]).toBe(label);
    for (const { id, label } of [...INCIDENT_STATUSES, ...MAINTENANCE_STATUSES]) expect(i18n[`status.${id}`]).toBe(label);
  });

  it('keeps the labels of ids that only old files use', () => {
    expect(i18n['component.backend']).toBe('Projects administrative interface');
    expect(i18n['component.imgix']).toBe('Assets CDN (Imgix)');
    expect(i18n['status.in_progress']).toBe('In progress');
  });

  it('writes in-progress with a hyphen, as the data files do', () => {
    expect(MAINTENANCE_STATUSES.map((s) => s.id)).toEqual(['scheduled', 'in-progress', 'verifying', 'completed']);
    expect(IMPACT_IDS).toEqual(['none', 'minor', 'major', 'critical']);
  });

  it('keeps the labels that the status cards use', () => {
    expect(i18n['status.operational']).toBe('Operational');
    expect(i18n['status.unknown']).toBe('Unknown');
    expect(i18n['region.europe']).toBe('Europe');
  });
});

describe('renderMarkdown', () => {
  it('renders paragraphs, lists, emphasis and links', () => {
    const html = renderMarkdown('First **bold**.\n\n- one\n- two\n\nSee [docs](https://example.com).');

    expect(html).toContain('<p>First <strong>bold</strong>.</p>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<a href="https://example.com">docs</a>');
  });

  it('keeps emoji and accents', () => {
    expect(renderMarkdown('📅 Accès rétabli — “ok”')).toContain('📅 Accès rétabli — “ok”');
  });
});

describe('timeLink', () => {
  it('links to the UTC minute with an encoded title', () => {
    expect(timeLink(new Date('2026-09-19T05:30:45.000Z'), 'Maintenance start date')).toBe(
      'https://timee.io/20260919T0530?tl=Maintenance%20start%20date',
    );
  });
});
