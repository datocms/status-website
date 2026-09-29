import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Frame, bodyRows, useTerminalSize } from '../components/Frame.tsx';
import { Select } from '../components/Select.tsx';
import { Spinner } from '../components/Spinner.tsx';
import { DiffPane } from '../components/DiffPane.tsx';
import { currentContent, fileAtVersion, fileHistory, firstChange, sideBySide, type DiffRow, type Version } from '../lib/history.ts';
import { formatUtc, relativeAge } from '../lib/dates.ts';
import type { OpenItem } from '../lib/files.ts';

interface Props {
  item: OpenItem;
  onBack: () => void;
  /** Called with the chosen version's file content to roll back to. */
  onRollback: (version: Version, content: string) => void;
}

type View =
  | { name: 'loading' }
  | { name: 'list'; versions: Version[] }
  | { name: 'diff'; versions: Version[]; version: Version; content: string; rows: DiffRow[]; menu: boolean }
  | { name: 'error'; error: string };

const short = (sha: string) => sha.slice(0, 7);

/** Committed versions of one item, a side-by-side diff, and append-only rollback. */
export const History = ({ item, onBack, onRollback }: Props) => {
  const [view, setView] = useState<View>({ name: 'loading' });
  const { rows, columns } = useTerminalSize();

  useEffect(() => {
    fileHistory(item.path)
      .then((versions) => setView({ name: 'list', versions }))
      .catch((err: Error) => setView({ name: 'error', error: err.message }));
  }, [item.path]);

  const open = async (versions: Version[], version: Version) => {
    try {
      const content = await fileAtVersion(item.path, version.sha);
      setView({ name: 'diff', versions, version, content, rows: sideBySide(content, currentContent(item.path)), menu: false });
    } catch (err) {
      setView({ name: 'error', error: (err as Error).message });
    }
  };

  useInput(
    (_input, key) => {
      if (view.name === 'error' && key.escape) onBack();
      if (view.name !== 'diff') return;
      if (key.escape) {
        if (view.menu) setView({ ...view, menu: false });
        else setView({ name: 'list', versions: view.versions });
      }
      if (key.return && !view.menu) setView({ ...view, menu: true });
    },
    { isActive: view.name === 'error' || (view.name === 'diff' && !view.menu) },
  );

  if (view.name === 'loading') {
    return (
      <Frame title={`History: ${item.name}`} hints={[]}>
        <Spinner label="Reading git log…" />
      </Frame>
    );
  }

  if (view.name === 'error') {
    return (
      <Frame title={`History: ${item.name}`} hints={[{ key: 'Esc', label: 'back' }]}>
        <Text color="red">{view.error}</Text>
      </Frame>
    );
  }

  if (view.name === 'list') {
    const { versions } = view;
    const isCurrent = (i: number) => i === 0;
    return (
      <Frame title={`History: ${item.name}`} hints={[{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'compare' }, { key: 'Esc', label: 'back' }]}>
        {versions.length === 0 ? (
          <Text dimColor>No commits touch this file yet. Publish it first.</Text>
        ) : (
          <Select
            options={versions.map((v, i) => ({
              id: v.sha,
              label: `${relativeAge(v.date)}${isCurrent(i) ? ' (current)' : ''}`.padEnd(18) + v.subject,
              description: `${short(v.sha)} · ${v.author} · ${formatUtc(v.date)}`,
            }))}
            onSubmit={(sha) => open(versions, versions.find((v) => v.sha === sha)!)}
            onCancel={onBack}
            maxVisible={bodyRows(rows) - 1}
          />
        )}
      </Frame>
    );
  }

  const { version, content, rows: diffRows, menu } = view;
  const unchanged = diffRows.every((r) => r.kind === 'same');
  return (
    <Frame
      title={`${item.name} · ${short(version.sha)} vs current`}
      hints={menu ? [{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }, { key: 'Esc', label: 'cancel' }] : [{ key: '↑↓', label: 'scroll' }, { key: 'Enter', label: 'actions' }, { key: 'Esc', label: 'back' }]}
      message={unchanged ? { text: 'This version is identical to the current file.', tone: 'info' } : null}
    >
      <Box flexDirection="column">
        <DiffPane
          rows={diffRows}
          leftTitle={`${short(version.sha)} · ${relativeAge(version.date)} · ${version.subject}`}
          rightTitle="current"
          height={bodyRows(rows) - (menu ? 4 : 1)}
          width={columns - 4}
          initialRow={firstChange(diffRows)}
          isActive={!menu}
        />
        {menu ? (
          <Box marginTop={1}>
            <Select
              options={[
                { id: 'rollback', label: 'Roll back to this version', description: 'Writes it as a new commit; history is never rewritten', disabled: unchanged },
                { id: 'back', label: 'Back to the diff' },
              ]}
              onSubmit={(id) => (id === 'rollback' ? onRollback(version, content) : setView({ ...view, menu: false }))}
              onCancel={() => setView({ ...view, menu: false })}
            />
          </Box>
        ) : null}
      </Box>
    </Frame>
  );
};
