import { describe, expect, it } from 'vitest';
import { testScope } from '../scripts/testScope.ts';

describe('testScope', () => {
  it('runs nothing for a status update', () => {
    expect(
      testScope([
        'data/incidents/2026-09-27-issues-sending-emails-to-customers.json',
        'data/maintenances/2026-09-19-scheduled-database-maintenance.json',
      ]),
    ).toEqual({ site: false, tui: false });
  });

  it('runs nothing for a data file with a non-ASCII name', () => {
    expect(
      testScope([
        'data/incidents/2026-01-13-daily-usage-metrics-not-recorded-for-january-7–12.json',
      ]),
    ).toEqual({ site: false, tui: false });
  });

  it('runs nothing when no file is staged', () => {
    expect(testScope([])).toEqual({ site: false, tui: false });
  });

  it('runs the website suites for website code', () => {
    expect(testScope(['src/pages/api/feeds.ts'])).toEqual({ site: true, tui: false });
    expect(testScope(['astro.config.mjs'])).toEqual({ site: true, tui: false });
    expect(testScope(['e2e/home.spec.ts'])).toEqual({ site: true, tui: false });
  });

  it('runs the TUI suite for TUI code', () => {
    expect(testScope(['tui/src/lib/verify.ts'])).toEqual({ site: false, tui: true });
  });

  it('runs both for files that both depend on', () => {
    for (const file of ['src/lib/schema.ts', 'package.json', 'package-lock.json', '.husky/pre-commit', 'scripts/preCommit.ts']) {
      expect(testScope([file]), file).toEqual({ site: true, tui: true });
    }
  });

  it('runs the suites when data changes together with code', () => {
    expect(
      testScope(['data/incidents/x.json', 'src/lib/incidents.ts']),
    ).toEqual({ site: true, tui: false });
  });

  it('does not take a look-alike path for data', () => {
    expect(testScope(['src/data/x.ts'])).toEqual({ site: true, tui: false });
    expect(testScope(['database.ts'])).toEqual({ site: true, tui: false });
  });
});
