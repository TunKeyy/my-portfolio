import { describe, it, expect } from 'vitest'
import { markdownToHtml } from '@/lib/markdown-to-html'

describe('markdownToHtml — mermaid fences', () => {
  it('converts a ```mermaid fence into <pre class="mermaid"> with the raw source', async () => {
    const html = await markdownToHtml('```mermaid\nflowchart LR\n  A-->B\n```\n')
    expect(html).toContain('<pre class="mermaid">')
    expect(html).toContain('flowchart LR')
    // source preserved as text, not tokenized into syntax-highlight spans
    expect(html).toContain('A--')
    expect(html).not.toContain('language-mermaid')
  })

  it('still syntax-highlights non-mermaid code fences', async () => {
    const html = await markdownToHtml('```ts\nconst a = 1\n```\n')
    expect(html).not.toContain('class="mermaid"')
    expect(html).toContain('<pre')
  })
})
