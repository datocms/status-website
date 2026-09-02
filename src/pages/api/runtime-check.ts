import type { APIRoute } from 'astro';

export const prerender = false;

// Temporary diagnostic: reports which Node the SSR function actually runs on.
// Remove before merging.
export const GET: APIRoute = () =>
  Response.json({
    node: process.version,
    lambdaRuntime: process.env.AWS_EXECUTION_ENV ?? null,
  });
