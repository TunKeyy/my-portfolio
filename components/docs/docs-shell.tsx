'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { DocsSidebar } from './docs-sidebar'
import { DocsTOC } from './docs-toc'
import { BackToDesktop } from './back-to-desktop'

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Escape key + body scroll lock while drawer open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100">
      <BackToDesktop />
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/80 dark:bg-white/10 backdrop-blur"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="grid md:grid-cols-[260px_1fr_240px] gap-0 max-w-[1400px] mx-auto">
        <DocsSidebar open={open} onClose={() => setOpen(false)} />
        <main className="px-6 md:px-12 py-12 min-w-0">{children}</main>
        <aside className="hidden lg:block sticky top-0 h-screen overflow-y-auto py-12 pr-6">
          <DocsTOC />
        </aside>
      </div>
    </div>
  )
}
