import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // Playwright's default testMatch also grabs *.test.ts; keep it out of Vitest's unit dir.
  testIgnore: ['**/unit/**'],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30000,
  },
})
