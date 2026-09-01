import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, runClaude } from '../src/lib/claude.ts';
import type { Runner } from '../src/lib/proc.ts';

test('buildPrompt includes task, house style, examples, and input', () => {
  const prompt = buildPrompt('copyedit', 'we fixed it', ['Example one.', 'Example two.']);
  assert.match(prompt, /^Copyedit the text below/);
  assert.match(prompt, /House style for DatoCMS/);
  assert.match(prompt, /--- Example 1 ---\nExample one\./);
  assert.match(prompt, /--- Example 2 ---\nExample two\./);
  assert.match(prompt, /--- Input ---\nwe fixed it\n--- End input ---$/);
});

test('buildPrompt omits the examples block when there are none', () => {
  const prompt = buildPrompt('translate', 'ciao', []);
  assert.doesNotMatch(prompt, /Examples of past updates/);
  assert.match(prompt, /Translate the text below into English/);
});

test('runClaude passes the prompt on stdin and trims the reply', async () => {
  let seen: { args: string[]; input?: string } | undefined;
  const runner: Runner = async (_cmd, args, options) => {
    seen = { args, input: options?.input };
    return { code: 0, stdout: '  Hello.\n', stderr: '', timedOut: false };
  };
  const result = await runClaude('PROMPT', { runner });
  assert.deepEqual(result, { ok: true, text: 'Hello.' });
  assert.deepEqual(seen?.args, ['-p', '--output-format', 'text']);
  assert.equal(seen?.input, 'PROMPT');
});

test('runClaude reports timeouts and non-zero exits', async () => {
  const timedOut: Runner = async () => ({ code: null, stdout: '', stderr: '', timedOut: true });
  assert.deepEqual(await runClaude('p', { runner: timedOut, timeoutMs: 1000 }), {
    ok: false,
    error: 'claude timed out after 1s',
  });

  const failed: Runner = async () => ({ code: 2, stdout: '', stderr: 'not logged in\n', timedOut: false });
  assert.deepEqual(await runClaude('p', { runner: failed }), { ok: false, error: 'not logged in' });
});
