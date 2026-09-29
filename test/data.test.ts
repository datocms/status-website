import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseInstant } from '../src/lib/time';

/**
 * The files in data/ are the content of the live site. A commit that changes
 * only data/ runs no test, so this test runs with the next change of code.
 */
const files = ['incidents', 'maintenances'].flatMap((kind) =>
  readdirSync(join('data', kind))
    .filter((name) => name.endsWith('.json'))
    .map((name) => join('data', kind, name)),
);

describe('dates in data/', () => {
  it('finds the files', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('are instants in UTC, written with Z', () => {
    const others: string[] = [];

    for (const file of files) {
      const { updates = [], scheduledTime } = JSON.parse(readFileSync(file, 'utf8'));
      const dates: string[] = [...updates.map((update: { date: string }) => update.date), ...(scheduledTime ? [scheduledTime] : [])];

      for (const date of dates) {
        const isUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(date);
        if (!isUtc || Number.isNaN(parseInstant(date).getTime())) others.push(`${file}: ${date}`);
      }
    }

    expect(others).toEqual([]);
  });
});
