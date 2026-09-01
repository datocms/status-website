import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  title: string;
  json: string;
  /** Visible rows inside the border. */
  height: number;
  /** Show the end of the document instead of the start. */
  tail?: boolean;
}

/** Bordered pane showing a JSON document, clipped to the available rows. */
export const JsonPane = ({ title, json, height, tail = false }: Props) => {
  const lines = json.split('\n');
  const rows = Math.max(1, height - 1);
  const hidden = Math.max(0, lines.length - rows);
  const visible = tail ? lines.slice(hidden) : lines.slice(0, rows);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1} flexGrow={1} overflow="hidden">
      <Text bold>{title}</Text>
      {hidden > 0 && tail ? <Text dimColor>{`… ${hidden} lines above`}</Text> : null}
      {visible.map((line, i) => (
        <Text key={i} wrap="truncate">
          {line || ' '}
        </Text>
      ))}
      {hidden > 0 && !tail ? <Text dimColor>{`… ${hidden} more lines`}</Text> : null}
    </Box>
  );
};
