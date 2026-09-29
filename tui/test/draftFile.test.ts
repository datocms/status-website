import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planDraftWrite } from '../src/lib/draftFile.ts';

const taken = (...paths: string[]) => (path: string) => paths.includes(path);

test('writes a new file when the name is free', () => {
  assert.deepEqual(planDraftWrite({ path: 'a.json', owned: null, isNewFile: true, exists: taken() }), {
    action: 'write',
    remove: null,
  });
});

test('does not touch a file that another incident has', () => {
  assert.deepEqual(planDraftWrite({ path: 'a.json', owned: null, isNewFile: true, exists: taken('a.json') }), {
    action: 'collision',
    remove: null,
  });
});

test('writes again to the file that this draft made', () => {
  assert.deepEqual(planDraftWrite({ path: 'a.json', owned: 'a.json', isNewFile: true, exists: taken('a.json') }), {
    action: 'write',
    remove: null,
  });
});

test('removes the file of the old name when the name changes', () => {
  assert.deepEqual(planDraftWrite({ path: 'b.json', owned: 'a.json', isNewFile: true, exists: taken('a.json') }), {
    action: 'write',
    remove: 'a.json',
  });
});

test('on the way to a longer name, leaves a file of another incident alone', () => {
  // "CDA errors" exists. The maintainer types "CDA errors again" and stops at "CDA errors".
  const exists = taken('cda-errors.json', 'cda.json');
  const first = planDraftWrite({ path: 'cda.json', owned: null, isNewFile: true, exists: taken('cda-errors.json') });
  assert.deepEqual(first, { action: 'write', remove: null });

  const pause = planDraftWrite({ path: 'cda-errors.json', owned: 'cda.json', isNewFile: true, exists });
  assert.deepEqual(pause, { action: 'collision', remove: null });

  const end = planDraftWrite({ path: 'cda-errors-again.json', owned: 'cda.json', isNewFile: true, exists });
  assert.deepEqual(end, { action: 'write', remove: 'cda.json' });
});

test('an update writes to the file of its item, which exists', () => {
  assert.deepEqual(planDraftWrite({ path: 'a.json', owned: null, isNewFile: false, exists: taken('a.json') }), {
    action: 'write',
    remove: null,
  });
});
