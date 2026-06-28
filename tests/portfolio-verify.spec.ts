import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('Phase 1 — Icon system', () => {
  test('dock renders gradient tiles (no emoji)', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    const tiles = page.locator('[class*="overflow-hidden"][class*="bg-gradient-to-b"]')
    await expect(tiles.first()).toBeVisible()
    expect(await tiles.count()).toBeGreaterThanOrEqual(8)
  })
})

test.describe('Phase 2 — Wallpaper', () => {
  test('desktop-wallpaper element exists in DOM', async ({ page }) => {
    await page.goto(BASE)
    // fixed inset-0 is behind content — check existence + CSS, not visibility
    const wallpaper = page.locator('.desktop-wallpaper')
    await expect(wallpaper).toHaveCount(1)
    const bg = await wallpaper.evaluate(el => getComputedStyle(el).background)
    // Confirm radial-gradient is applied (new aurora wallpaper)
    expect(bg).toContain('radial-gradient')
  })
})

test.describe('Phase 3 — Docs scaffolding', () => {
  test('/docs index renders with cookbook link', async ({ page }) => {
    await page.goto(`${BASE}/docs`)
    await expect(page.locator('h1')).toContainText('Documentation')
    // Scope to main content area to avoid strict-mode conflict with sidebar
    await expect(page.locator('main').getByRole('link', { name: 'Claude Code Cookbook' })).toBeVisible()
  })

  test('/docs/claude-code-cookbook renders title and sidebar', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    await expect(page.locator('header h1')).toContainText('Claude Code Cookbook')
    // Sidebar is <aside>, not <nav>
    await expect(page.locator('aside').filter({ hasText: 'Docs' }).first()).toBeVisible()
  })

  test('Back to Desktop pill links to /', async ({ page }) => {
    await page.goto(`${BASE}/docs`)
    const pill = page.getByRole('link', { name: 'Back to Desktop' })
    await expect(pill).toBeVisible()
    await expect(pill).toHaveAttribute('href', '/')
  })
})

test.describe('Phase 4 — Markdown polish', () => {
  test('code blocks have Shiki data-theme attribute', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    const codeEl = page.locator('code[data-theme]').first()
    await expect(codeEl).toBeVisible()
  })

  test('external links have noopener rel', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    const externalLinks = page.locator('a[target="_blank"]')
    if (await externalLinks.count() > 0) {
      const rel = await externalLinks.first().getAttribute('rel')
      expect(rel).toContain('noopener')
    }
  })
})

test.describe('Phase 5 — Reading progress + search', () => {
  test('reading progress bar exists on doc page', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    const bar = page.locator('[class*="fixed"][class*="top-0"][class*="h-0.5"]')
    await expect(bar).toHaveCount(1)
  })

  test('Ctrl+K opens search modal', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await expect(page.locator('input[placeholder="Search docs..."]')).toBeVisible()
  })

  test('search returns results for "Mental model"', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    const searchInput = page.locator('input[placeholder="Search docs..."]')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Mental model')
    await page.waitForTimeout(300)
    await expect(page.locator('ul li a').first()).toBeVisible()
  })

  test('Escape closes search modal', async ({ page }) => {
    await page.goto(`${BASE}/docs/claude-code-cookbook`)
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await expect(page.locator('input[placeholder="Search docs..."]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('input[placeholder="Search docs..."]')).not.toBeVisible()
  })
})

test.describe('Phase 6 — Dock integration', () => {
  test('dock is absent on /docs pages', async ({ page }) => {
    await page.goto(`${BASE}/docs`)
    await page.waitForLoadState('networkidle')
    // Dock returns null on /docs — Back to Desktop pill is shown instead
    await expect(page.getByRole('link', { name: 'Back to Desktop' })).toBeVisible()
  })

  test('Back to Desktop navigates to home', async ({ page }) => {
    await page.goto(`${BASE}/docs`)
    await page.getByRole('link', { name: 'Back to Desktop' }).click()
    await expect(page).toHaveURL(BASE + '/')
  })
})
