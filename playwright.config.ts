import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://pokedle-iw.vercel.app',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'funcionalidad',
      testMatch: /funcionalidad\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'compatibilidad-chromium',
      testMatch: /compatibilidad\.spec\.ts/,
      use: { browserName: 'chromium' },
    },
    {
      name: 'compatibilidad-webkit',
      testMatch: /compatibilidad\.spec\.ts/,
      use: { browserName: 'webkit' },
    },
    {
      name: 'compatibilidad-firefox',
      testMatch: /compatibilidad\.spec\.ts/,
      use: { browserName: 'firefox' },
    },
    {
      name: 'seguridad',
      testMatch: /seguridad\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
