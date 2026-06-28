import { markdownToHtml } from '@/lib/markdown-to-html'
import { sanitizeHtml } from './sanitize-html'
import type { SecondBrainDocument } from './types'

// Server-side render path: markdown -> existing remark/shiki pipeline; all bodies end sanitized HTML.
export async function renderDocuments(
  docs: SecondBrainDocument[]
): Promise<SecondBrainDocument[]> {
  return Promise.all(
    docs.map(async (d) => {
      const html = d.body_format === 'markdown' ? await markdownToHtml(d.body ?? '') : d.body ?? ''
      return { ...d, body: sanitizeHtml(html), body_format: 'html' as const }
    })
  )
}
