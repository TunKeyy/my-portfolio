import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize, { type Options as SanitizeSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { markdownToHtml } from '@/lib/markdown-to-html'
import type { SecondBrainDocument } from './types'

// jsdom-free sanitizer for the serverless read path. Mirrors the DOMPurify allowlist in
// sanitize-html.ts (kept for the browser/MCP, where a real DOM exists) — DOMPurify's jsdom
// backend can't load on Vercel. hast-util-sanitize works on the syntax tree, no DOM needed.
const SCHEMA: SanitizeSchema = {
  tagNames: [
    'p', 'br', 'hr', 'span', 'div', 'blockquote',
    'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'code', 'pre', 'kbd',
    'ul', 'ol', 'li',
    'a', 'img',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'figure', 'figcaption',
  ],
  attributes: {
    '*': ['className', 'title'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
  },
  // https / mailto only; relative (/path, #anchor) URLs have no protocol and pass through.
  protocols: { href: ['https', 'mailto'], src: ['https'] },
  strip: ['script', 'style'],
  clobber: [],
  clobberPrefix: '',
}

// Hardens every surviving link with safe rel/target (runs after sanitize so they aren't stripped).
function rehypeHardenLinks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (node: any) => {
    if (node?.tagName === 'a' && node.properties?.href) {
      node.properties.rel = ['noopener', 'noreferrer']
      node.properties.target = '_blank'
    }
    node?.children?.forEach(walk)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => walk(tree)
}

const sanitizer = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, SCHEMA)
  .use(rehypeHardenLinks)
  .use(rehypeStringify)

async function sanitizeHtmlSafe(dirty: string): Promise<string> {
  return String(await sanitizer.process(dirty ?? ''))
}

// Server-side render path: markdown -> remark/shiki pipeline; all bodies end as sanitized HTML.
export async function renderDocuments(
  docs: SecondBrainDocument[]
): Promise<SecondBrainDocument[]> {
  return Promise.all(
    docs.map(async (d) => {
      const html = d.body_format === 'markdown' ? await markdownToHtml(d.body ?? '') : d.body ?? ''
      return { ...d, body: await sanitizeHtmlSafe(html), body_format: 'html' as const }
    })
  )
}
