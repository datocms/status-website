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
import { writeText } from '../lib/files.ts';
import { branchState, defaultCommitMessage, publish, publishResultMessage, type BranchState, type Flow, type PublishResult } from '../lib/git.ts';
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
  | { name: 'done'; result: PublishResult | null; pushed: boolean; hosts: HostState[] | null; wasStopped: boolean };

const actionsFor = (branch: BranchState) => [
  branch.canPublish
    ? { id: 'push', label: 'Write, commit and push', description: 'Publishes to Netlify and the GitHub Pages mirror, then verifies' }
    : { id: 'push', label: 'Write, commit and push', description: `Not possible from ${branch.current}: the hosts publish ${branch.production}`, disabled: true },
  { id: 'commit', label: 'Write and commit', description: branch.canPublish ? 'Push later yourself' : `Commits to ${branch.current}; nothing goes live` },
  { id: 'write', label: 'Write the file only', description: 'No git changes' },
  { id: 'back', label: 'Back to editing' },
];

const clip = (text: string) => (text.length > 110 ? `${text.slice(0, 110)}…` : text);

/** One host while the wait is in progress. */
export const waitingLine = (state: HostState) => {
  const r = state.result;
  if (r.status === 'verified') return `✓ ${state.name}: live and matching`;
  const why = r.status === 'mismatch' ? 'still shows the previous version' : r.reason;
  return `… ${state.name}: ${why} (${state.attempts} checks)`;
};

/** One host after the wait ended. */
export const finalLine = (state: HostState, wasStopped: boolean) => {
  const r = state.result;
  if (r.status === 'verified') return `✓ ${state.name}: live and matching`;
  const head = wasStopped ? `? ${state.name}: not confirmed, you stopped the wait` : `✗ ${state.name}: not live after ${state.attempts} checks`;
  if (r.status === 'pending') return `${head}\n    Last answer: ${r.reason}`;
  return r.field === 'title'
    ? `${head}\n    The page shows the title "${clip(r.found)}", not "${clip(r.expected)}"`
    : `${head}\n    The page does not show this line of your text:\n    "${clip(r.expected)}"`;
};

/** Final screen: confirm, run git, then watch both hosts. */
export const Publish = ({ flow, draft, onBack, onDone }: Props) => {
  const [phase, setPhase] = useState<Phase>({ name: 'confirm', editingMessage: false });
  const [commitMessage, setCommitMessage] = useState(defaultCommitMessage(flow, draft.title, draft.status));
  const [log, setLog] = useState('');
  const [hosts, setHosts] = useState<HostState[]>([]);
  const [branch, setBranch] = useState<BranchState | null>(null);

  useEffect(() => {
    branchState().then(setBranch);
  }, []);
  const abort = useRef<AbortController | null>(null);
  const { rows } = useTerminalSize();
  const body = bodyRows(rows);

  const run = async (action: string) => {
    if (action === 'back') {
      onBack();
      return;
    }
    writeText(draft.path, draft.text);
    if (action === 'write') {
      setPhase({ name: 'done', result: null, pushed: false, hosts: null, wasStopped: false });
      return;
    }
    const push = action === 'push' && branch!.canPublish;
    setPhase({ name: 'running', push });
    const result = await publish({ file: draft.path, message: commitMessage, push, onOutput: (chunk) => setLog((l) => l + chunk) });
    if (!result.ok || !push) {
      setPhase({ name: 'done', result, pushed: false, hosts: null, wasStopped: false });
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
    setPhase({ name: 'done', result, pushed: true, hosts: finalHosts, wasStopped: abort.current.signal.aborted });
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
              <Text>
                <Text bold>Branch   </Text>
                {branch ? branch.current : '…'}
              </Text>
              {branch && !branch.canPublish ? (
                <Box marginTop={1} flexDirection="column">
                  <Text color="yellow">{`You are on ${branch.current}. Netlify and the mirror publish ${branch.production} only.`}</Text>
                  <Text color="yellow">{`To publish: quit, run "git checkout ${branch.production} && git pull", then start the TUI again.`}</Text>
                </Box>
              ) : null}
              {!phase.editingMessage && branch ? (
                <Box flexDirection="column" marginTop={1}>
                  <Select
                    options={[{ id: 'edit', label: 'Edit commit message' }, ...actionsFor(branch)]}
                    value={branch.canPublish ? 'push' : 'commit'}
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
              {phase.name === 'verifying' ? (
                <Spinner label="Pushed. Waiting for both hosts to deploy: a check every 5 s, up to 5 min…" />
              ) : (
                <Text bold>Verification</Text>
              )}
              {phase.name === 'verifying'
                ? hosts.map((h) => (
                    <Text key={h.name} color={h.result.status === 'verified' ? 'green' : 'yellow'}>
                      {waitingLine(h)}
                    </Text>
                  ))
                : phase.hosts!.map((h) => (
                    <Text key={h.name} color={h.result.status === 'verified' ? 'green' : phase.wasStopped ? 'yellow' : 'red'}>
                      {finalLine(h, phase.wasStopped)}
                    </Text>
                  ))}
              {phase.name === 'done' && phase.hosts!.some((h) => h.result.status !== 'verified') ? (
                <Box marginTop={1} flexDirection="column">
                  <Text>Your commit is pushed. The file is correct in git.</Text>
                  <Text>{phase.wasStopped ? 'Open the links below in a few minutes to confirm.' : 'Look at the deploy log of the host that failed, then open the links below.'}</Text>
                </Box>
              ) : null}
            </Box>
          ) : null}
          {phase.name === 'done' ? (
            <Box flexDirection="column" marginTop={1}>
              {phase.result === null ? <Text color="green">File written. Nothing committed.</Text> : null}
              {phase.result?.ok === false ? <Text color="red">{publishResultMessage(phase.result)}</Text> : null}
              {phase.result?.ok && !phase.pushed ? (
                <Text color="green">{branch?.canPublish ? 'Committed. Nothing is live until you run `git push`.' : `Committed to ${branch?.current}. Nothing is live.`}</Text>
              ) : null}
              {phase.pushed && phase.hosts!.every((h) => h.result.status === 'verified') ? <Text color="green">Published and confirmed on both hosts.</Text> : null}
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
          {log ? <LogPane title="git" text={log} height={body - 2} /> : <JsonPane title={filePath} json={draft.text} height={body - 2} tail />}
        </Box>
      </Box>
    </Frame>
  );
};
