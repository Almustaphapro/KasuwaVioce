import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {
      ...(process.env.PLAYWRIGHT_BROWSER_PATH
        ? { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }
        : process.platform === 'win32'
          ? { channel: 'msedge' }
          : {}),
      args: ['--use-fake-device-for-media-stream'],
    },
  },
})
