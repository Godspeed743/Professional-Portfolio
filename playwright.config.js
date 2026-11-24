import { defineConfig, devices } from '@playwright/test';

// Only *.spec.js files are Playwright tests. The other tests/*.js files are
// standalone scripts run with `node tests/<file>.js <url>`.
export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.js',
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
