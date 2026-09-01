import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface SelectOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Non-selectable section label. */
  heading?: boolean;
  /** Colored glyph shown before the label. */
  marker?: { text: string; color?: string };
}

interface Props {
  options: readonly SelectOption[];
  /** Initially highlighted option. */
  value?: string;
  onSubmit: (id: string) => void;
  onCancel?: () => void;
  isActive?: boolean;
  /** Rows to show at once; longer lists scroll around the cursor. */
  maxVisible?: number;
}

const selectable = (options: readonly SelectOption[], index: number) => !options[index]?.heading;

/** Next selectable index in a direction, wrapping around. */
const step = (options: readonly SelectOption[], from: number, direction: 1 | -1) => {
  let i = from;
  for (let n = 0; n < options.length; n += 1) {
    i = (i + direction + options.length) % options.length;
    if (selectable(options, i)) return i;
  }
  return from;
};

/** Single-choice list. Up/Down move, Enter picks, Esc cancels. */
export const Select = ({ options, value, onSubmit, onCancel, isActive = true, maxVisible }: Props) => {
  const wanted = options.findIndex((o) => o.id === value);
  const [index, setIndex] = useState(wanted >= 0 && selectable(options, wanted) ? wanted : step(options, -1, 1));

  useInput(
    (_input, key) => {
      if (key.upArrow) setIndex((i) => step(options, i, -1));
      if (key.downArrow) setIndex((i) => step(options, i, 1));
      if (key.return && selectable(options, index) && !options[index].disabled) onSubmit(options[index].id);
      if (key.escape) onCancel?.();
    },
    { isActive },
  );

  const rows = maxVisible && maxVisible < options.length ? maxVisible : options.length;
  const first = Math.min(Math.max(0, index - Math.floor(rows / 2)), options.length - rows);
  const visible = options.slice(first, first + rows);
  const above = first;
  const below = options.length - first - rows;

  return (
    <Box flexDirection="column">
      {above > 0 ? <Text dimColor>{`  ↑ ${above} more`}</Text> : null}
      {visible.map((option, i) => {
        const focused = first + i === index;
        if (option.heading) {
          return (
            <Text key={option.id} bold dimColor wrap="truncate">
              {option.label}
            </Text>
          );
        }
        return (
          <Text key={option.id} wrap="truncate">
            <Text color={focused ? 'cyan' : undefined} dimColor={option.disabled}>
              {focused ? '› ' : '  '}
            </Text>
            {option.marker ? <Text color={option.marker.color}>{`${option.marker.text} `}</Text> : null}
            <Text color={focused ? 'cyan' : undefined} dimColor={option.disabled}>
              {option.label}
            </Text>
            {option.description ? <Text dimColor>{`  ${option.description}`}</Text> : null}
          </Text>
        );
      })}
      {below > 0 ? <Text dimColor>{`  ↓ ${below} more`}</Text> : null}
    </Box>
  );
};
