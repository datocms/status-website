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

/**
 * The rules of README "Titles" that a script can check. Sentence case for
 * names is not checked: only the small words in Title Case are.
 */
describe('titles in data/', () => {
  const rules: [string, RegExp][] = [
    ['an emoji', /\p{Extended_Pictographic}/u],
    ['a square bracket', /[[\]]/],
    ['a word in capitals', /\b[A-Z]{5,}\b/],
    ['a date', /\d{4}-\d{2}-\d{2}|\b(19|20)\d{2}\b/],
    ['a word for the impact', /^(Major|Minor|Critical)\b/],
    ['"Incident report"', /incident report/i],
    ['a full stop at the end', /\.$/],
    ['a slash', /\//],
    ['code', /`/],
    ['"Retrospective" other than "Retrospective: " at the start', /(?<!^)retrospective|^Retrospective(?!: )/i],
    ['a small word in Title Case', /\s(Of|And|From|The|In|On|To|With|For)\s/],
  ];

  for (const [problem, pattern] of rules) {
    it(`do not have ${problem}`, () => {
      const bad = files
        .map((file) => `${file}: ${JSON.parse(readFileSync(file, 'utf8')).name}`)
        .filter((line) => pattern.test(line.slice(line.indexOf(': ') + 2)));

      expect(bad).toEqual([]);
    });
  }
});
