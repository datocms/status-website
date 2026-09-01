import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatUtc, nextFullHour, parseUtcInput, relativeAge, utcDateStamp } from '../src/lib/dates.ts';

test('parseUtcInput reads short form as UTC', () => {
  const date = parseUtcInput('2026-09-01 21:27');
  assert.equal(date?.toISOString(), '2026-09-01T21:27:00.000Z');
});

test('parseUtcInput reads short form with seconds and T separator', () => {
  assert.equal(parseUtcInput('2026-09-01T05:30:15')?.toISOString(), '2026-09-01T05:30:15.000Z');
});

test('parseUtcInput reads full ISO with Z and with offset', () => {
  assert.equal(parseUtcInput('2026-09-01T21:27:49.000Z')?.toISOString(), '2026-09-01T21:27:49.000Z');
  assert.equal(parseUtcInput('2026-09-01T23:27:00+02:00')?.toISOString(), '2026-09-01T21:27:00.000Z');
});

test('parseUtcInput rejects garbage and impossible dates', () => {
  assert.equal(parseUtcInput('tomorrow'), null);
  assert.equal(parseUtcInput(''), null);
  assert.equal(parseUtcInput('2026-13-01 10:00'), null);
});

test('formatUtc and utcDateStamp use UTC fields', () => {
  const date = new Date('2026-09-01T23:59:00.000Z');
  assert.equal(formatUtc(date), '2026-09-01 23:59 UTC');
  assert.equal(utcDateStamp(date), '2026-09-01');
});

test('nextFullHour rounds up to the next hour', () => {
  assert.equal(nextFullHour(new Date('2026-09-01T21:27:49.000Z')).toISOString(), '2026-09-01T22:00:00.000Z');
  assert.equal(nextFullHour(new Date('2026-09-01T23:00:00.000Z')).toISOString(), '2026-09-02T00:00:00.000Z');
});

test('relativeAge picks the right unit and direction', () => {
  const now = new Date('2026-09-01T12:00:00.000Z');
  assert.equal(relativeAge(new Date('2026-09-01T11:45:00.000Z'), now), '15m ago');
  assert.equal(relativeAge(new Date('2026-09-01T09:00:00.000Z'), now), '3h ago');
  assert.equal(relativeAge(new Date('2026-08-25T12:00:00.000Z'), now), '7d ago');
  assert.equal(relativeAge(new Date('2026-09-06T12:00:00.000Z'), now), 'in 5d');
});
