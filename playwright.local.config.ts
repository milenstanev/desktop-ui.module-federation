import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  grepInvert: /@memory/,
  testMatch: ['tests/**/*.spec.ts', 'src/**/__tests__/e2e/**/*.spec.ts'],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  retries: process.env.CI ? 2 : 1,
  reporter: 'html',
  fullyParallel: false,
  workers: 10,
  use: {
    headless: !!process.env.CI,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command:
      '"C:/Program Files/Git/bin/bash.exe" ./scripts/start-e2e-servers.sh',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: false,
  },
});
