import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'content/docs')

export interface DocMeta {
  slug: string
  title: string
  description: string
  category: string
  order: number
}

export interface Doc extends DocMeta {
  content: string
}

export async function getAllDocs(): Promise<DocMeta[]> {
  const files = await fs.readdir(DOCS_DIR)
  const docs = await Promise.all(
    files.filter(f => f.endsWith('.md')).map(async f => {
      const raw = await fs.readFile(path.join(DOCS_DIR, f), 'utf8')
      const { data } = matter(raw)
      return { slug: f.replace(/\.md$/, ''), ...data } as DocMeta
    })
  )
  return docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export async function getDocBySlug(slug: string): Promise<Doc | null> {
  // Validate slug to prevent path traversal
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  const resolved = path.join(DOCS_DIR, `${slug}.md`)
  if (!resolved.startsWith(DOCS_DIR + path.sep)) return null
  try {
    const raw = await fs.readFile(resolved, 'utf8')
    const { data, content } = matter(raw)
    return { slug, content, ...data } as Doc
  } catch {
    return null
  }
}
