// @ts-check
import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';

// `astro dev` runs without the adapter: its dev middleware starts a Deno-based
// edge-functions emulator that this site does not use and that fails on
// machines without Deno. Set NETLIFY_DEV_EMULATION=1 to opt back in.
const isDev = process.argv.includes('dev');
const useAdapter = !isDev || !!process.env.NETLIFY_DEV_EMULATION;

export default defineConfig({
  site: 'https://status.datocms.com',
  adapter: useAdapter ? netlify() : undefined,
  vite: {
    server: {
      watch: {
        // The end-to-end tests build a copy of the site. The dev server must
        // not reload for each file of that build, or for the TUI.
        ignored: ['**/e2e/.dist/**', '**/e2e/.data/**', '**/test-results/**', '**/playwright-report/**', '**/tui/**'],
      },
    },
  },
  env: {
    schema: {
      CLOUDWATCH_AWS_REGION: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: 'us-east-1',
      }),
      // Optional so the site builds and runs locally without secrets;
      // the metrics endpoints answer 503 when they are missing.
      CLOUDWATCH_AWS_ACCESS_KEY_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      CLOUDWATCH_AWS_SECRET_ACCESS_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      STATUSCAKE_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
