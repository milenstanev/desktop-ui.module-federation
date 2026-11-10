import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for memory testing
 * Requires Chrome with --enable-precise-memory-info flag
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/memory-endurance.spec.ts',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60 * 60 * 1000, // 1 hour per test (for long endurance test)

  expect: {
    timeout: 10000,
  },

  reporter: 'list',

  use: {
    baseURL: 'http://localhost:3000',
    headless: false, // Need to see memory usage
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // Enable precise memory info
    launchOptions: {
      args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
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
