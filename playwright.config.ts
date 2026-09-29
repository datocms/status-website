import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, PORT } from './e2e/port.ts';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    // Not UTC, on purpose, and not the zone of the build: every date on a
    // page must be UTC for a visitor in any zone.
    timezoneId: 'Asia/Tokyo',
    locale: 'en-US',
  },
  webServer: {
    // Builds the site from the fixture data, then serves it as a static host.
    command: 'node e2e/prepare.ts && node e2e/serve.ts',
    url: `${BASE_URL}/`,
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
});
