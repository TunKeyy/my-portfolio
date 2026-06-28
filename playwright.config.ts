import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // Playwright's default testMatch also grabs *.test.ts; keep it out of Vitest's unit dir.
  testIgnore: ['**/unit/**'],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    // Sent only if /second-brain challenges with 401 (i.e. when SECOND_BRAIN_PASSWORD is set).
    httpCredentials: { username: 'sb', password: process.env.SECOND_BRAIN_PASSWORD || '' },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30000,
  },
})
