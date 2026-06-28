import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const DOCS = path.join(process.cwd(), 'content/docs')
const OUT = path.join(process.cwd(), 'public/docs-search-index.json')

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

async function main() {
  const files = (await fs.readdir(DOCS)).filter(f => f.endsWith('.md'))
  const index: {
    slug: string
    title: string
    headings: { id: string; text: string; level: number }[]
    snippets: string[]
  }[] = []

  for (const f of files) {
    const raw = await fs.readFile(path.join(DOCS, f), 'utf8')
    const { data, content } = matter(raw)
    const headings: { level: number; text: string; id: string; bodyStart: number }[] = []
    const lines = content.split('\n')

    lines.forEach((line, i) => {
      const m = line.match(/^(#{2,4})\s+(.+)$/)
      if (m) headings.push({ level: m[1].length, text: m[2], id: slugify(m[2]), bodyStart: i + 1 })
    })

    const snippets = headings.map(h => {
      const next = headings[headings.indexOf(h) + 1]?.bodyStart ?? lines.length
      return lines
        .slice(h.bodyStart, Math.min(h.bodyStart + 6, next))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 240)
    })

    index.push({
      slug: f.replace(/\.md$/, ''),
      title: (data.title as string) ?? f,
      headings: headings.map(({ bodyStart: _b, ...h }) => h),
      snippets,
    })
  }

  await fs.writeFile(OUT, JSON.stringify(index))
  const stat = await fs.stat(OUT)
  console.log(`search index: ${index.length} docs, ${stat.size} bytes`)
}

main()
