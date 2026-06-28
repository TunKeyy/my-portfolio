import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Scoped to tests/unit/** so Vitest and Playwright never collect each other's files.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
      // 'server-only' throws outside an RSC build; neutralize it for unit tests.
      'server-only': path.resolve(process.cwd(), 'empty-module.ts'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'mcp/second-brain/tests/**/*.test.ts'],
    environment: 'node',
  },
})
