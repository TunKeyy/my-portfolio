import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

// The list view is the same <NodeList> rendered when the graph chunk fails or times out
// (constellation falls back to it). This verifies that fallback UI renders the data correctly.
// Note: the automatic chunk-failure trigger is a production path — dev Turbopack breaks its own
// client runtime when a chunk request is aborted, so it cannot be simulated against `next dev`.
test('list fallback renders the full node data', async ({ page }) => {
  await page.goto(`${BASE}/second-brain`)
  await page.waitForLoadState('networkidle')

  const list = page.locator('nav[aria-label="Knowledge graph navigation"]')
  await expect(list).toHaveCount(1)
  // Seeded "Software Engineering" is stable; the list must render the roots.
  await expect(list.getByRole('button', { name: /Software Engineering/ })).toBeAttached()
  expect(await list.locator('button').count()).toBeGreaterThanOrEqual(3)
})
