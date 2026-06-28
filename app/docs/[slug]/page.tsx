import { notFound } from 'next/navigation'
import { getAllDocs, getDocBySlug } from '@/lib/docs'
import { markdownToHtml } from '@/lib/markdown-to-html'
import { DocsContent } from '@/components/docs/docs-content'
import { ReadingProgress } from '@/components/docs/reading-progress'

export async function generateStaticParams() {
  const docs = await getAllDocs()
  return docs.map(d => ({ slug: d.slug }))
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)
  if (!doc) notFound()
  const html = await markdownToHtml(doc.content)
  return (
    <>
      <ReadingProgress />
      <header className="mb-8">
        <h1 className="text-4xl font-bold">{doc.title}</h1>
        <p className="text-gray-500 mt-2">{doc.description}</p>
      </header>
      <DocsContent html={html} />
    </>
  )
}
