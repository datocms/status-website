import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { DiffRow } from '../lib/history.ts';

interface Props {
  rows: DiffRow[];
  leftTitle: string;
  rightTitle: string;
  /** Visible rows inside the panes. */
  height: number;
  /** Total width available for both columns. */
  width: number;
  initialRow?: number;
  isActive?: boolean;
}

const COLOR: Record<DiffRow['kind'], string | undefined> = { same: undefined, removed: 'red', added: 'green', changed: 'yellow' };
const GUTTER: Record<DiffRow['kind'], string> = { same: ' ', removed: '-', added: '+', changed: '~' };

/** Two columns, line-aligned, scrolled with Up/Down and PageUp/PageDown. */
export const DiffPane = ({ rows, leftTitle, rightTitle, height, width, initialRow = 0, isActive = true }: Props) => {
  const visibleRows = Math.max(1, height - 1);
  const maxTop = Math.max(0, rows.length - visibleRows);
  const [top, setTop] = useState(Math.min(maxTop, Math.max(0, initialRow - 2)));

  useInput(
    (_input, key) => {
      if (key.downArrow) setTop((t) => Math.min(maxTop, t + 1));
      if (key.upArrow) setTop((t) => Math.max(0, t - 1));
      if (key.pageDown) setTop((t) => Math.min(maxTop, t + visibleRows));
      if (key.pageUp) setTop((t) => Math.max(0, t - visibleRows));
    },
    { isActive },
  );

  const column = Math.max(10, Math.floor((width - 3) / 2));
  const cell = (text: string | null) => (text ?? '').slice(0, column).padEnd(column);
  const slice = rows.slice(top, top + visibleRows);

  return (
    <Box flexDirection="column">
      <Text bold>
        {cell(leftTitle)} │ {cell(rightTitle)}
      </Text>
      {slice.map((row, i) => (
        <Text key={top + i} color={COLOR[row.kind]} dimColor={row.kind === 'same'}>
          {GUTTER[row.kind]}
          {cell(row.left)}│{cell(row.right)}
        </Text>
      ))}
      {rows.length > visibleRows ? (
        <Text dimColor>{`rows ${top + 1}-${Math.min(rows.length, top + visibleRows)} of ${rows.length}  ↑↓ PgUp PgDn scroll`}</Text>
      ) : null}
    </Box>
  );
};
