import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  appendUpdate,
  buildIncident,
  buildMaintenance,
  fileNameFor,
  listItems,
  listOpenItems,
  recentUpdateExamples,
  serialize,
  slugify,
} from '../src/lib/files.ts';

test('slugify lowercases, collapses punctuation, drops emoji and accents', () => {
  assert.equal(slugify('Partial outage of image processing'), 'partial-outage-of-image-processing');
  assert.equal(slugify('🛠️ Scheduled maintenance [ ⚠️ READ-ONLY MODE ]'), 'scheduled-maintenance-read-only-mode');
  assert.equal(slugify('Élévation des erreurs'), 'elevation-des-erreurs');
  assert.equal(slugify('  --Hello--  '), 'hello');
});

test('fileNameFor prefixes the UTC date', () => {
  assert.equal(fileNameFor('Imgix outage', new Date('2026-09-01T23:30:00.000Z')), '2026-09-01-imgix-outage.json');
});

test('buildIncident keeps the key order of existing files', () => {
  const file = buildIncident({
    name: 'Imgix outage',
    impact: 'minor',
    components: ['assets'],
    status: 'investigating',
    content: 'We are investigating.',
    date: '2026-09-01T21:27:49.000Z',
  });
  assert.deepEqual(Object.keys(file), ['name', 'impact', 'components', 'updates']);
  assert.deepEqual(Object.keys(file.updates[0]), ['date', 'status', 'content']);
});

test('buildMaintenance writes minutes as a string and an empty updates array', () => {
  const file = buildMaintenance({
    name: 'DB upgrade',
    scheduledTime: '2026-09-19T05:30:00.000Z',
    minutes: 180,
    components: ['cda', 'cma'],
    content: 'Read-only mode.',
  });
  assert.deepEqual(Object.keys(file), ['scheduledTime', 'name', 'minutes', 'content', 'components', 'updates']);
  assert.equal(file.minutes, '180');
  assert.deepEqual(file.updates, []);
});

test('appendUpdate does not mutate and normalizes key order', () => {
  const original = { name: 'x', impact: 'minor' as const, components: [], updates: [] };
  const next = appendUpdate(original, { content: 'Fixed.', status: 'resolved', date: '2026-09-02T00:00:00.000Z' });
  assert.equal(original.updates.length, 0);
  assert.deepEqual(Object.keys(next.updates[0]), ['date', 'status', 'content']);
});

test('serialize uses two-space indent and a trailing newline', () => {
  assert.equal(serialize({ a: 1 }), '{\n  "a": 1\n}\n');
});

const fixtureDirs = () => {
  const root = mkdtempSync(join(tmpdir(), 'status-tui-'));
  const incidents = join(root, 'incidents');
  const maintenances = join(root, 'maintenances');
  mkdirSync(incidents);
  mkdirSync(maintenances);
  writeFileSync(
    join(incidents, '2026-08-10-emails.json'),
    JSON.stringify({
      name: 'Issues sending emails',
      impact: 'minor',
      components: ['dashboard'],
      updates: [
        { date: '2026-08-10T14:35:14.000Z', status: 'monitoring', content: 'Email delivery was restored.' },
        { date: '2026-08-17T08:20:34.000Z', status: 'resolved', content: 'The issue has been resolved.' },
      ],
    }),
  );
  writeFileSync(
    join(incidents, '2026-09-01-imgix.json'),
    JSON.stringify({
      name: 'Imgix outage',
      impact: 'minor',
      components: ['assets'],
      updates: [{ date: '2026-09-01T21:27:49.000Z', status: 'investigating', content: 'We are investigating.' }],
    }),
  );
  writeFileSync(
    join(maintenances, '2026-09-19-db.json'),
    JSON.stringify({
      scheduledTime: '2026-09-19T05:30:00.000Z',
      name: 'DB maintenance',
      minutes: '180',
      content: 'Read-only.',
      components: ['cda'],
      updates: [],
    }),
  );
  return { incidents, maintenances };
};

test('listItems derives status and open state, newest first', () => {
  const items = listItems(fixtureDirs());
  assert.deepEqual(
    items.map((i) => [i.slug, i.kind, i.status, i.isOpen]),
    [
      ['2026-09-19-db', 'maintenance', 'scheduled', true],
      ['2026-09-01-imgix', 'incident', 'investigating', true],
      ['2026-08-10-emails', 'incident', 'resolved', false],
    ],
  );
});

test('listOpenItems drops resolved incidents', () => {
  assert.deepEqual(
    listOpenItems(fixtureDirs()).map((i) => i.slug),
    ['2026-09-19-db', '2026-09-01-imgix'],
  );
});

test('recentUpdateExamples returns first update of the newest incidents', () => {
  assert.deepEqual(recentUpdateExamples(2, fixtureDirs()), [
    'We are investigating.',
    'Email delivery was restored.',
  ]);
});
