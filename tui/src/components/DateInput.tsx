import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { DateTime } from 'luxon';
import { defaultHour12, localZone, offsetLabel, searchZones, utcToWall, wallToUtc, type WallClock } from '../lib/zoned.ts';

interface Props {
  /** ISO instant. */
  value: string;
  onChange?: (iso: string) => void;
  onSubmit: (iso: string) => void;
  onCancel?: () => void;
  isActive?: boolean;
}

/** Focusable element with a position used for arrow-key navigation. */
interface Element {
  id: string;
  x: number;
  y: number;
}

type DropdownKind = 'year' | 'month' | 'hour' | 'minute' | 'zone';
type Dropdown = { kind: DropdownKind; filter: string; index: number };
const DROPDOWN_KINDS: string[] = ['year', 'month', 'hour', 'minute', 'zone'];

interface Choice {
  id: string;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = Array.from({ length: 12 }, (_, i) => DateTime.utc(2000, i + 1).toFormat('LLLL'));

/** Weeks of a month as day numbers, null for padding; weeks start on Monday. */
const monthGrid = (year: number, month: number): (number | null)[][] => {
  const first = DateTime.utc(year, month, 1);
  const lead = first.weekday - 1;
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: first.daysInMonth ?? 30 }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
};

/** Nearest element in a direction: same row first, then closest column. */
const move = (elements: Element[], from: Element, dx: number, dy: number): Element => {
  const candidates = elements.filter((e) => (dx !== 0 ? Math.sign(e.x - from.x) === dx : Math.sign(e.y - from.y) === dy));
  const score = (e: Element) => Math.abs(e.y - from.y) * 100 + Math.abs(e.x - from.x);
  return candidates.sort((a, b) => score(a) - score(b))[0] ?? from;
};

const to12 = (hour: number) => ({ hour: hour % 12 === 0 ? 12 : hour % 12, pm: hour >= 12 });
const from12 = (hour12: number, pm: boolean) => (hour12 % 12) + (pm ? 12 : 0);

/**
 * GUI-style picker. Arrows only move focus between elements; Enter acts on
 * the focused element (opens a dropdown, picks a day, toggles AM/PM or the
 * hour format). Typing on a dropdown element opens it with that text as the
 * filter. Done confirms, Esc cancels.
 */
export const DateInput = ({ value, onChange, onSubmit, onCancel, isActive = true }: Props) => {
  const [zone, setZone] = useState(localZone());
  const [wall, setWall] = useState<WallClock>(() => utcToWall(new Date(value), localZone()));
  const [hour12, setHour12] = useState(defaultHour12);
  const [focusId, setFocusId] = useState(() => `day-${utcToWall(new Date(value), localZone()).day}`);
  const [dropdown, setDropdown] = useState<Dropdown | null>(null);

  const instant = wallToUtc(wall, zone);
  const iso = instant.toISOString();
  const grid = monthGrid(wall.year, wall.month);
  const today = utcToWall(new Date(), zone);

  // Layout positions: calendar column x 0-6, time column x 10-12, zone x 20.
  const elements: Element[] = [
    { id: 'year', x: 0, y: 0 },
    { id: 'month', x: 3, y: 0 },
    ...grid.flatMap((week, w) => week.flatMap((day, d) => (day === null ? [] : [{ id: `day-${day}`, x: d, y: 1 + w }]))),
    { id: 'hour', x: 10, y: 0 },
    { id: 'minute', x: 11, y: 0 },
    ...(hour12 ? [{ id: 'ampm', x: 12, y: 0 }] : []),
    { id: 'mode', x: 10, y: 1 },
    { id: 'zone', x: 20, y: 0 },
    { id: 'done', x: 0, y: 1 + grid.length },
    { id: 'cancel', x: 3, y: 1 + grid.length },
  ];
  const focus = elements.find((e) => e.id === focusId) ?? elements.find((e) => e.id === `day-${wall.day}`) ?? elements[0];

  const update = (next: Partial<WallClock>) => {
    const merged = { ...wall, ...next };
    const days = DateTime.utc(merged.year, merged.month).daysInMonth ?? 31;
    const clamped: WallClock = { ...merged, day: Math.min(days, Math.max(1, merged.day)) };
    setWall(clamped);
    onChange?.(wallToUtc(clamped, zone).toISOString());
  };

  const choices = (kind: DropdownKind, filter: string): Choice[] => {
    const q = filter.toLowerCase();
    switch (kind) {
      case 'year':
        return Array.from({ length: 21 }, (_, i) => String(today.year - 10 + i)).filter((y) => y.includes(q)).map((y) => ({ id: y, label: y }));
      case 'month':
        return MONTHS.map((name, i) => ({ id: String(i + 1), label: `${pad(i + 1)} - ${name}` })).filter((c) => c.label.toLowerCase().includes(q));
      case 'hour':
        return (hour12 ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i))
          .map((h) => ({ id: String(h), label: pad(h) }))
          .filter((c) => c.label.includes(q));
      case 'minute':
        return Array.from({ length: 60 }, (_, i) => ({ id: String(i), label: pad(i) })).filter((c) => c.label.includes(q));
      case 'zone':
        return searchZones(filter).map((e) => ({
          id: e.zone,
          label: `${e.zone}${e.countries.length ? ` · ${e.countries.slice(0, 3).join(', ')}` : ''} · ${offsetLabel(instant, e.zone)}`,
        }));
    }
  };

  const currentChoice = (kind: DropdownKind) => {
    switch (kind) {
      case 'year':
        return String(wall.year);
      case 'month':
        return String(wall.month);
      case 'hour':
        return String(hour12 ? to12(wall.hour).hour : wall.hour);
      case 'minute':
        return String(wall.minute);
      case 'zone':
        return zone;
    }
  };

  const openDropdown = (kind: DropdownKind, filter = '') => {
    const list = choices(kind, filter);
    const index = Math.max(0, list.findIndex((c) => c.id === currentChoice(kind)));
    setDropdown({ kind, filter, index });
  };

  const pick = (kind: DropdownKind, id: string) => {
    switch (kind) {
      case 'year':
        update({ year: Number(id) });
        break;
      case 'month':
        update({ month: Number(id) });
        break;
      case 'hour':
        update({ hour: hour12 ? from12(Number(id), to12(wall.hour).pm) : Number(id) });
        break;
      case 'minute':
        update({ minute: Number(id) });
        break;
      case 'zone':
        // Keep the same instant; re-express it in the new zone.
        setZone(id);
        setWall(utcToWall(instant, id));
        break;
    }
    setDropdown(null);
  };

  const activate = () => {
    const id = focus.id;
    if (id.startsWith('day-')) update({ day: Number(id.slice(4)) });
    else if (id === 'ampm') update({ hour: from12(to12(wall.hour).hour, !to12(wall.hour).pm) });
    else if (id === 'mode') setHour12((h) => !h);
    else if (id === 'done') onSubmit(iso);
    else if (id === 'cancel') onCancel?.();
    else openDropdown(id as DropdownKind);
  };

  useInput(
    (input, key) => {
      if (dropdown) {
        const list = choices(dropdown.kind, dropdown.filter);
        if (key.escape) setDropdown(null);
        else if (key.return && list[dropdown.index]) pick(dropdown.kind, list[dropdown.index].id);
        else if (key.downArrow) setDropdown({ ...dropdown, index: Math.min(list.length - 1, dropdown.index + 1) });
        else if (key.upArrow) setDropdown({ ...dropdown, index: Math.max(0, dropdown.index - 1) });
        else if (key.backspace || key.delete) setDropdown({ ...dropdown, filter: dropdown.filter.slice(0, -1), index: 0 });
        else if (input && !key.ctrl && !key.meta && !key.tab) setDropdown({ ...dropdown, filter: dropdown.filter + input, index: 0 });
        return;
      }
      if (key.escape) onCancel?.();
      else if (key.return) activate();
      else if (key.leftArrow) setFocusId(move(elements, focus, -1, 0).id);
      else if (key.rightArrow) setFocusId(move(elements, focus, 1, 0).id);
      else if (key.upArrow) setFocusId(move(elements, focus, 0, -1).id);
      else if (key.downArrow) setFocusId(move(elements, focus, 0, 1).id);
      else if (key.tab) {
        const order = ['year', 'month', `day-${wall.day}`, 'hour', 'minute', ...(hour12 ? ['ampm'] : []), 'mode', 'zone', 'done', 'cancel'];
        const i = order.indexOf(focus.id.startsWith('day-') ? `day-${wall.day}` : focus.id);
        setFocusId(order[(i + (key.shift ? -1 : 1) + order.length) % order.length]);
      } else if (input === ' ' && (focus.id === 'ampm' || focus.id === 'mode')) activate();
      else if (input && !key.ctrl && !key.meta && DROPDOWN_KINDS.includes(focus.id)) openDropdown(focus.id as DropdownKind, input);
    },
    { isActive },
  );

  const isFocused = (id: string) => focus.id === id && !dropdown;
  const field = (id: string, text: string) => (
    <Text inverse={isFocused(id)} color={isFocused(id) ? 'cyan' : undefined}>
      [{text}]
    </Text>
  );
  const h = to12(wall.hour);
  const list = dropdown ? choices(dropdown.kind, dropdown.filter) : [];
  const windowStart = dropdown ? Math.max(0, Math.min(dropdown.index - 3, list.length - 7)) : 0;

  return (
    <Box flexDirection="column">
      <Box flexDirection="row">
        <Box flexDirection="column" width={26} flexShrink={0}>
          <Text>
            {field('year', String(wall.year))} {field('month', `${pad(wall.month)} - ${MONTHS[wall.month - 1]}`)}
          </Text>
          <Text dimColor>{' Mo Tu We Th Fr Sa Su'}</Text>
          {grid.map((week, w) => (
            <Text key={w}>
              {week.map((day, d) => {
                const id = `day-${day}`;
                const selected = day === wall.day;
                const isToday = day === today.day && wall.month === today.month && wall.year === today.year;
                return (
                  <React.Fragment key={d}>
                    {' '}
                    <Text inverse={day !== null && isFocused(id)} color={selected ? 'cyan' : isToday ? 'yellow' : undefined} bold={selected}>
                      {day === null ? '  ' : pad(day)}
                    </Text>
                  </React.Fragment>
                );
              })}
            </Text>
          ))}
        </Box>
        <Box flexDirection="column" width={22} flexShrink={0} paddingLeft={1}>
          <Text bold>Time</Text>
          <Text>
            {field('hour', pad(hour12 ? h.hour : wall.hour))}:{field('minute', pad(wall.minute))}
            {hour12 ? <Text> {field('ampm', h.pm ? 'PM' : 'AM')}</Text> : null}
          </Text>
          <Text>{field('mode', hour12 ? '12-hour' : '24-hour')}</Text>
        </Box>
        <Box flexDirection="column" paddingLeft={1} flexGrow={1}>
          <Text bold>Zone</Text>
          <Text wrap="truncate">{field('zone', `${zone} ${offsetLabel(instant, zone)}`)}</Text>
          <Text dimColor wrap="truncate">type a zone or country</Text>
        </Box>
      </Box>
      <Text>
        {field('done', ' Done ')} {field('cancel', ' Cancel ')}
        <Text dimColor>{`   → ${iso}`}</Text>
      </Text>
      {dropdown ? (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text>
            {dropdown.kind}: <Text inverse>{dropdown.filter || ' '}</Text>
            <Text dimColor>{`  ${list.length} matches · ↑↓ move · Enter pick · Esc close`}</Text>
          </Text>
          {list.slice(windowStart, windowStart + 7).map((c, i) => {
            const absolute = windowStart + i;
            return (
              <Text key={c.id} color={absolute === dropdown.index ? 'cyan' : undefined} wrap="truncate">
                {absolute === dropdown.index ? '› ' : '  '}
                {c.label}
              </Text>
            );
          })}
        </Box>
      ) : (
        <Text dimColor>{'  arrows move · Enter open/pick · type to search · Space toggle · Tab next'}</Text>
      )}
    </Box>
  );
};
