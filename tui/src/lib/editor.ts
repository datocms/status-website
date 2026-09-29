import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** `$VISUAL`, then `$EDITOR`, then a sensible default per platform. */
export const editorCommand = (env = process.env) =>
  env.VISUAL || env.EDITOR || (process.platform === 'win32' ? 'notepad' : 'nano');

/**
 * Opens the text in the user's editor and returns the saved result. Blocks
 * until the editor exits. The caller must hand the terminal over first.
 */
export const editInExternalEditor = (text: string): { ok: true; text: string } | { ok: false; error: string } => {
  const dir = mkdtempSync(join(tmpdir(), 'status-tui-'));
  const file = join(dir, 'message.md');
  writeFileSync(file, text);

  const [cmd, ...args] = editorCommand().split(' ');
  const result = spawnSync(cmd, [...args, file], { stdio: 'inherit' });
  if (result.error) {
    return { ok: false, error: `could not start ${cmd}: ${result.error.message}` };
  }
  if (result.status !== 0) {
    return { ok: false, error: `${cmd} exited with code ${result.status}` };
  }
  return { ok: true, text: readFileSync(file, 'utf8').replace(/\n$/, '') };
};
