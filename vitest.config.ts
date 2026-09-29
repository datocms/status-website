/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Astro's Vite config resolves the `astro:*` modules that the site imports.
export default getViteConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
