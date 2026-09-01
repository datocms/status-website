import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDraft, effectiveSlug, fieldsFor, initialValues, storeInput, validateInput, type FlowContext } from '../src/lib/flows.ts';
import type { OpenItem } from '../src/lib/files.ts';

const now = new Date('2026-09-01T21:27:49.000Z');

test('new incident: fields, defaults, and draft path', () => {
  const ctx: FlowContext = { flow: 'new-incident', now };
  assert.deepEqual(
    fieldsFor(ctx).map((f) => f.id),
    ['title', 'slug', 'impact', 'components', 'status', 'message', 'date'],
  );
  const values = initialValues(ctx);
  assert.equal(values.impact, 'major');
  assert.equal(values.status, 'investigating');
  assert.equal(values.date, now.toISOString());

  const empty = buildDraft(ctx, values);
  assert.equal(empty.draft, null);
  assert.deepEqual(empty.errors, ['Message is required', 'Title is required', 'Slug is required']);

  const titled = buildDraft(ctx, { ...values, title: 'Imgix outage' });
  assert.ok(titled.draft);
  assert.match(titled.draft!.path, /data\/incidents\/2026-09-01-imgix-outage\.json$/);
  assert.deepEqual(titled.errors, ['Message is required']);

  const full = buildDraft(ctx, { ...values, title: 'Imgix outage', message: 'We are on it.', components: ['assets'] });
  assert.deepEqual(full.errors, []);
  assert.deepEqual(full.draft!.file, {
    name: 'Imgix outage',
    impact: 'major',
    components: ['assets'],
    updates: [{ date: now.toISOString(), status: 'investigating', content: 'We are on it.' }],
  });
  assert.deepEqual(full.draft!.contents, ['We are on it.']);
});

test('slug: edited value wins over the derived one', () => {
  assert.equal(effectiveSlug({ title: 'Imgix outage', slug: '' }), 'imgix-outage');
  assert.equal(effectiveSlug({ title: 'Imgix outage', slug: 'custom' }), 'custom');
  const ctx: FlowContext = { flow: 'new-incident', now };
  const draft = buildDraft(ctx, { ...initialValues(ctx), title: 'Imgix outage', slug: 'custom', message: 'x' }).draft!;
  assert.equal(draft.slug, '2026-09-01-custom');
});

test('new maintenance: minutes stored as string, scheduled date names the file', () => {
  const ctx: FlowContext = { flow: 'new-maintenance', now };
  const values = { ...initialValues(ctx), title: 'DB upgrade', message: 'Read-only.', scheduledTime: '2026-09-19T05:30:00.000Z', minutes: '180' };
  const { draft, errors } = buildDraft(ctx, values);
  assert.deepEqual(errors, []);
  assert.match(draft!.path, /data\/maintenances\/2026-09-19-db-upgrade\.json$/);
  assert.equal((draft!.file as { minutes: string }).minutes, '180');
  assert.deepEqual(buildDraft(ctx, { ...values, minutes: '0' }).errors, ['Minutes must be a positive whole number']);
});

const item: OpenItem = {
  kind: 'incident',
  path: '/repo/data/incidents/2026-09-01-imgix.json',
  slug: '2026-09-01-imgix',
  name: 'Imgix outage',
  status: 'investigating',
  date: now,
  isOpen: true,
};
const existing = {
  name: 'Imgix outage',
  impact: 'minor' as const,
  components: ['assets'],
  updates: [{ date: now.toISOString(), status: 'investigating', content: 'We are on it.' }],
};

test('update: appends to the existing file and lists every update for verification', () => {
  const ctx: FlowContext = { flow: 'update', item, existing, now };
  assert.deepEqual(fieldsFor(ctx).map((f) => f.id), ['status', 'message', 'date']);
  assert.equal(initialValues(ctx).status, 'investigating');
  const { draft, errors } = buildDraft(ctx, { status: 'monitoring', message: 'Fix deployed.', date: '2026-09-01T22:00:00.000Z' });
  assert.deepEqual(errors, []);
  assert.equal(draft!.path, item.path);
  assert.equal(draft!.file.updates.length, 2);
  assert.deepEqual(draft!.file.updates[1], { date: '2026-09-01T22:00:00.000Z', status: 'monitoring', content: 'Fix deployed.' });
  assert.deepEqual(draft!.contents, ['We are on it.', 'Fix deployed.']);
  assert.equal(draft!.status, 'monitoring');
});

test('resolve: locks the status and prefills the message per kind', () => {
  const ctx: FlowContext = { flow: 'resolve', item, existing, now };
  assert.equal(fieldsFor(ctx)[0].locked, true);
  assert.deepEqual(initialValues(ctx), { status: 'resolved', message: 'The issue has been resolved.', date: now.toISOString() });

  const maintenance: OpenItem = { ...item, kind: 'maintenance', status: 'in_progress' };
  const mctx: FlowContext = {
    flow: 'resolve',
    item: maintenance,
    existing: { scheduledTime: now.toISOString(), name: 'DB', minutes: '60', content: 'Read-only.', components: [], updates: [] },
    now,
  };
  assert.equal(initialValues(mctx).status, 'completed');
  const { draft } = buildDraft(mctx, initialValues(mctx));
  assert.deepEqual(draft!.contents, ['Read-only.', 'Maintenance completed successfully.']);
});

test('validateInput and storeInput for dates, numbers, and slugs', () => {
  const date = fieldsFor({ flow: 'new-incident', now }).find((f) => f.id === 'date')!;
  assert.equal(validateInput(date, '2026-09-01 21:27'), null);
  assert.match(validateInput(date, 'yesterday')!, /YYYY-MM-DD/);
  assert.equal(storeInput(date, '2026-09-01 21:27'), '2026-09-01T21:27:00.000Z');

  const minutes = fieldsFor({ flow: 'new-maintenance', now }).find((f) => f.id === 'minutes')!;
  assert.equal(validateInput(minutes, '12x'), 'Whole number required');
  assert.equal(storeInput(minutes, ' 090 '), '90');

  const slug = fieldsFor({ flow: 'new-incident', now }).find((f) => f.id === 'slug')!;
  assert.equal(storeInput(slug, 'Hello World!'), 'hello-world');
});
