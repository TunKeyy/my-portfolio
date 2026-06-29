'use client'

import type { GraphData } from './use-graph-navigation'
import type { SecondBrainDocument, SecondBrainNode } from '@/lib/second-brain/types'

interface NodeListProps {
  graph: GraphData
  focus: SecondBrainNode | null
  onDive: (node: SecondBrainNode) => void
  onAscend: () => void
  onOpenDoc: (doc: SecondBrainDocument) => void
  className?: string
}

// DOM representation of the current graph level. Rendered visibly as the no-canvas fallback,
// and visually-hidden alongside the canvas for keyboard a11y + deterministic e2e selection.
// Concept nodes dive deeper; document nodes open the content window.
export function NodeList({ graph, focus, onDive, onAscend, onOpenDoc, className }: NodeListProps) {
  const orbit = graph.nodes.filter((n) => n.kind !== 'core')
  return (
    <nav className={className} aria-label="Knowledge graph navigation">
      {focus && (
        <div className="sb-list-header">
          <button type="button" onClick={onAscend} className="sb-ascend">
            ↑ Back
          </button>
          <h2 className="sb-focus-title">{focus.title}</h2>
        </div>
      )}
      <ul className="sb-node-list">
        {orbit.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => (n.kind === 'document' ? n.doc && onOpenDoc(n.doc) : n.node && onDive(n.node))}
              style={{ ['--sb-node-color' as string]: n.color }}
            >
              {n.kind === 'document' ? '📄 ' : n.node?.icon ? `${n.node.icon} ` : ''}
              {n.name}
            </button>
          </li>
        ))}
        {orbit.length === 0 && <li className="sb-empty">{focus ? 'Nothing here yet.' : 'No domains yet.'}</li>}
      </ul>
    </nav>
  )
}
