import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { DateTime } from 'luxon';
import { localZone, offsetLabel, utcToWall, wallToUtc, type WallClock } from '../lib/zoned.ts';

interface Props {
  /** ISO instant. */
  value: string;
  onChange?: (iso: string) => void;
  onSubmit: (iso: string) => void;
  onCancel?: () => void;
  isActive?: boolean;
}

type Area = 'header' | 'days' | 'time' | 'zone';
const AREAS: Area[] = ['header', 'days', 'time', 'zone'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const pad = (n: number) => String(n).padStart(2, '0');

const allZones = (): string[] => {
  const list = Intl.supportedValuesOf('timeZone');
  return list.includes('UTC') ? list : ['UTC', ...list];
};

/** Weeks of a month as day numbers, null for padding; weeks start on Monday. */
const monthGrid = (year: number, month: number): (number | null)[][] => {
  const first = DateTime.utc(year, month, 1);
  const lead = first.weekday - 1;
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: first.daysInMonth ?? 30 }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
};

/**
 * GUI-style picker: month calendar with a scrollable month/year header, a
 * time field, and a searchable time zone dropdown. Tab moves between areas,
 * Enter confirms, Esc cancels. The composed UTC instant is shown underneath.
 */
export const DateInput = ({ value, onChange, onSubmit, onCancel, isActive = true }: Props) => {
  const [zone, setZone] = useState(localZone());
  const [wall, setWall] = useState<WallClock>(() => utcToWall(new Date(value), localZone()));
  const [area, setArea] = useState<Area>('days');
  const [timePart, setTimePart] = useState<'hour' | 'minute'>('hour');
  const [typed, setTyped] = useState('');
  const [dropdown, setDropdown] = useState<{ filter: string; index: number } | null>(null);

  const instant = wallToUtc(wall, zone);
  const iso = instant.toISOString();
  const zones = allZones();
  const matches = dropdown ? zones.filter((z) => z.toLowerCase().includes(dropdown.filter.toLowerCase())) : [];

  const update = (next: Partial<WallClock>) => {
    const merged = { ...wall, ...next };
    const days = DateTime.utc(merged.year, merged.month).daysInMonth ?? 31;
    const clamped: WallClock = {
      year: Math.min(9999, Math.max(1970, merged.year)),
      month: Math.min(12, Math.max(1, merged.month)),
      day: Math.min(days, Math.max(1, merged.day)),
      hour: Math.min(23, Math.max(0, merged.hour)),
      minute: Math.min(59, Math.max(0, merged.minute)),
    };
    setWall(clamped);
    onChange?.(wallToUtc(clamped, zone).toISOString());
  };

  const shiftMonth = (delta: number) => {
    const dt = DateTime.utc(wall.year, wall.month, 1).plus({ months: delta });
    update({ year: dt.year, month: dt.month });
  };

  const moveDay = (delta: number) => {
    const dt = DateTime.utc(wall.year, wall.month, wall.day).plus({ days: delta });
    update({ year: dt.year, month: dt.month, day: dt.day });
  };

  const pickZone = (next: string) => {
    // Keep the same instant; re-express it in the new zone.
    setZone(next);
    setWall(utcToWall(instant, next));
    setDropdown(null);
    // Return focus to the calendar so Enter confirms instead of reopening the list.
    setArea('days');
  };

  useInput(
    (input, key) => {
      if (dropdown) {
        if (key.escape) setDropdown(null);
        else if (key.return && matches[dropdown.index]) pickZone(matches[dropdown.index]);
        else if (key.downArrow) setDropdown({ ...dropdown, index: Math.min(matches.length - 1, dropdown.index + 1) });
        else if (key.upArrow) setDropdown({ ...dropdown, index: Math.max(0, dropdown.index - 1) });
        else if (key.backspace || key.delete) setDropdown({ filter: dropdown.filter.slice(0, -1), index: 0 });
        else if (input && !key.ctrl && !key.meta && !key.tab) setDropdown({ filter: dropdown.filter + input, index: 0 });
        return;
      }
      if (key.return || (area === 'zone' && input === ' ')) {
        if (area === 'zone') setDropdown({ filter: '', index: Math.max(0, zones.indexOf(zone)) });
        else onSubmit(iso);
        return;
      }
      if (key.escape) {
        onCancel?.();
        return;
      }
      if (key.tab) {
        const i = AREAS.indexOf(area);
        setArea(AREAS[(i + (key.shift ? -1 : 1) + AREAS.length) % AREAS.length]);
        setTyped('');
        return;
      }
      if (input === 't') {
        const now = utcToWall(new Date(), zone);
        update(now);
        return;
      }
      switch (area) {
        case 'header':
          if (key.leftArrow) shiftMonth(-1);
          if (key.rightArrow) shiftMonth(1);
          if (key.upArrow) update({ year: wall.year + 1 });
          if (key.downArrow) setArea('days');
          if (key.pageUp) update({ year: wall.year - 1 });
          if (key.pageDown) update({ year: wall.year + 1 });
          break;
        case 'days':
          if (key.leftArrow) moveDay(-1);
          if (key.rightArrow) moveDay(1);
          if (key.upArrow) {
            if (wall.day <= 7) setArea('header');
            else moveDay(-7);
          }
          if (key.downArrow) {
            const days = DateTime.utc(wall.year, wall.month).daysInMonth ?? 31;
            if (wall.day + 7 > days) setArea('time');
            else moveDay(7);
          }
          if (key.pageUp) shiftMonth(-1);
          if (key.pageDown) shiftMonth(1);
          break;
        case 'time':
          if (key.leftArrow || key.rightArrow) {
            setTimePart(timePart === 'hour' ? 'minute' : 'hour');
            setTyped('');
          }
          if (key.upArrow) update({ [timePart]: wall[timePart] + 1 });
          if (key.downArrow) update({ [timePart]: wall[timePart] - 1 });
          if (/^\d$/.test(input)) {
            const next = (typed + input).slice(-2);
            setTyped(next);
            update({ [timePart]: Number(next) });
            if (next.length === 2 && timePart === 'hour') {
              setTimePart('minute');
              setTyped('');
            }
          }
          break;
        case 'zone':
          if (key.upArrow || key.downArrow) {
            const i = zones.indexOf(zone);
            pickZone(zones[(i + (key.downArrow ? 1 : -1) + zones.length) % zones.length]);
          }
          break;
      }
    },
    { isActive },
  );

  const monthName = DateTime.utc(wall.year, wall.month).toFormat('LLLL yyyy');
  const grid = monthGrid(wall.year, wall.month);
  const today = utcToWall(new Date(), zone);
  const focus = (name: Area) => area === name && !dropdown;

  return (
    <Box flexDirection="column">
      <Text>
        <Text color={focus('header') ? 'cyan' : undefined} bold={focus('header')}>
          {focus('header') ? '‹ ' : '  '}
          {monthName.padStart(14).padEnd(16)}
          {focus('header') ? ' ›' : '  '}
        </Text>
      </Text>
      <Text dimColor>{`  ${WEEKDAYS.join(' ')}`}</Text>
      {grid.map((week, w) => (
        <Text key={w}>
          {'  '}
          {week.map((day, d) => {
            const selected = day === wall.day;
            const isToday = day === today.day && wall.month === today.month && wall.year === today.year;
            const text = day === null ? '  ' : pad(day);
            return (
              <React.Fragment key={d}>
                <Text inverse={selected && focus('days')} color={selected ? 'cyan' : isToday ? 'yellow' : undefined} bold={selected}>
                  {text}
                </Text>
                {d < 6 ? ' ' : ''}
              </React.Fragment>
            );
          })}
        </Text>
      ))}
      <Text>
        {'  '}
        <Text bold={focus('time')} color={focus('time') ? 'cyan' : undefined}>Time </Text>
        <Text inverse={focus('time') && timePart === 'hour'}>{pad(wall.hour)}</Text>:
        <Text inverse={focus('time') && timePart === 'minute'}>{pad(wall.minute)}</Text>
      </Text>
      <Text>
        {'  '}
        <Text bold={focus('zone')} color={focus('zone') ? 'cyan' : undefined}>Zone </Text>
        <Text inverse={focus('zone')}>{`${zone} (${offsetLabel(instant, zone)}) ▾`}</Text>
      </Text>
      {dropdown ? (
        <Box flexDirection="column" marginLeft={2} borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text>
            Search: <Text inverse>{dropdown.filter || ' '}</Text>
            <Text dimColor>{`  ${matches.length} zones`}</Text>
          </Text>
          {matches.slice(Math.max(0, dropdown.index - 3), Math.max(0, dropdown.index - 3) + 7).map((z, i) => {
            const absolute = Math.max(0, dropdown.index - 3) + i;
            return (
              <Text key={z} color={absolute === dropdown.index ? 'cyan' : undefined}>
                {absolute === dropdown.index ? '› ' : '  '}
                {z}
              </Text>
            );
          })}
        </Box>
      ) : null}
      <Text dimColor>{`  → ${iso}`}</Text>
      <Text dimColor>
        {dropdown
          ? '  type to search  ↑↓ move  Enter pick  Esc close'
          : area === 'header'
            ? '  ←→ month  ↑ year  ↓ days  Tab next  t today  Enter confirm'
            : area === 'days'
              ? '  ←→↑↓ day  PgUp PgDn month  Tab next  t today  Enter confirm'
              : area === 'time'
                ? '  ←→ hour/minute  ↑↓ adjust  digits type  Tab next  Enter confirm'
                : '  Enter or Space open list  ↑↓ next zone  Tab next'}
      </Text>
    </Box>
  );
};
