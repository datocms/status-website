import { commandExists, run, type Runner } from './proc.ts';

export type ClaudeAction = 'write' | 'copyedit' | 'translate';

export const CLAUDE_ACTIONS: { id: ClaudeAction; label: string; description: string }[] = [
  { id: 'write', label: 'Help me write from notes', description: 'Turn rough notes into a full customer-facing update' },
  { id: 'copyedit', label: 'Copyedit', description: 'Fix grammar and tone, keep the meaning' },
  { id: 'translate', label: 'Translate to English', description: 'Return an English version of the text' },
];

const HOUSE_STYLE = `House style for DatoCMS status page updates:
- Written for customers, in first person plural ("We are investigating...").
- Plain language, no internal jargon, no blame on vendors or people.
- State what users may experience, what we are doing, and what comes next.
- Short paragraphs. Markdown is allowed but keep it minimal.
- Do not invent facts, times, or causes that are not in the input.`;

const TASKS: Record<ClaudeAction, string> = {
  write: 'Write a complete status update from the notes below, following the house style.',
  copyedit: 'Copyedit the text below: fix grammar, spelling, and tone to match the house style. Keep the meaning and every fact. Keep the same language.',
  translate: 'Translate the text below into English, following the house style. Keep every fact.',
};

/** Builds the full prompt for one action. Examples are recent real updates. */
export const buildPrompt = (action: ClaudeAction, text: string, examples: string[]) => {
  const exampleBlock = examples.length
    ? `\n\nExamples of past updates:\n${examples.map((e, i) => `--- Example ${i + 1} ---\n${e}`).join('\n')}\n--- End examples ---`
    : '';
  return `${TASKS[action]}\n\n${HOUSE_STYLE}${exampleBlock}\n\nReply with the final text only. No preamble, no quotes, no explanations.\n\n--- Input ---\n${text}\n--- End input ---`;
};

export const claudeAvailable = (runner?: Runner) => commandExists('claude', runner);

export interface ClaudeRunOptions {
  runner?: Runner;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** Runs `claude -p` with the prompt on stdin and returns the trimmed reply. */
export const runClaude = async (
  prompt: string,
  { runner = run, signal, timeoutMs = 90_000 }: ClaudeRunOptions = {},
): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
  const result = await runner('claude', ['-p', '--output-format', 'text'], {
    input: prompt,
    signal,
    timeoutMs,
  });
  if (result.timedOut) {
    return { ok: false, error: `claude timed out after ${timeoutMs / 1000}s` };
  }
  if (result.code !== 0) {
    return { ok: false, error: result.stderr.trim() || `claude exited with code ${result.code}` };
  }
  return { ok: true, text: result.stdout.trim() };
};
