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
// Generous so a slow first-load / cold compile doesn't prematurely drop to the list.
const GRAPH_LOAD_TIMEOUT_MS = 12000

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null)
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

  // Keep nodes gently drifting (perpetual, subtle) unless reduced-motion is requested, and frame
  // the level so every node is on-screen (critical on small/mobile canvases).
  useEffect(() => {
    const fg = fgRef.current
    if (!fg || graphState.status !== 'ready') return
    if (!reduced) {
      fg.d3Force?.('drift', makeDriftForce())
      fg.d3ReheatSimulation?.()
    }
    const t = setTimeout(() => fgRef.current?.zoomToFit?.(600, 70), 500)
    return () => clearTimeout(t)
    // key on the level (focus id), not the `graph` object — it changes identity every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, graphState.status, focus?.id])

  // Pause the (perpetual) simulation while the tab is hidden so it doesn't burn CPU/battery.
  useEffect(() => {
    if (reduced) return
    const onVis = () => {
      const fg = fgRef.current
      if (!fg) return
      if (document.hidden) fg.pauseAnimation?.()
      else fg.resumeAnimation?.()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [reduced])

  // Re-frame on viewport / orientation change so nodes never end up off-canvas.
  useEffect(() => {
    if (graphState.status !== 'ready' || size.w === 0) return
    const t = setTimeout(() => fgRef.current?.zoomToFit?.(400, 70), 200)
    return () => clearTimeout(t)
  }, [size.w, size.h, graphState.status])

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
          ref={fgRef}
          width={size.w}
          height={size.h}
          graphData={graph}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={6}
          nodeLabel={(n: object) => (n as GraphVizNode).name}
          linkColor={() => 'rgba(250,204,21,0.35)'}
          linkWidth={1}
          linkDirectionalParticles={reduced ? 0 : 2}
          linkDirectionalParticleWidth={2}
          enableNodeDrag={!reduced}
          cooldownTime={reduced ? 0 : Infinity}
          d3AlphaDecay={reduced ? 0.0228 : 0}
          d3VelocityDecay={0.4}
          warmupTicks={30}
          onNodeClick={(n: object) => {
            const node = n as GraphVizNode
            if (node.kind === 'core') ascend()
            else if (node.node) dive(node.node)
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

  // Centre hub: small, yellow, no label (it's the "back" control).
  if (n.kind === 'core') {
    const r = 4
    const glow = ctx.createRadialGradient(x, y, 1, x, y, r * 3)
    glow.addColorStop(0, n.color)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, r * 3, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = n.color
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
    return
  }

  const r = 6
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
  // Constant ~12px on screen (canvas ctx is pre-scaled by `scale`) — readable and zoom-stable.
  const fontSize = 12 / scale
  ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(226,232,240,0.95)'
  const label = n.name.length > 18 ? `${n.name.slice(0, 17)}…` : n.name
  ctx.fillText(label, x, y + r + 2)
}

// d3 force: each node slowly orbits its own spot via a rotating velocity (a distinct phase per node
// keeps them out of sync), so the constellation gently floats around position instead of sitting
// still or vibrating. The spring/charge forces keep the orbit small; the clamp bounds speed.
type SimNode = { vx?: number; vy?: number; _phase?: number }
const MAX_VELOCITY = 0.6
const ORBIT_ACCEL = 0.05
const ORBIT_SPEED = 0.02 // radians per tick (~5s per loop at 60fps)
function makeDriftForce() {
  let nodes: SimNode[] = []
  let tick = 0
  const force = () => {
    tick++
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const phase = node._phase ?? (node._phase = i * 1.7)
      const angle = tick * ORBIT_SPEED + phase
      const vx = (node.vx ?? 0) + Math.cos(angle) * ORBIT_ACCEL
      const vy = (node.vy ?? 0) + Math.sin(angle) * ORBIT_ACCEL
      node.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vx))
      node.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vy))
    }
  }
  force.initialize = (n: SimNode[]) => {
    nodes = n
    tick = 0
  }
  return force
}
