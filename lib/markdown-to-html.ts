import { unified, type Plugin } from 'unified'
import type { Root } from 'hast'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

const PRETTY_OPTIONS: PrettyCodeOptions = {
  theme: { light: 'github-light', dark: 'github-dark' },
  keepBackground: false,
}

// Turn ```mermaid fences into <pre class="mermaid">source</pre>. The client (useMermaid) renders
// these to SVG at runtime; the <pre> + class survive the HTML sanitizer allowlist. Must run BEFORE
// rehype-pretty-code so the diagram source isn't tokenized into highlight spans.
const rehypeMermaid: Plugin<[], Root> = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toText = (node: any): string =>
    node?.type === 'text'
      ? node.value ?? ''
      : Array.isArray(node?.children)
        ? node.children.map(toText).join('')
        : ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMermaidPre = (node: any): boolean => {
    if (node?.tagName !== 'pre' || !Array.isArray(node.children)) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = node.children.find((c: any) => c?.tagName === 'code')
    const cls = code?.properties?.className
    return Array.isArray(cls) && cls.includes('language-mermaid')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (node: any): any => {
    if (isMermaidPre(node)) {
      return {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: toText(node) }],
      }
    }
    if (Array.isArray(node?.children)) node.children = node.children.map(transform)
    return node
  }

  return (tree) => {
    transform(tree)
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeMermaid)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    // Cast required: unified's .use() overloads don't widen to generic Plugin<[Options]>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(rehypePrettyCode as any, PRETTY_OPTIONS)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}
