'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

const NAV = [
  {
    category: 'Guides',
    items: [{ slug: 'claude-code-cookbook', title: 'Claude Code Cookbook' }],
  },
]

export function DocsSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname()
  return (
    <aside
      className={`fixed md:sticky top-0 left-0 h-screen w-64 z-40 md:z-0 bg-white dark:bg-[#0a0a14] border-r border-black/5 dark:border-white/10 overflow-y-auto transition-transform ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <button className="md:hidden absolute top-4 right-4 p-2" onClick={onClose}>
        <X className="w-5 h-5" />
      </button>
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4">Docs</h2>
        {NAV.map(group => (
          <div key={group.category} className="mb-6">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {group.category}
            </div>
            {group.items.map(it => {
              const href = `/docs/${it.slug}`
              const active = path === href
              return (
                <Link
                  key={it.slug}
                  href={href}
                  onClick={onClose}
                  className={`block px-3 py-1.5 rounded-md text-sm ${active ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  {it.title}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </aside>
  )
}
