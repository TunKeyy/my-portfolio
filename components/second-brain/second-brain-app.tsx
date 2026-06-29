'use client'

import { useState } from 'react'
import { Constellation } from './constellation'
import { DocumentWindow } from './document-window'
import type { SecondBrainDocument, SecondBrainNode } from '@/lib/second-brain/types'

export function SecondBrainApp({ roots }: { roots: SecondBrainNode[] }) {
  // The document opened from a clicked document node; rendered in the content window.
  const [openDoc, setOpenDoc] = useState<SecondBrainDocument | null>(null)

  return (
    <main className="sb-root">
      <header className="sb-topbar">
        <a href="/" className="sb-home-link">
          ← Desktop
        </a>
        <h1 className="sb-title">Second Brain</h1>
      </header>

      <Constellation roots={roots} onOpenDoc={setOpenDoc} />

      <DocumentWindow doc={openDoc} open={openDoc !== null} onClose={() => setOpenDoc(null)} />
    </main>
  )
}
