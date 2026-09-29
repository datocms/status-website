import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ChildProcess } from 'node:child_process';
import { run, spawnDetached } from './proc.ts';
import { REPO_ROOT } from './paths.ts';

export interface DevServer {
  url: string;
  stop: () => void;
}

export const findFreePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });

const waitForHttp = async (url: string, timeoutMs: number) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
};

/** Starts `astro dev` in the repo root and resolves once it answers. */
export const startDevServer = async ({
  cwd = REPO_ROOT,
  onOutput,
  timeoutMs = 60_000,
}: {
  cwd?: string;
  onOutput?: (chunk: string) => void;
  timeoutMs?: number;
} = {}): Promise<DevServer> => {
  if (!existsSync(join(cwd, 'node_modules', 'astro'))) {
    throw new Error('Run `npm install` in the repo root first; the preview needs Astro');
  }
  const port = await findFreePort();
  const child: ChildProcess = spawnDetached('npx', ['astro', 'dev', '--port', String(port)], { cwd, onOutput });
  const url = `http://localhost:${port}`;
  const stop = () => {
    if (!child.killed) child.kill('SIGTERM');
  };

  const ready = await waitForHttp(url, timeoutMs);
  if (!ready) {
    stop();
    throw new Error(`dev server did not answer on ${url} within ${timeoutMs / 1000}s`);
  }
  return { url, stop };
};

/** Opens a URL in the default browser. */
export const openBrowser = (url: string) => {
  const [cmd, args] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];
  return run(cmd, args);
};
