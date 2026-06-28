'use client'

import type { GraphData } from './use-graph-navigation'
import type { SecondBrainNode } from '@/lib/second-brain/types'

interface NodeListProps {
  graph: GraphData
  focus: SecondBrainNode | null
  focusDocCount: number
  onDive: (node: SecondBrainNode) => void
  onAscend: () => void
  onOpenNode: (id: string) => void
  className?: string
}

// DOM representation of the current graph level. Rendered visibly as the no-canvas fallback,
// and visually-hidden alongside the canvas for keyboard a11y + deterministic e2e selection.
export function NodeList({
  graph,
  focus,
  focusDocCount,
  onDive,
  onAscend,
  onOpenNode,
  className,
}: NodeListProps) {
  const orbit = graph.nodes.filter((n) => n.kind !== 'core')
  return (
    <nav className={className} aria-label="Knowledge graph navigation">
      {focus && (
        <div className="sb-list-header">
          <button type="button" onClick={onAscend} className="sb-ascend">
            ↑ Back
          </button>
          <h2 className="sb-focus-title">{focus.title}</h2>
          {focusDocCount > 0 && (
            <button type="button" onClick={() => onOpenNode(focus.id)} className="sb-notes-badge">
              View {focusDocCount} {focusDocCount === 1 ? 'note' : 'notes'}
            </button>
          )}
        </div>
      )}
      <ul className="sb-node-list">
        {orbit.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onDive(n.node)}
              style={{ ['--sb-node-color' as string]: n.color }}
            >
              {n.node.icon ? `${n.node.icon} ` : ''}
              {n.name}
            </button>
          </li>
        ))}
        {orbit.length === 0 && !focus && <li className="sb-empty">No domains yet.</li>}
      </ul>
    </nav>
  )
}
