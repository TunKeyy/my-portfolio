import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

const fakeChild = {
  id: 'e2e-child-1',
  parent_id: 'e2e-root',
  title: 'E2E Child Topic',
  slug: 'e2e-child',
  description: null,
  color: '#22c55e',
  icon: null,
  sort_order: 0,
  created_at: '',
  updated_at: '',
}

test('home launcher routes to /second-brain', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Second Brain' }).last().click()
  await expect(page).toHaveURL(/\/second-brain/)
})

// The canvas overlays the accessible node list, so we dispatch the click directly on the button
// (bypasses coordinate hit-testing; React's delegated handler still fires). Real roots are empty,
// so children are mocked to give the dive a destination.
test('renders seeded roots, dives into children, and ascends', async ({ page }) => {
  await page.route('**/api/second-brain/nodes/*/children', (route) =>
    route.fulfill({ json: { data: [fakeChild] } })
  )

  await page.goto(`${BASE}/second-brain`)
  await page.waitForLoadState('networkidle')

  const nav = page.locator('.sb-sr-list')
  for (const name of ['Software Engineering', 'Music Learning', 'English Learning']) {
    await expect(nav.getByRole('button', { name: new RegExp(name) })).toBeAttached()
  }

  await nav.getByRole('button', { name: /Software Engineering/ }).dispatchEvent('click')
  await expect(nav.getByRole('button', { name: /E2E Child Topic/ })).toBeAttached()

  await nav.getByRole('button', { name: /^↑ Back/ }).dispatchEvent('click')
  await expect(nav.getByRole('button', { name: /Music Learning/ })).toBeAttached()
})

test('reduced-motion does not break render', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${BASE}/second-brain`)
  await expect(page.getByRole('button', { name: /English Learning/ })).toBeAttached()
})
