import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { clampWall, localZone, offsetLabel, utcToWall, wallToUtc, zoneChoices, type WallClock } from '../lib/zoned.ts';

interface Props {
  /** ISO instant. */
  value: string;
  onChange?: (iso: string) => void;
  onSubmit: (iso: string) => void;
  onCancel?: () => void;
  isActive?: boolean;
}

type Segment = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'zone';
const SEGMENTS: Segment[] = ['year', 'month', 'day', 'hour', 'minute', 'zone'];
const DIGITS: Record<Exclude<Segment, 'zone'>, number> = { year: 4, month: 2, day: 2, hour: 2, minute: 2 };

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/**
 * Date-time picker. Left/Right pick a part, Up/Down adjust it, digits type
 * into it, `n` resets to now, Enter confirms, Esc cancels. The instant is
 * composed from the wall clock in the chosen zone and shown as UTC below.
 */
export const DateInput = ({ value, onChange, onSubmit, onCancel, isActive = true }: Props) => {
  const zones = zoneChoices();
  const [zoneIndex, setZoneIndex] = useState(Math.max(0, zones.indexOf(localZone())));
  const zone = zones[zoneIndex];
  const [wall, setWall] = useState<WallClock>(() => utcToWall(new Date(value), zone));
  const [segment, setSegment] = useState<Segment>('hour');
  const [typed, setTyped] = useState('');

  const instant = wallToUtc(wall, zone);
  const iso = instant.toISOString();

  const update = (next: WallClock) => {
    const clamped = clampWall(next);
    setWall(clamped);
    onChange?.(wallToUtc(clamped, zone).toISOString());
  };

  const changeZone = (nextIndex: number) => {
    // Keep the same instant; re-express it in the new zone.
    const index = (nextIndex + zones.length) % zones.length;
    setZoneIndex(index);
    setWall(utcToWall(instant, zones[index]));
  };

  useInput(
    (input, key) => {
      if (key.return) {
        onSubmit(iso);
        return;
      }
      if (key.escape) {
        onCancel?.();
        return;
      }
      if (key.leftArrow || key.rightArrow) {
        const i = SEGMENTS.indexOf(segment);
        setSegment(SEGMENTS[(i + (key.rightArrow ? 1 : -1) + SEGMENTS.length) % SEGMENTS.length]);
        setTyped('');
        return;
      }
      if (key.upArrow || key.downArrow) {
        const delta = key.upArrow ? 1 : -1;
        if (segment === 'zone') changeZone(zoneIndex + delta);
        else update({ ...wall, [segment]: wall[segment] + delta });
        setTyped('');
        return;
      }
      if (input === 'n') {
        update(utcToWall(new Date(), zone));
        setTyped('');
        return;
      }
      if (segment !== 'zone' && /^\d$/.test(input)) {
        const next = (typed + input).slice(-DIGITS[segment]);
        setTyped(next);
        update({ ...wall, [segment]: Number(next) });
        if (next.length === DIGITS[segment]) {
          setSegment(SEGMENTS[SEGMENTS.indexOf(segment) + 1]);
          setTyped('');
        }
      }
    },
    { isActive },
  );

  const part = (name: Segment, text: string) => (
    <Text inverse={segment === name} color={segment === name ? 'cyan' : undefined}>
      {text}
    </Text>
  );

  return (
    <Box flexDirection="column">
      <Text>
        {part('year', pad(wall.year, 4))}-{part('month', pad(wall.month))}-{part('day', pad(wall.day))} {part('hour', pad(wall.hour))}:
        {part('minute', pad(wall.minute))}  {part('zone', `${zone} (${offsetLabel(instant, zone)})`)}
      </Text>
      <Text dimColor>{`→ ${iso}   ←→ part  ↑↓ adjust  digits type  n now`}</Text>
    </Box>
  );
};
