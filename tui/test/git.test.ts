import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultCommitMessage, discardDraft, publish } from '../src/lib/git.ts';
import type { Runner } from '../src/lib/proc.ts';

const fakeRunner = (failOn?: string): { runner: Runner; calls: string[][] } => {
  const calls: string[][] = [];
  const runner: Runner = async (cmd, args, options) => {
    calls.push([cmd, ...args]);
    options?.onOutput?.(`ran ${args[0]}\n`);
    const code = failOn && args[0] === failOn ? 1 : 0;
    return { code, stdout: '', stderr: code ? 'boom' : '', timedOut: false };
  };
  return { runner, calls };
};

test('defaultCommitMessage per flow', () => {
  assert.equal(defaultCommitMessage('new-incident', 'Imgix outage'), 'Add incident: Imgix outage');
  assert.equal(defaultCommitMessage('new-maintenance', 'DB'), 'Schedule maintenance: DB');
  assert.equal(defaultCommitMessage('update', 'Imgix outage', 'monitoring'), 'Update Imgix outage: monitoring');
  assert.equal(defaultCommitMessage('resolve', 'Imgix outage'), 'Resolve Imgix outage');
});

test('publish runs add, commit, push in order with relative paths', async () => {
  const { runner, calls } = fakeRunner();
  const output: string[] = [];
  const result = await publish({
    file: '/repo/data/incidents/x.json',
    message: 'msg',
    push: true,
    cwd: '/repo',
    runner,
    onOutput: (c) => output.push(c),
  });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(calls, [
    ['git', 'add', '--', 'data/incidents/x.json'],
    ['git', 'commit', '-m', 'msg'],
    ['git', 'push'],
  ]);
  assert.ok(output.some((c) => c.startsWith('$ git add')));
});

test('publish skips push when asked and stops at the first failure', async () => {
  const noPush = fakeRunner();
  await publish({ file: '/repo/a.json', message: 'm', push: false, cwd: '/repo', runner: noPush.runner });
  assert.deepEqual(noPush.calls.map((c) => c[1]), ['add', 'commit']);

  const failing = fakeRunner('commit');
  const result = await publish({ file: '/repo/a.json', message: 'm', push: true, cwd: '/repo', runner: failing.runner });
  assert.deepEqual(result, { ok: false, failedStep: 'commit', code: 1 });
  assert.deepEqual(failing.calls.map((c) => c[1]), ['add', 'commit']);
});

test('discardDraft restores tracked files and deletes untracked ones', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'status-tui-git-'));
  const untracked = join(dir, 'new.json');
  writeFileSync(untracked, '{}');

  const tracked = fakeRunner();
  await discardDraft(join(dir, 'old.json'), dir, tracked.runner);
  assert.deepEqual(tracked.calls.map((c) => c[1]), ['ls-files', 'checkout']);

  const notTracked: Runner = async (_cmd, args) => ({
    code: args[0] === 'ls-files' ? 1 : 0,
    stdout: '',
    stderr: '',
    timedOut: false,
  });
  await discardDraft(untracked, dir, notTracked);
  assert.equal(existsSync(untracked), false);
});
