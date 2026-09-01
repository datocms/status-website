// @ts-check
import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://status.datocms.com',
  adapter: netlify(),
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
