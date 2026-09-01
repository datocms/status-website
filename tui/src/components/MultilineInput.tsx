import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { applyKey, cursorPosition, type EditState } from '../lib/textEdit.ts';

interface Props {
  value: string;
  onChange?: (value: string) => void;
  /** Called on Esc with the current text. */
  onSubmit: (value: string) => void;
  /** Visible rows; the view scrolls to keep the cursor in sight. */
  height: number;
  isActive?: boolean;
}

/** Multi-line editor. Enter inserts a newline, arrows move, Esc finishes. */
export const MultilineInput = ({ value, onChange, onSubmit, height, isActive = true }: Props) => {
  const [state, setState] = useState<EditState>({ value, cursor: value.length });
  const [top, setTop] = useState(0);

  // External replacement (for example an accepted Claude result) resets the editor.
  useEffect(() => {
    setState((s) => (s.value === value ? s : { value, cursor: value.length }));
  }, [value]);

  useInput(
    (input, key) => {
      if (key.escape) {
        onSubmit(state.value);
        return;
      }
      if (key.tab) return;
      const next = applyKey(state, input, key, true);
      if (next !== state) {
        setState(next);
        onChange?.(next.value);
      }
    },
    { isActive },
  );

  const { row, column, lines } = cursorPosition(state);
  const rows = Math.max(1, height);
  const firstRow = row < top ? row : row >= top + rows ? row - rows + 1 : top;
  if (firstRow !== top) setTop(firstRow);

  const visible = lines.slice(firstRow, firstRow + rows);

  return (
    <Box flexDirection="column">
      {visible.map((line, i) => {
        const absolute = firstRow + i;
        if (absolute !== row) {
          return <Text key={absolute}>{line || ' '}</Text>;
        }
        return (
          <Text key={absolute}>
            {line.slice(0, column)}
            <Text inverse>{line.slice(column, column + 1) || ' '}</Text>
            {line.slice(column + 1)}
          </Text>
        );
      })}
      {lines.length > firstRow + rows ? <Text dimColor>{`… ${lines.length - firstRow - rows} more lines`}</Text> : null}
    </Box>
  );
};
