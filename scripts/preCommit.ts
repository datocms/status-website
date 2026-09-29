/**
 * Pre-commit hook: run the test suites that the staged files can break.
 * Skip with `git commit --no-verify`.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { testScope } from './testScope.ts';

// `-z` gives raw paths. Without it, git quotes each path that has a
// non-ASCII character, and a data file would not look like one.
const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMRD'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);

const scope = testScope(staged);

const steps: [label: string, script: string][] = [
  ...(scope.site
    ? ([
        ['Website: type-check', 'check'],
        ['Website: unit tests', 'test:unit'],
        ['Website: end-to-end tests', 'test:e2e'],
      ] as [string, string][])
    : []),
  ...(scope.tui ? ([['TUI: type-check and tests', 'test:tui']] as [string, string][]) : []),
];

if (steps.length === 0) {
  console.log(
    staged.length === 0
      ? 'pre-commit: nothing staged, tests skipped.'
      : 'pre-commit: only data/ changed, tests skipped.',
  );
  process.exit(0);
}

for (const [label, script] of steps) {
  console.log(`\npre-commit: ${label} (npm run ${script})`);
  const { status } = spawnSync('npm', ['run', '--silent', script], {
    stdio: 'inherit',
  });

  if (status !== 0) {
    console.error(
      `\npre-commit: "${label}" failed. The commit did not happen.\n` +
        'Fix the failure, or use `git commit --no-verify` to skip the tests.',
    );
    process.exit(status ?? 1);
  }
}

console.log('\npre-commit: all tests passed.');
