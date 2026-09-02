import type { APIRoute } from 'astro';

export const prerender = false;

// Temporary diagnostic: reports the Node the SSR function runs on and whether
// the two packages /api/feeds needs can actually be loaded. Remove before
// merging.
const tryImport = async (name: string) => {
  try {
    await import(/* @vite-ignore */ name);
    return 'ok';
  } catch (error) {
    return error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);
  }
};

export const GET: APIRoute = async () =>
  Response.json({
    node: process.version,
    lambdaRuntime: process.env.AWS_EXECUTION_ENV ?? null,
    'sanitize-html': await tryImport('sanitize-html'),
    'rss-parser': await tryImport('rss-parser'),
  });
