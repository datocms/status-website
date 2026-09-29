import { spawn, type ChildProcess } from 'node:child_process';

export interface RunOptions {
  cwd?: string;
  input?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Receives every chunk of stdout and stderr as it arrives. */
  onOutput?: (chunk: string) => void;
}

export interface RunResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export type Runner = (cmd: string, args: string[], options?: RunOptions) => Promise<RunResult>;

/** The one place child processes are spawned; tests replace it. */
export const run: Runner = (cmd, args, { cwd, input, signal, timeoutMs, onOutput } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'], signal });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill('SIGTERM');
        }, timeoutMs)
      : undefined;

    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
      onOutput?.(chunk);
    });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk;
      onOutput?.(chunk);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      // An abort surfaces as an error; report it as a null exit code instead.
      if ((err as NodeJS.ErrnoException).name === 'AbortError') {
        resolve({ code: null, stdout, stderr, timedOut });
        return;
      }
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });

    if (input !== undefined) {
      child.stdin.end(input);
    } else {
      child.stdin.end();
    }
  });

/** Starts a process that outlives the call, for the dev server. */
export const spawnDetached = (
  cmd: string,
  args: string[],
  { cwd, onOutput }: { cwd?: string; onOutput?: (chunk: string) => void },
): ChildProcess => {
  const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout?.setEncoding('utf8').on('data', (c: string) => onOutput?.(c));
  child.stderr?.setEncoding('utf8').on('data', (c: string) => onOutput?.(c));
  return child;
};

export const commandExists = async (name: string, runner: Runner = run) => {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  try {
    return (await runner(probe, [name])).code === 0;
  } catch {
    return false;
  }
};
