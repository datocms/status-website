import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface SelectOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface Props {
  options: readonly SelectOption[];
  /** Initially highlighted option. */
  value?: string;
  onSubmit: (id: string) => void;
  onCancel?: () => void;
  isActive?: boolean;
}

/** Single-choice list. Up/Down move, Enter picks, Esc cancels. */
export const Select = ({ options, value, onSubmit, onCancel, isActive = true }: Props) => {
  const initial = Math.max(0, options.findIndex((o) => o.id === value));
  const [index, setIndex] = useState(initial);

  useInput(
    (_input, key) => {
      if (key.upArrow) setIndex((i) => (i - 1 + options.length) % options.length);
      if (key.downArrow) setIndex((i) => (i + 1) % options.length);
      if (key.return && !options[index].disabled) onSubmit(options[index].id);
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
            <Text color={focused ? 'cyan' : undefined} dimColor={option.disabled}>
              {focused ? '› ' : '  '}
              {option.label}
            </Text>
            {option.description ? <Text dimColor>{`  ${option.description}`}</Text> : null}
          </Text>
        );
      })}
    </Box>
  );
};
