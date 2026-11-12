import { describe, expect, it } from 'vitest';
import { heroHeadline } from '../src/lib/heroHeadline';
import type { Incident } from '../src/lib/incidents';

const incident = (isMaintenance = false) => ({ isMaintenance }) as Incident;

describe('heroHeadline', () => {
  it('says that all systems are operational, with a happy face, when nothing is open', () => {
    expect(heroHeadline([], [])).toEqual({
      headline: 'All systems operational.',
      muted: 'No open incidents.',
      face: 'happy',
    });
  });

  it('tells about a scheduled maintenance, and keeps the happy face', () => {
    expect(heroHeadline([], [incident(true)])).toEqual({
      headline: 'All systems operational.',
      muted: 'Maintenance is scheduled: details are below.',
      face: 'happy',
    });
  });

  it('says that we work on one open incident, with no face', () => {
    expect(heroHeadline([incident()], [])).toEqual({
      headline: 'We are working on an incident.',
      muted: 'Updates are below.',
    });
  });

  it('writes the number of open incidents in words up to nine', () => {
    expect(heroHeadline([incident(), incident()], []).headline).toBe('We are working on two incidents.');
    expect(heroHeadline(Array.from({ length: 12 }, () => incident()), []).headline).toBe(
      'We are working on 12 incidents.',
    );
  });

  it('puts an incident before a maintenance in progress', () => {
    expect(heroHeadline([incident(true), incident()], []).headline).toBe('We are working on an incident.');
  });

  it('says that a maintenance is in progress, with no face', () => {
    expect(heroHeadline([incident(true)], [])).toEqual({
      headline: 'Maintenance is in progress.',
      muted: 'Updates are below.',
    });
  });
});
