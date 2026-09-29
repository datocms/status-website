import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * The pre-push hook deploys the static mirror. These tests run it with
 * MIRROR_DRY_RUN, which builds the mirror and does not push it.
 *
 * The hook publishes to the real mirror, so these tests do not rely on the
 * hook to stay safe: they put a `git` in front of the real one that refuses
 * every push. A hook that ignores MIRROR_DRY_RUN then fails, and deploys
 * nothing.
 */
const ZERO = '0'.repeat(40);
const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

// A commit of the staged files, which no branch holds. During a commit, HEAD
// is still the commit before it, and can have older code than these tests.
const head = git('commit-tree', git('write-tree'), '-p', 'HEAD', '-m', 'Staged state for the hook tests');
const built: string[] = [];

const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
const shimDir = mkdtempSync(join(tmpdir(), 'no-push-git-'));
writeFileSync(
  join(shimDir, 'git'),
  `#!/bin/sh
for argument in "$@"; do
  if [ "$argument" = "push" ]; then
    echo "TEST GUARD: git push refused" >&2
    exit 97
  fi
done
exec "${realGit}" "$@"
`,
);
chmodSync(join(shimDir, 'git'), 0o755);

const runHook = (refs: string) => {
  const { status, stdout, stderr } = spawnSync('sh', ['-e', '.husky/pre-push'], {
    input: refs,
    encoding: 'utf8',
    env: { ...process.env, MIRROR_DRY_RUN: '1', PATH: `${shimDir}:${process.env.PATH}` },
  });
  const dir = /^Mirror built in (.+)$/m.exec(stdout)?.[1] ?? null;
  if (dir) built.push(dir);

  return { status, output: stdout + stderr, dir };
};

afterAll(() => {
  for (const dir of built) rmSync(dir, { recursive: true, force: true });
  rmSync(shimDir, { recursive: true, force: true });
});

describe('pre-push hook', () => {
  it('has a guard that refuses a push', () => {
    const { status, stderr } = spawnSync('sh', ['-c', 'git push --dry-run origin HEAD:refs/heads/never'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}` },
    });

    expect(status).toBe(97);
    expect(stderr).toContain('TEST GUARD');
  });

  it('knows the dry run', () => {
    expect(readFileSync('.husky/pre-push', 'utf8')).toContain('MIRROR_DRY_RUN');
  });

  it('deploys nothing for a push of another branch', () => {
    const { status, output, dir } = runHook(`refs/heads/feature/x ${head} refs/heads/feature/x ${ZERO}\n`);

    expect(status).toBe(0);
    expect(output).toContain('Not a push to master');
    expect(dir).toBeNull();
  });

  it('deploys nothing when the push removes master', () => {
    const { status, dir } = runHook(`(delete) ${ZERO} refs/heads/master ${head}\n`);

    expect(status).toBe(0);
    expect(dir).toBeNull();
  });

  it('builds the mirror from the commit, not from the files of the working tree', () => {
    // A draft that a maintainer kept, and did not commit.
    const draft = 'data/incidents/2099-01-01-draft-that-nobody-committed.json';
    writeFileSync(
      draft,
      JSON.stringify({ name: 'Draft', impact: 'minor', components: [], updates: [{ date: '2099-01-01T00:00:00.000Z', status: 'investigating', content: 'Draft.' }] }),
    );

    try {
      const { status, output, dir } = runHook(`refs/heads/master ${head} refs/heads/master ${ZERO}\n`);

      expect(status, output).toBe(0);
      expect(dir).not.toBeNull();

      const pages = readdirSync(join(dir!, 'incidents'));
      const committed = ['data/incidents', 'data/maintenances'].flatMap((folder) =>
        // -z, because Git puts a name with an emoji in quotes without it.
        execFileSync('git', ['ls-tree', '-z', '--name-only', `${head}:${folder}`], { encoding: 'utf8' })
          .split('\0')
          .filter((name) => name.endsWith('.json')),
      );

      expect(pages).not.toContain('2099-01-01-draft-that-nobody-committed');
      expect(pages).toHaveLength(committed.length);
      expect(existsSync(join(dir!, 'index.html'))).toBe(true);
      expect(existsSync(join(dir!, 'CNAME'))).toBe(true);
      expect(existsSync(join(dir!, '.nojekyll'))).toBe(true);
    } finally {
      rmSync(draft, { force: true });
    }

    // The hook leaves no worktree behind.
    expect(execFileSync('git', ['worktree', 'list'], { encoding: 'utf8' }).trim().split('\n')).toHaveLength(1);
  }, 180_000);
});
