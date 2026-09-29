import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileAtVersion, fileHistory, firstChange, parseLog, sideBySide } from '../src/lib/history.ts';
import type { Runner } from '../src/lib/proc.ts';

const SEP = '\x1f';

test('parseLog reads sha, epoch, author, subject', () => {
  const versions = parseLog(`abc${SEP}1756761600${SEP}Roger${SEP}Resolve Imgix\ndef${SEP}1756675200${SEP}Stefano${SEP}Add incident: Imgix\n`);
  assert.deepEqual(
    versions.map((v) => [v.sha, v.date.toISOString(), v.author, v.subject]),
    [
      ['abc', '2025-09-01T21:20:00.000Z', 'Roger', 'Resolve Imgix'],
      ['def', '2025-08-31T21:20:00.000Z', 'Stefano', 'Add incident: Imgix'],
    ],
  );
});

test('fileHistory and fileAtVersion call git with repo-relative paths', async () => {
  const calls: string[][] = [];
  const runner: Runner = async (_cmd, args) => {
    calls.push(args);
    return { code: 0, stdout: args[0] === 'show' ? '{"name":"old"}\n' : `s${SEP}1${SEP}a${SEP}m\n`, stderr: '', timedOut: false };
  };
  const versions = await fileHistory('/repo/data/incidents/x.json', '/repo', runner);
  assert.equal(versions.length, 1);
  assert.deepEqual(calls[0].slice(-2), ['--', 'data/incidents/x.json']);
  const content = await fileAtVersion('/repo/data/incidents/x.json', 'abc123', '/repo', runner);
  assert.equal(content, '{"name":"old"}\n');
  assert.deepEqual(calls[1], ['show', 'abc123:data/incidents/x.json']);
});

test('sideBySide pairs changed lines and keeps context', () => {
  const rows = sideBySide('a\nb\nc\n', 'a\nB\nc\nd\n');
  assert.deepEqual(rows, [
    { left: 'a', right: 'a', kind: 'same' },
    { left: 'b', right: 'B', kind: 'changed' },
    { left: 'c', right: 'c', kind: 'same' },
    { left: null, right: 'd', kind: 'added' },
  ]);
  assert.equal(firstChange(rows), 1);
});

test('sideBySide handles pure removals and identical input', () => {
  assert.deepEqual(sideBySide('a\nb\n', 'a\n'), [
    { left: 'a', right: 'a', kind: 'same' },
    { left: 'b', right: null, kind: 'removed' },
  ]);
  const same = sideBySide('x\n', 'x\n');
  assert.ok(same.every((r) => r.kind === 'same'));
  assert.equal(firstChange(same), 0);
});
