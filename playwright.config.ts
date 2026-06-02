import { defineConfig, devices } from '@playwright/test'

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Public tests — no authentication required
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/authenticated/**'],
    },
    // Authenticated tests — uses saved session from global-setup
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: ['**/authenticated/**'],
    },
  ],
})
