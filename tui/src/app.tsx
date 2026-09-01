import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Home } from './screens/Home.tsx';
import { Form } from './screens/Form.tsx';
import { Publish } from './screens/Publish.tsx';
import { History } from './screens/History.tsx';
import { Frame } from './components/Frame.tsx';
import { Select } from './components/Select.tsx';
import { listItems, readJson, type OpenItem } from './lib/files.ts';
import type { IncidentFile, MaintenanceFile } from '../../src/lib/schema.ts';
import { formatUtc } from './lib/dates.ts';
import type { Version } from './lib/history.ts';
import { initialValues, type Draft, type FlowContext, type Values } from './lib/flows.ts';
import { discardDraft, type Flow } from './lib/git.ts';
import { openBrowser, startDevServer, type DevServer } from './lib/devServer.ts';

type Screen =
  | { name: 'home' }
  | { name: 'form'; ctx: FlowContext }
  | { name: 'publish'; ctx: FlowContext; draft: Draft }
  | { name: 'history'; item: OpenItem }
  | { name: 'exit-prompt'; then: 'home' | 'exit' };

export const App = () => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [items, setItems] = useState<OpenItem[]>(() => listItems());
  const [values, setValues] = useState<Values>({});
  const draftPath = useRef<string | null>(null);
  const published = useRef(false);
  const devServer = useRef<DevServer | null>(null);
  const devLog = useRef('');

  const stopDevServer = () => {
    devServer.current?.stop();
    devServer.current = null;
  };

  const leave = () => {
    stopDevServer();
    exit();
  };

  useEffect(() => stopDevServer, []);

  /** Leaves the current draft behind or asks what to do with it. */
  const finish = (then: 'home' | 'exit') => {
    if (draftPath.current && !published.current) {
      setScreen({ name: 'exit-prompt', then });
      return;
    }
    if (then === 'exit') leave();
    else {
      draftPath.current = null;
      published.current = false;
      setItems(listItems());
      setScreen({ name: 'home' });
    }
  };

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      if (screen.name === 'exit-prompt') leave();
      else finish('exit');
    }
  });

  const preview = async (draft: Draft) => {
    if (!devServer.current) {
      devServer.current = await startDevServer({ onOutput: (c) => (devLog.current += c) });
    }
    const url = `${devServer.current.url}/incidents/${draft.slug}/`;
    await openBrowser(url);
    return `Opened ${url} (edits hot-reload)`;
  };

  const startFlow = (flow: Flow, item?: OpenItem) => {
    const ctx: FlowContext = { flow, item, existing: item ? readJson(item.path) : undefined, now: new Date() };
    setValues(initialValues(ctx));
    setScreen({ name: 'form', ctx });
  };

  /** Turns an old committed version into a draft that Publish can commit as a new commit. */
  const rollback = (item: OpenItem, version: Version, content: string) => {
    const file = JSON.parse(content) as IncidentFile | MaintenanceFile;
    const updates = file.updates ?? [];
    const contents = [...('scheduledTime' in file ? [file.content ?? ''] : []), ...updates.map((u) => u.content)].filter(Boolean);
    const draft: Draft = { kind: item.kind, path: item.path, slug: item.slug, title: file.name, file, contents, status: formatUtc(version.date) };
    const ctx: FlowContext = { flow: 'rollback', item, existing: file, now: new Date() };
    setScreen({ name: 'publish', ctx, draft });
  };

  switch (screen.name) {
    case 'home':
      return <Home items={items} onChoose={startFlow} onHistory={(item) => setScreen({ name: 'history', item })} onQuit={() => finish('exit')} />;
    case 'history':
      return <History item={screen.item} onBack={() => setScreen({ name: 'home' })} onRollback={(version, content) => rollback(screen.item, version, content)} />;
    case 'form':
      return (
        <Form
          ctx={screen.ctx}
          values={values}
          onValuesChange={setValues}
          onPublish={(draft) => setScreen({ name: 'publish', ctx: screen.ctx, draft })}
          onBack={() => finish('home')}
          onPreview={preview}
          onDraftWritten={(path) => (draftPath.current = path)}
        />
      );
    case 'publish':
      return (
        <Publish
          flow={screen.ctx.flow}
          draft={screen.draft}
          onBack={() => setScreen(screen.ctx.flow === 'rollback' ? { name: 'home' } : { name: 'form', ctx: screen.ctx })}
          onDone={(wasPublished) => {
            published.current = wasPublished;
            // A written-only file is intentional; do not offer to delete it.
            if (!wasPublished) draftPath.current = null;
            finish('exit');
          }}
        />
      );
    case 'exit-prompt':
      return (
        <Frame title="Unpublished draft" hints={[{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }]}>
          <Box flexDirection="column">
            <Text>{`${draftPath.current} has unpublished changes.`}</Text>
            <Box marginTop={1}>
              <Select
                options={[
                  { id: 'keep', label: 'Keep the file', description: 'Leave it in data/ to finish later' },
                  { id: 'delete', label: 'Discard the changes', description: 'Delete the new file, or restore the committed version' },
                ]}
                onSubmit={async (id) => {
                  if (id === 'delete' && draftPath.current) await discardDraft(draftPath.current);
                  draftPath.current = null;
                  finish(screen.then);
                }}
              />
            </Box>
          </Box>
        </Frame>
      );
  }
};
