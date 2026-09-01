import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from 'ink-testing-library';
import { Select } from '../src/components/Select.tsx';
import { Checklist } from '../src/components/Checklist.tsx';
import { LineInput } from '../src/components/LineInput.tsx';
import { MultilineInput } from '../src/components/MultilineInput.tsx';
import { JsonPane } from '../src/components/JsonPane.tsx';

const ARROW_DOWN = '[B';
const ENTER = '\r';
const ESC = '';

const tick = () => new Promise((r) => setTimeout(r, 20));

test('Select moves with arrows and submits the highlighted id', async () => {
  let picked = '';
  const { stdin, lastFrame } = render(
    <Select options={[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta', description: 'second' }]} onSubmit={(id) => (picked = id)} />,
  );
  assert.match(lastFrame()!, /› Alpha/);
  stdin.write(ARROW_DOWN);
  await tick();
  assert.match(lastFrame()!, /› Beta\s+second/);
  stdin.write(ENTER);
  await tick();
  assert.equal(picked, 'b');
});

test('Select refuses disabled options and cancels on Esc', async () => {
  let picked = '';
  let cancelled = false;
  const { stdin } = render(
    <Select options={[{ id: 'a', label: 'Alpha', disabled: true }]} onSubmit={(id) => (picked = id)} onCancel={() => (cancelled = true)} />,
  );
  stdin.write(ENTER);
  await tick();
  assert.equal(picked, '');
  stdin.write(ESC);
  await tick();
  assert.equal(cancelled, true);
});

test('Checklist toggles with space and submits the checked ids in option order', async () => {
  let picked: string[] = [];
  const { stdin, lastFrame } = render(
    <Checklist options={[{ id: 'cda', label: 'CDA' }, { id: 'cma', label: 'CMA' }]} value={['cma']} onSubmit={(ids) => (picked = ids)} />,
  );
  assert.match(lastFrame()!, /\[ \] CDA/);
  assert.match(lastFrame()!, /\[x\] CMA/);
  stdin.write(' ');
  await tick();
  assert.match(lastFrame()!, /\[x\] CDA/);
  stdin.write(ENTER);
  await tick();
  assert.deepEqual(picked, ['cda', 'cma']);
});

test('LineInput edits, reports changes, and refuses Enter while there is an error', async () => {
  const changes: string[] = [];
  let submitted = '';
  const { stdin, rerender } = render(
    <LineInput value="ab" onChange={(v) => changes.push(v)} onSubmit={(v) => (submitted = v)} error="bad" />,
  );
  stdin.write('c');
  await tick();
  assert.deepEqual(changes, ['abc']);
  stdin.write(ENTER);
  await tick();
  assert.equal(submitted, '');
  rerender(<LineInput value="ab" onSubmit={(v) => (submitted = v)} error={null} />);
  await tick();
  stdin.write(ENTER);
  await tick();
  assert.equal(submitted, 'abc');
});

test('MultilineInput inserts newlines on Enter and finishes on Esc', async () => {
  let submitted = '';
  const { stdin, lastFrame } = render(<MultilineInput value="one" height={5} onSubmit={(v) => (submitted = v)} />);
  stdin.write(ENTER);
  await tick();
  stdin.write('two');
  await tick();
  assert.match(lastFrame()!, /one\n\s*two/);
  stdin.write(ESC);
  await tick();
  assert.equal(submitted, 'one\ntwo');
});

test('JsonPane clips long documents and can show the tail', () => {
  const json = Array.from({ length: 10 }, (_, i) => `line${i}`).join('\n');
  const head = render(<JsonPane title="t" json={json} height={4} />).lastFrame()!;
  assert.match(head, /line0/);
  assert.match(head, /… 7 more lines/);
  const tail = render(<JsonPane title="t" json={json} height={4} tail />).lastFrame()!;
  assert.match(tail, /… 7 lines above/);
  assert.match(tail, /line9/);
});
