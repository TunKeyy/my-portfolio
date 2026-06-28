'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

type DocEntry = {
  slug: string
  title: string
  headings: { id: string; text: string }[]
  snippets: string[]
}

type SearchResult = {
  slug: string
  title: string
  hit: string
  anchor?: string
}

export function DocsSearch() {
  const [open, setOpen] = useState(false)
  const [docs, setDocs] = useState<DocEntry[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open && !docs) {
      fetch('/docs-search-index.json')
        .then(r => r.json())
        .then(setDocs)
        .catch(err => console.error('Failed to load search index:', err))
    }
  }, [open, docs])

  const results = useMemo<SearchResult[]>(() => {
    if (!docs || !q.trim()) return []
    const ql = q.toLowerCase()
    const out: SearchResult[] = []
    for (const d of docs) {
      if (d.title.toLowerCase().includes(ql)) {
        out.push({ slug: d.slug, title: d.title, hit: d.title })
      }
      d.headings.forEach((h, i) => {
        if (h.text.toLowerCase().includes(ql) || (d.snippets[i] ?? '').toLowerCase().includes(ql)) {
          out.push({ slug: d.slug, title: d.title, hit: h.text, anchor: h.id })
        }
      })
    }
    return out.slice(0, 30)
  }, [docs, q])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white dark:bg-[#1c1c1e] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 dark:border-white/10">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search docs..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button onClick={() => setOpen(false)} aria-label="Close search">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {results.length === 0 && q.trim() && (
            <li className="px-4 py-6 text-sm text-gray-500 text-center">No results</li>
          )}
          {results.map((r) => (
            <li key={`${r.slug}-${r.anchor ?? ''}`}>
              <Link
                href={r.anchor ? `/docs/${r.slug}#${r.anchor}` : `/docs/${r.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="text-sm font-medium">{r.hit}</div>
                {r.hit !== r.title && <div className="text-xs text-gray-500">{r.title}</div>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
