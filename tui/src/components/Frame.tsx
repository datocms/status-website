import React, { useEffect, useState, type ReactNode } from 'react';
import { Box, Text, useStdout } from 'ink';

export interface Hint {
  key: string;
  label: string;
}

interface Props {
  title: string;
  hints: Hint[];
  /** One-line status or error shown above the hints. */
  message?: { text: string; tone: 'info' | 'error' | 'success' } | null;
  children: ReactNode;
}

/** Terminal size, updated on resize. */
export const useTerminalSize = () => {
  const { stdout } = useStdout();
  const read = () => ({ columns: stdout.columns || 80, rows: stdout.rows || 24 });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const onResize = () => setSize(read());
    stdout.on('resize', onResize);
    return () => {
      stdout.off('resize', onResize);
    };
  }, [stdout]);
  return size;
};

const TONE_COLOR = { info: 'yellow', error: 'red', success: 'green' } as const;

/** Full-screen chrome: title bar, body, message line, key hints. */
export const Frame = ({ title, hints, message, children }: Props) => {
  const { columns, rows } = useTerminalSize();
  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box paddingX={1}>
        <Text bold inverse>{` DatoCMS status `}</Text>
        <Text bold>{`  ${title}`}</Text>
      </Box>
      <Box flexGrow={1} flexDirection="column" paddingX={1} overflow="hidden">
        {children}
      </Box>
      <Box paddingX={1} height={1}>
        {message ? <Text color={TONE_COLOR[message.tone]} wrap="truncate">{message.text}</Text> : <Text> </Text>}
      </Box>
      <Box paddingX={1} height={1}>
        <Text dimColor wrap="truncate">
          {hints.map((h) => `${h.key} ${h.label}`).join('   ')}
        </Text>
      </Box>
    </Box>
  );
};

/** Rows available to the body for a frame with the given terminal rows. */
export const bodyRows = (rows: number) => Math.max(5, rows - 3);
