import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { Frame, bodyRows, useTerminalSize } from '../components/Frame.tsx';
import { Select, type SelectOption } from '../components/Select.tsx';
import { relativeAge } from '../lib/dates.ts';
import type { OpenItem } from '../lib/files.ts';
import type { Flow } from '../lib/git.ts';

interface Props {
  /** Every incident and maintenance, newest first. */
  items: OpenItem[];
  onChoose: (flow: Flow, item?: OpenItem) => void;
  onHistory: (item: OpenItem) => void;
  onQuit: () => void;
}

const RECENT_CLOSED = 5;

const describe = (item: OpenItem) =>
  `${item.kind === 'maintenance' ? 'Maintenance' : 'Incident'} · ${item.status} · ${relativeAge(item.date)}`;

const KIND_COLOR = { incident: 'yellow', maintenance: 'blue' } as const;

const itemOption = (item: OpenItem): SelectOption => ({
  id: item.path,
  label: item.name,
  description: describe(item),
  marker: { text: item.isOpen ? '●' : '○', color: KIND_COLOR[item.kind] },
});

const Legend = () => (
  <Text dimColor>
    <Text color="yellow">●</Text> incident   <Text color="blue">●</Text> maintenance   ● open   ○ closed
  </Text>
);

type View = { name: 'menu' } | { name: 'browse' } | { name: 'item'; item: OpenItem };

/** First screen: pick an action, or an item and then what to do with it. */
export const Home = ({ items, onChoose, onHistory, onQuit }: Props) => {
  const [view, setView] = useState<View>({ name: 'menu' });
  const [cursor, setCursor] = useState<string | undefined>();
  const { rows } = useTerminalSize();
  const open = items.filter((i) => i.isOpen);
  const closed = items.filter((i) => !i.isOpen);
  const recentClosed = closed.slice(0, RECENT_CLOSED);
  const moreClosed = closed.length - recentClosed.length;

  const pick = (id: string) => {
    if (id === 'new-incident' || id === 'new-maintenance') onChoose(id);
    else if (id === 'quit') onQuit();
    else if (id === 'browse') setView({ name: 'browse' });
    else {
      const item = items.find((i) => i.path === id);
      if (item) {
        setCursor(id);
        setView({ name: 'item', item });
      }
    }
  };

  const menu: SelectOption[] = [
    { id: 'new-incident', label: 'New incident', description: 'Something is broken right now' },
    { id: 'new-maintenance', label: 'New maintenance', description: 'Announce a planned window' },
    { id: 'sp-open', label: ' ', heading: true },
    { id: 'h-open', label: open.length ? 'Open items' : 'No open items', heading: true },
    ...open.map(itemOption),
    { id: 'sp-closed', label: ' ', heading: true },
    { id: 'h-closed', label: 'Recently closed', heading: true },
    ...recentClosed.map(itemOption),
    ...(moreClosed > 0
      ? [{ id: 'browse', label: `…and ${moreClosed} more closed ${moreClosed === 1 ? 'item' : 'items'} in data/`, description: 'browse' }]
      : []),
    { id: 'h-end', label: ' ', heading: true },
    { id: 'quit', label: 'Quit' },
  ];

  if (view.name === 'item') {
    const { item } = view;
    const back: View = recentClosed.includes(item) || item.isOpen ? { name: 'menu' } : { name: 'browse' };
    return (
      <Frame title={item.name} hints={[{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }, { key: 'Esc', label: 'back' }]}>
        <Box flexDirection="column">
          <Text dimColor>{describe(item)}</Text>
          <Box marginTop={1}>
            <Select
              options={[
                { id: 'update', label: 'Add an update', description: item.isOpen ? 'Post a status update' : 'Post-mortem or follow-up' },
                ...(item.isOpen ? [{ id: 'resolve', label: item.kind === 'maintenance' ? 'Complete' : 'Resolve', description: 'Close it out' }] : []),
                { id: 'history', label: 'History', description: 'Previous versions, diffs, roll back' },
                { id: 'back', label: 'Back' },
              ]}
              onSubmit={(id) => (id === 'back' ? setView(back) : id === 'history' ? onHistory(item) : onChoose(id as Flow, item))}
              onCancel={() => setView(back)}
            />
          </Box>
        </Box>
      </Frame>
    );
  }

  if (view.name === 'browse') {
    return (
      <Frame title={`All closed items (${closed.length})`} hints={[{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }, { key: 'Esc', label: 'back' }]}>
        <Box flexDirection="column">
          <Legend />
          <Box marginTop={1}>
            <Select options={closed.map(itemOption)} value={cursor} onSubmit={pick} onCancel={() => setView({ name: 'menu' })} maxVisible={bodyRows(rows) - 4} />
          </Box>
        </Box>
      </Frame>
    );
  }

  return (
    <Frame title="What do you want to do?" hints={[{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }, { key: 'Ctrl+C', label: 'quit' }]}>
      <Box flexDirection="column">
        <Select options={menu} value={cursor} onSubmit={pick} maxVisible={bodyRows(rows) - 2} />
        <Box marginTop={1}>
          <Legend />
        </Box>
      </Box>
    </Frame>
  );
};
