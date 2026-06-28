'use client'
import { useEffect, useState } from 'react'

type Heading = { id: string; text: string; level: number }

export function DocsTOC() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('article h2, article h3')) as HTMLElement[]
    setHeadings(els.map(e => ({ id: e.id, text: e.innerText, level: e.tagName === 'H2' ? 2 : 3 })))

    const obs = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    els.forEach(e => obs.observe(e))
    return () => obs.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="text-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">On this page</div>
      <ul className="space-y-1">
        {headings.map(h => (
          <li key={h.id} style={{ paddingLeft: (h.level - 2) * 12 }}>
            <a
              href={`#${h.id}`}
              className={`block py-0.5 ${
                active === h.id
                  ? 'text-indigo-500 font-medium'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
