'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackToDesktop() {
  return (
    <Link
      href="/"
      className="fixed top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 text-sm hover:bg-white dark:hover:bg-white/20"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Desktop
    </Link>
  )
}
