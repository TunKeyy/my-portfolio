import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/lib/second-brain/sanitize-html'

describe('sanitizeHtml', () => {
  it('strips <script>', () => {
    expect(sanitizeHtml('<p>hi</p><script>alert(1)</script>')).not.toMatch(/<script/i)
  })

  it('strips on* event handlers', () => {
    expect(sanitizeHtml('<img src="https://x/y.png" onerror="alert(1)">')).not.toMatch(/onerror/i)
  })

  it('blocks javascript: URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i)
  })

  it('blocks data: URLs', () => {
    expect(sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">')).not.toMatch(/data:/i)
  })

  it('removes svg / math / iframe / object / embed / style vectors', () => {
    const out = sanitizeHtml(
      '<svg><script>alert(1)</script></svg><iframe src="https://x"></iframe><math></math><object></object><embed><style>x</style>'
    )
    expect(out).not.toMatch(/<svg|<iframe|<math|<object|<embed|<style/i)
  })

  it('neutralizes an mXSS-style construct', () => {
    const out = sanitizeHtml('<div><style><img src=x onerror=alert(1)></style></div>')
    expect(out).not.toMatch(/onerror/i)
    expect(out).not.toMatch(/<style/i)
  })

  it('blocks protocol-relative URLs but keeps root-relative', () => {
    expect(sanitizeHtml('<a href="/docs">x</a>')).toContain('href="/docs"')
    expect(sanitizeHtml('<a href="//evil.com">x</a>')).not.toContain('//evil.com')
  })

  it('keeps allowed formatting, code, lists, links, images', () => {
    const out = sanitizeHtml(
      '<p>hi <strong>there</strong></p><pre><code>x</code></pre><ul><li>a</li></ul>' +
        '<a href="https://ex.com">l</a><img src="https://ex.com/a.png" alt="a">'
    )
    expect(out).toContain('<strong>')
    expect(out).toContain('<pre>')
    expect(out).toContain('<code>')
    expect(out).toContain('<li>')
    expect(out).toContain('href="https://ex.com"')
    expect(out).toContain('src="https://ex.com/a.png"')
  })

  it('forces safe rel + target on links', () => {
    const out = sanitizeHtml('<a href="https://ex.com">l</a>')
    expect(out).toContain('rel="noopener noreferrer"')
    expect(out).toContain('target="_blank"')
  })
})
