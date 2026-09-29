/** Which test suites a set of changed files requires. */
export interface TestScope {
  /** Type-check, unit tests, and end-to-end tests of the website. */
  site: boolean;
  /** Type-check and tests of the maintainer TUI. */
  tui: boolean;
}

/** Status updates: content, not code. They need no tests. */
const isData = (file: string) => file.startsWith('data/');

const isTui = (file: string) => file.startsWith('tui/');

/** Files that both the website and the TUI depend on. */
const isShared = (file: string) =>
  file === 'src/lib/schema.ts' ||
  file === 'package.json' ||
  file === 'package-lock.json' ||
  file.startsWith('.husky/') ||
  file.startsWith('scripts/');

/**
 * A commit that changes only `data/` runs no suite, so that a status update
 * never waits for tests. Any other file runs the suites that it can break.
 */
export const testScope = (files: string[]): TestScope => ({
  site: files.some((file) => !isData(file) && !isTui(file)),
  tui: files.some((file) => isTui(file) || isShared(file)),
});
