import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select } from './Select.tsx';
import { Spinner } from './Spinner.tsx';
import { buildPrompt, CLAUDE_ACTIONS, claudeAvailable, runClaude, type ClaudeAction } from '../lib/claude.ts';
import { recentUpdateExamples } from '../lib/files.ts';

interface Props {
  text: string;
  onAccept: (text: string) => void;
  onClose: () => void;
}

type Phase =
  | { name: 'checking' }
  | { name: 'unavailable' }
  | { name: 'menu' }
  | { name: 'running'; action: ClaudeAction }
  | { name: 'result'; result: string }
  | { name: 'error'; error: string };

/** Ctrl+G overlay: pick a Claude action, wait, then accept or discard the result. */
export const ClaudeOverlay = ({ text, onAccept, onClose }: Props) => {
  const [phase, setPhase] = useState<Phase>({ name: 'checking' });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    claudeAvailable().then((ok) => setPhase(ok ? { name: 'menu' } : { name: 'unavailable' }));
  }, []);

  const start = async (action: ClaudeAction) => {
    if (!text.trim()) {
      setPhase({ name: 'error', error: 'The message is empty. Type something first, even rough notes.' });
      return;
    }
    setPhase({ name: 'running', action });
    abort.current = new AbortController();
    const examples = action === 'translate' ? [] : recentUpdateExamples(2);
    const outcome = await runClaude(buildPrompt(action, text, examples), { signal: abort.current.signal });
    if (abort.current.signal.aborted) return;
    setPhase(outcome.ok ? { name: 'result', result: outcome.text } : { name: 'error', error: outcome.error });
  };

  useInput(
    (_input, key) => {
      if (!key.escape) return;
      if (phase.name === 'running') {
        abort.current?.abort();
        setPhase({ name: 'menu' });
        return;
      }
      if (phase.name === 'error' || phase.name === 'unavailable' || phase.name === 'checking') onClose();
    },
    { isActive: phase.name !== 'menu' && phase.name !== 'result' },
  );

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="magenta" paddingX={1}>
      <Text bold color="magenta">Claude</Text>
      {phase.name === 'checking' ? <Spinner label="Looking for the claude command…" /> : null}
      {phase.name === 'unavailable' ? (
        <Text>The `claude` command is not on your PATH, so no AI actions are available. Esc to close.</Text>
      ) : null}
      {phase.name === 'menu' ? (
        <Select options={CLAUDE_ACTIONS} onSubmit={(id) => start(id as ClaudeAction)} onCancel={onClose} />
      ) : null}
      {phase.name === 'running' ? (
        <Spinner label={`${CLAUDE_ACTIONS.find((a) => a.id === phase.action)?.label}… (Esc to cancel)`} />
      ) : null}
      {phase.name === 'error' ? <Text color="red">{`${phase.error}  (Esc to close)`}</Text> : null}
      {phase.name === 'result' ? (
        <Box flexDirection="column">
          <Text dimColor>Original:</Text>
          <Text>{text}</Text>
          <Text> </Text>
          <Text dimColor>Claude:</Text>
          <Text color="green">{phase.result}</Text>
          <Text> </Text>
          <Select
            options={[
              { id: 'accept', label: 'Accept', description: 'Replace the message with this text' },
              { id: 'discard', label: 'Discard', description: 'Keep the original' },
            ]}
            onSubmit={(id) => (id === 'accept' ? onAccept(phase.result) : onClose())}
            onCancel={onClose}
          />
        </Box>
      ) : null}
    </Box>
  );
};
