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

test('appendUpdateText adds the update and keeps every other byte', async () => {
  const { appendUpdateText } = await import('../src/lib/files.ts');
  const update = { date: '2026-09-28T20:57:48.847Z', status: 'identified', content: 'Line "one".\nTwo [x] {y}.' };
  const original = '{\n  "name": "A [tricky] \\"name\\"",\n  "impact": "minor",\n  "components": ["dashboard", "administrativeAreas"],\n  "updates": [\n    {\n      "date": "2026-09-27T10:00:00.000Z",\n      "content": "Has ] and \\"updates\\": [ inside.",\n      "status": "investigating"\n    }\n  ]\n}\n';
  const result = appendUpdateText(original, update);
  assert.ok(result.includes('"components": ["dashboard", "administrativeAreas"],'));
  assert.ok(result.startsWith(original.slice(0, original.lastIndexOf('}\n  ]') + 1)));
  assert.ok(result.endsWith('\n  ]\n}\n'));
  assert.deepEqual(JSON.parse(result).updates[1], update);
  assert.equal(JSON.parse(result).updates.length, 2);
});

test('appendUpdateText handles an empty array and keys after updates', async () => {
  const { appendUpdateText } = await import('../src/lib/files.ts');
  const update = { date: 'd', status: 'in-progress', content: 'c' };
  const original = '{\n  "scheduledTime": "t",\n  "updates": [],\n  "name": "Last key"\n}\n';
  const result = appendUpdateText(original, update);
  assert.equal(result, '{\n  "scheduledTime": "t",\n  "updates": [\n    {\n      "date": "d",\n      "status": "in-progress",\n      "content": "c"\n    }\n  ],\n  "name": "Last key"\n}\n');
});

test('appendUpdateText leaves every real data file intact apart from the new update', async () => {
  const { appendUpdateText } = await import('../src/lib/files.ts');
  const { readdirSync, readFileSync } = await import('node:fs');
  const update = { date: '2026-01-01T00:00:00.000Z', status: 'resolved', content: 'Probe.' };
  const probe = /,?\n {4}\{\n {6}"date": "2026-01-01T00:00:00\.000Z",\n {6}"status": "resolved",\n {6}"content": "Probe\."\n {4}\}\n {2}(?=\])/;
  let checked = 0;
  for (const dir of ['incidents', 'maintenances']) {
    const base = join(import.meta.dirname, '../../data', dir);
    for (const name of readdirSync(base).filter((f) => f.endsWith('.json'))) {
      const original = readFileSync(join(base, name), 'utf8');
      if (!/"updates"\s*:\s*\[/.test(original)) continue;
      const result = appendUpdateText(original, update);
      const before = JSON.parse(original);
      assert.deepEqual(JSON.parse(result), { ...before, updates: [...before.updates, update] }, name);
      // Remove the inserted block: only whitespace before the `]` can differ.
      assert.equal(result.replace(probe, '').replace(/\s+/g, ''), original.replace(/\s+/g, ''), name);
      const untouched = original.slice(0, original.search(/"updates"\s*:\s*\[/));
      assert.ok(result.startsWith(untouched), name);
      checked += 1;
    }
  }
  assert.ok(checked > 80);
});
