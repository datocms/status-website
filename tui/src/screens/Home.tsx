import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { Frame } from '../components/Frame.tsx';
import { Select } from '../components/Select.tsx';
import { relativeAge } from '../lib/dates.ts';
import type { OpenItem } from '../lib/files.ts';
import type { Flow } from '../lib/git.ts';

interface Props {
  openItems: OpenItem[];
  onChoose: (flow: Flow, item?: OpenItem) => void;
  onQuit: () => void;
}

const describe = (item: OpenItem) =>
  `${item.kind === 'maintenance' ? 'Maintenance' : 'Incident'} · ${item.status} · ${relativeAge(item.date)}`;

/** First screen: pick an action, and an open item when the action needs one. */
export const Home = ({ openItems, onChoose, onQuit }: Props) => {
  const [pendingFlow, setPendingFlow] = useState<Flow | null>(null);
  const hasOpen = openItems.length > 0;

  const actions = [
    { id: 'new-incident', label: 'New incident', description: 'Something is broken right now' },
    { id: 'new-maintenance', label: 'New maintenance', description: 'Announce a planned window' },
    { id: 'update', label: 'Update an open item', description: hasOpen ? 'Add a status update' : 'Nothing is open', disabled: !hasOpen },
    { id: 'resolve', label: 'Resolve an open item', description: hasOpen ? 'Close it out' : 'Nothing is open', disabled: !hasOpen },
    { id: 'quit', label: 'Quit' },
  ];

  const hints = pendingFlow
    ? [{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'pick' }, { key: 'Esc', label: 'back' }]
    : [{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }, { key: 'Ctrl+C', label: 'quit' }];

  return (
    <Frame title={pendingFlow ? 'Which item?' : 'What do you want to do?'} hints={hints}>
      {pendingFlow ? (
        <Select
          options={openItems.map((item) => ({ id: item.path, label: item.name, description: describe(item) }))}
          onSubmit={(path) => onChoose(pendingFlow, openItems.find((i) => i.path === path))}
          onCancel={() => setPendingFlow(null)}
        />
      ) : (
        <Box flexDirection="column">
          <Select
            options={actions}
            onSubmit={(id) => {
              if (id === 'quit') onQuit();
              else if (id === 'update' || id === 'resolve') setPendingFlow(id);
              else onChoose(id as Flow);
            }}
          />
          <Box flexDirection="column" marginTop={1}>
            <Text bold>{hasOpen ? 'Open items' : 'No open incidents or maintenances'}</Text>
            {openItems.map((item) => (
              <Text key={item.path}>
                {'  '}
                <Text color={item.kind === 'maintenance' ? 'blue' : 'yellow'}>●</Text> {item.name}
                <Text dimColor>{`  ${describe(item)}`}</Text>
              </Text>
            ))}
          </Box>
        </Box>
      )}
    </Frame>
  );
};
