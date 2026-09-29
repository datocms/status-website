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
    ['git', 'commit', '-m', 'msg', '--', 'data/incidents/x.json'],
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

test('branchState allows publishing only from the default branch of origin', async () => {
  const { branchState } = await import('../src/lib/git.ts');
  const runnerFor = (current: string, head: string | null): Runner => async (_cmd, args) =>
    args[0] === 'symbolic-ref'
      ? { code: head ? 0 : 1, stdout: head ? `${head}\n` : '', stderr: '', timedOut: false }
      : { code: 0, stdout: `${current}\n`, stderr: '', timedOut: false };

  assert.deepEqual(await branchState('/repo', runnerFor('master', 'origin/master')), { current: 'master', production: 'master', canPublish: true });
  assert.deepEqual(await branchState('/repo', runnerFor('feature/tui', 'origin/master')), { current: 'feature/tui', production: 'master', canPublish: false });
  // No origin/HEAD: fall back to master.
  assert.deepEqual(await branchState('/repo', runnerFor('feature/tui', null)), { current: 'feature/tui', production: 'master', canPublish: false });
});

test('publish commits the status update alone, and leaves other staged files staged', async () => {
  const { execFileSync } = await import('node:child_process');
  const { mkdirSync, readFileSync } = await import('node:fs');
  const repo = mkdtempSync(join(tmpdir(), 'status-tui-repo-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });

  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  mkdirSync(join(repo, 'data/incidents'), { recursive: true });
  mkdirSync(join(repo, 'src'));
  writeFileSync(join(repo, 'data/incidents/x.json'), '{}\n');
  writeFileSync(join(repo, 'src/code.ts'), 'export const a = 1;\n');
  git('add', '-A');
  git('commit', '-qm', 'base');

  // The maintainer has work in progress, staged, and posts an update.
  writeFileSync(join(repo, 'src/code.ts'), 'export const a = 2;\n');
  git('add', 'src/code.ts');
  writeFileSync(join(repo, 'data/incidents/x.json'), '{ "name": "x" }\n');

  const result = await publish({ file: join(repo, 'data/incidents/x.json'), message: 'Add incident: x', push: false, cwd: repo });

  assert.deepEqual(result, { ok: true });
  assert.equal(git('show', '--format=', '--name-only', 'HEAD').trim(), 'data/incidents/x.json');
  assert.equal(git('diff', '--cached', '--name-only').trim(), 'src/code.ts');
  assert.equal(readFileSync(join(repo, 'src/code.ts'), 'utf8'), 'export const a = 2;\n');
});

test('publishResultMessage says how far the publish got', async () => {
  const { publishResultMessage } = await import('../src/lib/git.ts');

  assert.match(publishResultMessage({ ok: false, failedStep: 'add', code: 1 }), /written.*not committed/i);
  assert.match(publishResultMessage({ ok: false, failedStep: 'commit', code: 1 }), /written.*not committed/i);

  const pushFailed = publishResultMessage({ ok: false, failedStep: 'push', code: 1 });
  assert.match(pushFailed, /committed/i);
  assert.match(pushFailed, /not pushed|push failed/i);
  assert.match(pushFailed, /git push/);
  assert.match(pushFailed, /do not add the update again/i);
  assert.doesNotMatch(pushFailed, /staged/i);
});
