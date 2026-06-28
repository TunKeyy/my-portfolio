'use client'

import { useState } from 'react'
import { Constellation } from './constellation'
import { NodeDrawer } from './node-drawer'
import type { SecondBrainNode } from '@/lib/second-brain/types'

export function SecondBrainApp({ roots }: { roots: SecondBrainNode[] }) {
  // Drawer target node; Phase 4 renders <NodeDrawer> from this state.
  const [drawerNodeId, setDrawerNodeId] = useState<string | null>(null)

  return (
    <main className="sb-root">
      <header className="sb-topbar">
        <a href="/" className="sb-home-link">
          ← Desktop
        </a>
        <h1 className="sb-title">Second Brain</h1>
      </header>

      <Constellation roots={roots} onOpenNode={setDrawerNodeId} />

      <NodeDrawer
        nodeId={drawerNodeId}
        open={drawerNodeId !== null}
        onClose={() => setDrawerNodeId(null)}
      />
    </main>
  )
}
