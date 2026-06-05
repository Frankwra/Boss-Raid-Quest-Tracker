import { defineConfig, devices } from '@playwright/test';

const PORT_FRONTEND = 3000;
const PORT_BACKEND = 3333;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT_FRONTEND}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: `http://localhost:${PORT_BACKEND}/api/quests`,
      reuseExistingServer: true,
      timeout: 30_000,
      cwd: '..',
    },
    {
      command: 'npm run dev',
      url: `http://localhost:${PORT_FRONTEND}`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
