import Link from 'next/link'
import { getAllDocs } from '@/lib/docs'

export default async function DocsIndex() {
  const docs = await getAllDocs()
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-gray-500 mb-8">A growing collection of guides and references.</p>
      <ul className="space-y-3">
        {docs.map(d => (
          <li key={d.slug}>
            <Link
              href={`/docs/${d.slug}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {d.title}
            </Link>
            <p className="text-sm text-gray-500">{d.description}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
