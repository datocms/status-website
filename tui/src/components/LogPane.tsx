import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  title: string;
  text: string;
  height: number;
}

/** Bordered pane that shows the last rows of streamed process output. */
export const LogPane = ({ title, text, height }: Props) => {
  const lines = text.replace(/\r/g, '\n').split('\n').filter((l, i, all) => l.length > 0 || i === all.length - 1);
  const rows = Math.max(1, height - 1);
  const visible = lines.slice(-rows);
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1} flexGrow={1} overflow="hidden">
      <Text bold>{title}</Text>
      {visible.map((line, i) => (
        <Text key={i} wrap="truncate" dimColor>
          {line || ' '}
        </Text>
      ))}
    </Box>
  );
};
