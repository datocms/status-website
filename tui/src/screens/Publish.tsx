import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { relative } from 'node:path';
import { Frame, bodyRows, useTerminalSize, type Hint } from '../components/Frame.tsx';
import { Select } from '../components/Select.tsx';
import { LineInput } from '../components/LineInput.tsx';
import { JsonPane } from '../components/JsonPane.tsx';
import { LogPane } from '../components/LogPane.tsx';
import { Spinner } from '../components/Spinner.tsx';
import type { Draft } from '../lib/flows.ts';
import { serialize, writeJson } from '../lib/files.ts';
import { defaultCommitMessage, publish, type Flow, type PublishResult } from '../lib/git.ts';
import { pollHosts, type HostState } from '../lib/verify.ts';
import { HOSTS, REPO_ROOT } from '../lib/paths.ts';

interface Props {
  flow: Flow;
  draft: Draft;
  onBack: () => void;
  /** `published` is true once the file is committed. */
  onDone: (published: boolean) => void;
}

type Phase =
  | { name: 'confirm'; editingMessage: boolean }
  | { name: 'running'; push: boolean }
  | { name: 'verifying' }
  | { name: 'done'; result: PublishResult | null; pushed: boolean; hosts: HostState[] | null };

const ACTIONS = [
  { id: 'push', label: 'Write, commit and push', description: 'Publishes to Netlify and the GitHub Pages mirror, then verifies' },
  { id: 'commit', label: 'Write and commit', description: 'Push later yourself' },
  { id: 'write', label: 'Write the file only', description: 'No git changes' },
  { id: 'back', label: 'Back to editing' },
];

const hostLine = (state: HostState) => {
  const r = state.result;
  if (r.status === 'verified') return `✓ ${state.name}: live and matching`;
  if (r.status === 'mismatch') return `✗ ${state.name}: mismatch\n    expected: ${r.expected}\n    found:    ${r.found}`;
  return `… ${state.name}: not there yet (${r.reason}, ${state.attempts} checks)`;
};

/** Final screen: confirm, run git, then watch both hosts. */
export const Publish = ({ flow, draft, onBack, onDone }: Props) => {
  const [phase, setPhase] = useState<Phase>({ name: 'confirm', editingMessage: false });
  const [commitMessage, setCommitMessage] = useState(defaultCommitMessage(flow, draft.title, draft.status));
  const [log, setLog] = useState('');
  const [hosts, setHosts] = useState<HostState[]>([]);
  const abort = useRef<AbortController | null>(null);
  const { rows } = useTerminalSize();
  const body = bodyRows(rows);

  const run = async (action: string) => {
    if (action === 'back') {
      onBack();
      return;
    }
    writeJson(draft.path, draft.file);
    if (action === 'write') {
      setPhase({ name: 'done', result: null, pushed: false, hosts: null });
      return;
    }
    const push = action === 'push';
    setPhase({ name: 'running', push });
    const result = await publish({ file: draft.path, message: commitMessage, push, onOutput: (chunk) => setLog((l) => l + chunk) });
    if (!result.ok || !push) {
      setPhase({ name: 'done', result, pushed: false, hosts: null });
      return;
    }
    setPhase({ name: 'verifying' });
    abort.current = new AbortController();
    const finalHosts = await pollHosts({
      hosts: HOSTS,
      expected: { slug: draft.slug, name: draft.title, updates: draft.contents },
      signal: abort.current.signal,
      onUpdate: setHosts,
    });
    setPhase({ name: 'done', result, pushed: true, hosts: finalHosts });
  };

  useInput(
    (_input, key) => {
      if (phase.name === 'verifying' && key.escape) abort.current?.abort();
      if (phase.name === 'done' && key.return) onDone(phase.result?.ok ?? false);
      if (phase.name === 'confirm' && !phase.editingMessage && key.escape) onBack();
    },
    { isActive: phase.name !== 'running' },
  );

  useEffect(() => () => abort.current?.abort(), []);

  const hints: Hint[] =
    phase.name === 'confirm'
      ? phase.editingMessage
        ? [{ key: 'Enter', label: 'save message' }, { key: 'Esc', label: 'cancel' }]
        : [{ key: '↑↓', label: 'move' }, { key: 'Enter', label: 'choose' }, { key: 'Esc', label: 'back' }]
      : phase.name === 'verifying'
        ? [{ key: 'Esc', label: 'stop waiting' }]
        : phase.name === 'done'
          ? [{ key: 'Enter', label: 'exit' }]
          : [];

  const filePath = relative(REPO_ROOT, draft.path);
  const urls = HOSTS.map((h) => `${h.origin}/incidents/${draft.slug}/`);

  return (
    <Frame title="Publish" hints={hints}>
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width="50%" paddingRight={1}>
          <Text>
            <Text bold>File     </Text>
            {filePath}
          </Text>
          {phase.name === 'confirm' ? (
            <Box flexDirection="column">
              <Box>
                <Text bold>Commit   </Text>
                {phase.editingMessage ? (
                  <LineInput
                    value={commitMessage}
                    onSubmit={(text) => { setCommitMessage(text); setPhase({ name: 'confirm', editingMessage: false }); }}
                    onCancel={() => setPhase({ name: 'confirm', editingMessage: false })}
                  />
                ) : (
                  <Text>{commitMessage}</Text>
                )}
              </Box>
              {!phase.editingMessage ? (
                <Box flexDirection="column" marginTop={1}>
                  <Select
                    options={[{ id: 'edit', label: 'Edit commit message' }, ...ACTIONS]}
                    value="push"
                    onSubmit={(id) => (id === 'edit' ? setPhase({ name: 'confirm', editingMessage: true }) : run(id))}
                    onCancel={onBack}
                  />
                </Box>
              ) : null}
            </Box>
          ) : null}
          {phase.name === 'running' ? (
            <Box marginTop={1}>
              <Spinner label={phase.push ? 'Committing and pushing… the pre-push hook builds the mirror, this takes a minute' : 'Committing…'} />
            </Box>
          ) : null}
          {phase.name === 'verifying' || (phase.name === 'done' && phase.hosts) ? (
            <Box flexDirection="column" marginTop={1}>
              {phase.name === 'verifying' ? <Spinner label="Checking both hosts every 5 s, up to 5 min…" /> : <Text bold>Verification</Text>}
              {(phase.name === 'done' ? phase.hosts! : hosts).map((h) => (
                <Text key={h.name} color={h.result.status === 'verified' ? 'green' : h.result.status === 'mismatch' ? 'red' : 'yellow'}>
                  {hostLine(h)}
                </Text>
              ))}
            </Box>
          ) : null}
          {phase.name === 'done' ? (
            <Box flexDirection="column" marginTop={1}>
              {phase.result === null ? <Text color="green">File written. Nothing committed.</Text> : null}
              {phase.result?.ok === false ? (
                <Text color="red">{`git ${phase.result.failedStep} failed (exit ${phase.result.code}). See the log; the file is written and staged.`}</Text>
              ) : null}
              {phase.result?.ok && !phase.pushed ? <Text color="green">Committed. Run `git push` when ready.</Text> : null}
              {phase.pushed ? <Text color="green">Pushed.</Text> : null}
              <Text> </Text>
              {urls.map((u) => (
                <Text key={u} dimColor>
                  {u}
                </Text>
              ))}
              <Text> </Text>
              <Text>Press Enter to exit.</Text>
            </Box>
          ) : null}
        </Box>
        <Box flexDirection="column" width="50%">
          {log ? <LogPane title="git" text={log} height={body - 2} /> : <JsonPane title={filePath} json={serialize(draft.file)} height={body - 2} tail />}
        </Box>
      </Box>
    </Frame>
  );
};
