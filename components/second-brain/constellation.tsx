'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'
import { NodeList } from './tree-list'
import { useGraphNavigation, type GraphVizNode } from './use-graph-navigation'
import type { SecondBrainNode } from '@/lib/second-brain/types'

// Load the canvas lib ourselves (client-only) so a chunk-load failure is catchable and falls back
// to the list view — next/dynamic's load errors do NOT propagate to a React error boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphComp = ComponentType<any>
type GraphState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; Comp: GraphComp }

// Fall back to the list if the graph chunk fails OR hangs (a stuck import is also a dead page).
const GRAPH_LOAD_TIMEOUT_MS = 6000

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

interface ConstellationProps {
  roots: SecondBrainNode[]
  onOpenNode: (id: string) => void
}

export function Constellation({ roots, onOpenNode }: ConstellationProps) {
  const { graph, focus, focusDocCount, loading, dive, ascend } = useGraphNavigation(roots, onOpenNode)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [graphState, setGraphState] = useState<GraphState>({ status: 'loading' })
  const reduced = prefersReducedMotion()

  useEffect(() => {
    let active = true
    let timedOut = false
    const timer = setTimeout(() => {
      if (!active) return
      timedOut = true
      setGraphState((s) => (s.status === 'loading' ? { status: 'error' } : s))
    }, GRAPH_LOAD_TIMEOUT_MS)
    import('react-force-graph-2d')
      .then((m) => {
        if (!active || timedOut) return // don't flip the user back to the canvas after fallback
        clearTimeout(timer)
        setGraphState({ status: 'ready', Comp: m.default as GraphComp })
      })
      .catch(() => {
        if (!active) return
        clearTimeout(timer)
        setGraphState({ status: 'error' })
      })
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const nodeListProps = { graph, focus, focusDocCount, onDive: dive, onAscend: ascend, onOpenNode }

  // Chunk failed to load -> render the list view instead of a dead page.
  if (graphState.status === 'error') {
    return (
      <div className="sb-stage" ref={containerRef}>
        <NodeList {...nodeListProps} className="sb-fallback-list" />
      </div>
    )
  }

  const Graph = graphState.status === 'ready' ? graphState.Comp : null

  return (
    <div className="sb-stage" ref={containerRef} data-loading={loading || undefined}>
      {/* Visible controls so a focused node's notes + ascend are reachable on the canvas. */}
      {focus && (
        <div className="sb-controls">
          <button type="button" onClick={ascend} className="sb-ascend">
            ↑ Back
          </button>
          <span className="sb-focus-title">{focus.title}</span>
          {focusDocCount > 0 && (
            <button type="button" onClick={() => onOpenNode(focus.id)} className="sb-notes-badge">
              View {focusDocCount} {focusDocCount === 1 ? 'note' : 'notes'}
            </button>
          )}
        </div>
      )}
      {graphState.status === 'loading' && (
        <div className="sb-spinner" role="status" aria-label="Loading constellation" />
      )}
      {Graph && size.w > 0 && (
        <Graph
          width={size.w}
          height={size.h}
          graphData={graph}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={6}
          nodeLabel={(n: object) => (n as GraphVizNode).name}
          linkColor={() => 'rgba(148,163,184,0.35)'}
          linkDirectionalParticles={reduced ? 0 : 2}
          linkDirectionalParticleWidth={2}
          enableNodeDrag={!reduced}
          cooldownTime={reduced ? 0 : 4000}
          onNodeClick={(n: object) => {
            const node = n as GraphVizNode
            if (node.kind === 'core') ascend()
            else dive(node.node)
          }}
          nodeCanvasObject={(n: object, ctx: CanvasRenderingContext2D, scale: number) =>
            paintNode(n as GraphVizNode & { x?: number; y?: number }, ctx, scale)
          }
          nodePointerAreaPaint={(n: object, color: string, ctx: CanvasRenderingContext2D) => {
            const node = n as GraphVizNode & { x?: number; y?: number }
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x ?? 0, node.y ?? 0, node.kind === 'core' ? 14 : 9, 0, 2 * Math.PI)
            ctx.fill()
          }}
        />
      )}

      {/* Accessible mirror of the current level (visually hidden over the canvas). */}
      <div className="sb-sr-only">
        <NodeList {...nodeListProps} className="sb-sr-list" />
      </div>
    </div>
  )
}

function paintNode(
  n: GraphVizNode & { x?: number; y?: number },
  ctx: CanvasRenderingContext2D,
  scale: number
) {
  const x = n.x ?? 0
  const y = n.y ?? 0
  const r = n.kind === 'core' ? 10 : 6
  const grad = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.4)
  grad.addColorStop(0, n.color)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, r * 2.4, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = n.color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fill()
  const fontSize = Math.max(10, 12 / scale)
  ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(226,232,240,0.95)'
  ctx.fillText(n.name, x, y + r + 2)
}
