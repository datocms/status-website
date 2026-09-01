import { unlinkSync } from 'node:fs';
import { relative } from 'node:path';
import { run, type Runner } from './proc.ts';
import { REPO_ROOT } from './paths.ts';

export type Flow = 'new-incident' | 'new-maintenance' | 'update' | 'resolve' | 'rollback';

export const defaultCommitMessage = (flow: Flow, title: string, status?: string) => {
  switch (flow) {
    case 'new-incident':
      return `Add incident: ${title}`;
    case 'new-maintenance':
      return `Schedule maintenance: ${title}`;
    case 'update':
      return `Update ${title}: ${status}`;
    case 'resolve':
      return `Resolve ${title}`;
    case 'rollback':
      return `Roll back ${title} to ${status}`;
  }
};

export type PublishStep = 'add' | 'commit' | 'push';

export interface PublishResult {
  ok: boolean;
  failedStep?: PublishStep;
  code?: number | null;
}

export interface PublishOptions {
  file: string;
  message: string;
  push: boolean;
  cwd?: string;
  onOutput?: (chunk: string) => void;
  runner?: Runner;
}

/** `git add`, `git commit`, and optionally `git push`, stopping at the first failure. */
export const publish = async ({
  file,
  message,
  push,
  cwd = REPO_ROOT,
  onOutput,
  runner = run,
}: PublishOptions): Promise<PublishResult> => {
  const steps: [PublishStep, string[]][] = [
    ['add', ['add', '--', relative(cwd, file)]],
    ['commit', ['commit', '-m', message]],
  ];
  if (push) {
    steps.push(['push', ['push']]);
  }

  for (const [step, args] of steps) {
    onOutput?.(`$ git ${args.join(' ')}\n`);
    const result = await runner('git', args, { cwd, onOutput });
    if (result.code !== 0) {
      return { ok: false, failedStep: step, code: result.code };
    }
  }
  return { ok: true };
};

export const isTracked = async (file: string, cwd = REPO_ROOT, runner: Runner = run) =>
  (await runner('git', ['ls-files', '--error-unmatch', '--', relative(cwd, file)], { cwd })).code === 0;

/** Restores a tracked file to its committed content, or deletes an untracked draft. */
export const discardDraft = async (file: string, cwd = REPO_ROOT, runner: Runner = run) => {
  if (await isTracked(file, cwd, runner)) {
    await runner('git', ['checkout', '--', relative(cwd, file)], { cwd });
  } else {
    unlinkSync(file);
  }
};

export const currentBranch = async (cwd = REPO_ROOT, runner: Runner = run) =>
  (await runner('git', ['branch', '--show-current'], { cwd })).stdout.trim();
