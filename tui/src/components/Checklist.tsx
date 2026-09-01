import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { SelectOption } from './Select.tsx';

interface Props {
  options: readonly SelectOption[];
  value: string[];
  onSubmit: (ids: string[]) => void;
  onCancel?: () => void;
  isActive?: boolean;
}

/** Multi-choice list. Up/Down move, Space toggles, Enter confirms, Esc cancels. */
export const Checklist = ({ options, value, onSubmit, onCancel, isActive = true }: Props) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set(value));

  useInput(
    (input, key) => {
      if (key.upArrow) setIndex((i) => (i - 1 + options.length) % options.length);
      if (key.downArrow) setIndex((i) => (i + 1) % options.length);
      if (input === ' ') {
        const id = options[index].id;
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
      if (key.return) onSubmit(options.filter((o) => selected.has(o.id)).map((o) => o.id));
      if (key.escape) onCancel?.();
    },
    { isActive },
  );

  return (
    <Box flexDirection="column">
      {options.map((option, i) => {
        const focused = i === index;
        return (
          <Text key={option.id} wrap="truncate">
            <Text color={focused ? 'cyan' : undefined}>
              {focused ? '› ' : '  '}
              {selected.has(option.id) ? '[x] ' : '[ ] '}
              {option.label}
            </Text>
            {option.description ? <Text dimColor>{`  ${option.description}`}</Text> : null}
          </Text>
        );
      })}
    </Box>
  );
};
