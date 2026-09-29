import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { applyKey } from '../lib/textEdit.ts';

interface Props {
  value: string;
  onChange?: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  /** Validation error shown under the field; Enter is refused while set. */
  error?: string | null;
  isActive?: boolean;
}

/** Single-line editor. Enter submits, Esc cancels. */
export const LineInput = ({ value, onChange, onSubmit, onCancel, error, isActive = true }: Props) => {
  const [state, setState] = useState({ value, cursor: value.length });

  useInput(
    (input, key) => {
      if (key.return) {
        if (!error) onSubmit(state.value);
        return;
      }
      if (key.escape) {
        onCancel?.();
        return;
      }
      if (key.tab) return;
      const next = applyKey(state, input, key, false);
      if (next !== state) {
        setState(next);
        onChange?.(next.value);
      }
    },
    { isActive },
  );

  const before = state.value.slice(0, state.cursor);
  const at = state.value.slice(state.cursor, state.cursor + 1) || ' ';
  const after = state.value.slice(state.cursor + 1);

  return (
    <Box flexDirection="column">
      <Text>
        {before}
        <Text inverse>{at}</Text>
        {after}
      </Text>
      {error ? <Text color="red">{error}</Text> : null}
    </Box>
  );
};
