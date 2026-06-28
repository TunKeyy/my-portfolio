import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

// A root with no children is a leaf -> clicking it opens the drawer for that node.
// We intercept the node endpoint to inject a document with a malicious body, bypassing the
// server sanitizer, to prove the client (real-browser) sanitize neutralizes stored XSS.
const maliciousDoc = {
  id: 'doc-xss',
  node_id: 'n',
  title: 'Dangerous Note',
  body: '<p>safe text</p><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>',
  body_format: 'html',
  source_url: null,
  tags: ['security'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '',
}

test('leaf opens drawer; stored XSS does not execute; Esc closes', async ({ page }) => {
  // Node endpoint (…/nodes/<id>) but NOT …/nodes/<id>/children
  await page.route(
    (url) => /\/api\/second-brain\/nodes\/[^/]+$/.test(url.toString()),
    (route) =>
      route.fulfill({
        json: { data: { node: { id: 'n', title: 'English Learning' }, documents: [maliciousDoc] } },
      })
  )

  await page.goto(`${BASE}/second-brain`)
  await page.waitForLoadState('networkidle')

  // Click a (childless) root via the accessible list -> onOpenNode -> drawer.
  await page.locator('.sb-sr-list').getByRole('button', { name: /English Learning/ }).dispatchEvent('click')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Dangerous Note')).toBeVisible()
  await expect(dialog.getByText('safe text')).toBeVisible()

  // The malicious handlers were stripped — no execution, no surviving attribute/script.
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined()
  expect(await dialog.locator('[onerror]').count()).toBe(0)
  expect(await dialog.locator('script').count()).toBe(0)

  // Filter narrows; Esc closes.
  await dialog.getByPlaceholder('Filter notes…').fill('nomatch')
  await expect(dialog.getByText('No notes yet.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
