'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SecondBrainDocument, SecondBrainNode } from '@/lib/second-brain/types'

const DEFAULT_COLOR = '#8b5cf6'

// Synthetic hub at the centre of every level: small, yellow, textless. Clicking it ascends.
export const CENTER_ID = '__center__'
const CENTER_COLOR = '#facc15'

export interface GraphVizNode {
  id: string
  name: string
  color: string
  kind: 'root' | 'core' | 'child' | 'document'
  node: SecondBrainNode | null // null for the synthetic centre hub and document nodes
  doc?: SecondBrainDocument | null // set only for kind 'document'
}
export interface GraphVizLink {
  source: string
  target: string
  kind: 'node' | 'document' // 'document' links render in a distinct (dashed) style
}

const DOC_COLOR = '#38bdf8'
const DOC_PREFIX = 'doc:' // namespaces document node ids so they never collide with node ids
export interface GraphData {
  nodes: GraphVizNode[]
  links: GraphVizLink[]
}

// ---- Pure focus-stack logic (unit-tested without React) ----

export interface NavState {
  stack: SecondBrainNode[]
}
export type NavAction =
  | { type: 'DIVE'; node: SecondBrainNode }
  | { type: 'ASCEND' }
  | { type: 'RESET' }
  | { type: 'SET_FOCUS'; node: SecondBrainNode }

export function graphNavReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'DIVE':
      return { stack: [...state.stack, action.node] }
    case 'ASCEND':
      return { stack: state.stack.slice(0, -1) } // root ascend ([]) is a no-op
    case 'RESET':
      return { stack: [] }
    case 'SET_FOCUS':
      return { stack: [action.node] } // deep-link: focus directly, ascend returns to roots
    default:
      return state
  }
}

export function currentFocus(state: NavState): SecondBrainNode | null {
  return state.stack[state.stack.length - 1] ?? null
}

function toViz(n: SecondBrainNode, kind: GraphVizNode['kind']): GraphVizNode {
  return { id: n.id, name: n.title, color: n.color ?? DEFAULT_COLOR, kind, node: n }
}

// Every level is a star: a textless yellow centre hub (ascend) with the level's nodes orbiting it
// (solid links). Each orbit node carries its own documents as small satellite nodes joined directly
// to it by a distinct (dashed) link — so a node's documents are visible at the node, no dive needed.
export function buildGraphData(
  focus: SecondBrainNode | null,
  children: SecondBrainNode[],
  roots: SecondBrainNode[],
  docsByNode: Record<string, SecondBrainDocument[]>
): GraphData {
  const orbit = focus ? children : roots
  const orbitKind: GraphVizNode['kind'] = focus ? 'child' : 'root'
  const nodes: GraphVizNode[] = [
    { id: CENTER_ID, name: '', color: CENTER_COLOR, kind: 'core', node: null },
  ]
  const links: GraphVizLink[] = []
  for (const n of orbit) {
    nodes.push(toViz(n, orbitKind))
    links.push({ source: CENTER_ID, target: n.id, kind: 'node' })
    for (const d of docsByNode[n.id] ?? []) {
      nodes.push({ id: DOC_PREFIX + d.id, name: d.title, color: DOC_COLOR, kind: 'document', node: null, doc: d })
      links.push({ source: n.id, target: DOC_PREFIX + d.id, kind: 'document' })
    }
  }
  return { nodes, links }
}

export function focusIdFromSearch(search: string): string | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return params.get('node')
}

export function searchForFocus(focusId: string | null): string {
  return focusId ? `?node=${encodeURIComponent(focusId)}` : ''
}

// ---- Fetch helpers (never throw; degrade to empty/null) ----

export async function fetchChildren(id: string): Promise<SecondBrainNode[]> {
  try {
    const res = await fetch(`/api/second-brain/nodes/${id}/children`)
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []) as SecondBrainNode[]
  } catch {
    return []
  }
}

export interface NodeBundle {
  node: SecondBrainNode
  documents: SecondBrainDocument[]
}
export async function fetchNode(id: string): Promise<NodeBundle | null> {
  try {
    const res = await fetch(`/api/second-brain/nodes/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return (json.data ?? null) as NodeBundle | null
  } catch {
    return null
  }
}

// ---- React hook ----

export interface UseGraphNavigation {
  graph: GraphData
  focus: SecondBrainNode | null
  loading: boolean
  dive: (node: SecondBrainNode) => void
  ascend: () => void
}

export function useGraphNavigation(roots: SecondBrainNode[]): UseGraphNavigation {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, dispatch] = useReducer(graphNavReducer, { stack: [] })
  const [children, setChildren] = useState<SecondBrainNode[]>([])
  // Documents for every node in the current orbit, keyed by node id — rendered as satellites.
  const [docsByNode, setDocsByNode] = useState<Record<string, SecondBrainDocument[]>>({})
  const [loading, setLoading] = useState(false)
  const hadFocus = useRef(false) // true once the user has focused a node (gates URL reset-to-roots)
  const seededChildren = useRef<Map<string, SecondBrainNode[]>>(new Map()) // dive-fetched, reused by effect
  const diveSeq = useRef(0) // ignore superseded dive clicks
  const docsSeq = useRef(0) // ignore superseded orbit-docs fetches
  const focus = currentFocus(state)

  // Fetch each orbit node's documents in parallel and publish them keyed by node id.
  const loadOrbitDocs = useCallback((orbit: SecondBrainNode[]) => {
    const seq = ++docsSeq.current
    setDocsByNode({})
    if (orbit.length === 0) return
    Promise.all(
      orbit.map((n) => fetchNode(n.id).then((b) => [n.id, b?.documents ?? []] as const))
    ).then((entries) => {
      if (seq !== docsSeq.current) return // a newer orbit superseded this fetch
      setDocsByNode(Object.fromEntries(entries))
    })
  }, [])

  // Resolve a ?node= deep link once on mount; stale/deleted id falls back to roots.
  useEffect(() => {
    const id = focusIdFromSearch(searchParams.toString())
    if (!id) return
    let active = true
    setLoading(true)
    fetchNode(id).then((bundle) => {
      if (!active) return
      dispatch(bundle ? { type: 'SET_FOCUS', node: bundle.node } : { type: 'RESET' })
      setLoading(false)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Single source of truth: load the focused node's children, fetch the orbit's docs, sync the URL.
  useEffect(() => {
    if (!focus) {
      setChildren([])
      loadOrbitDocs(roots) // roots are the orbit at the top level
      if (hadFocus.current) router.replace('/second-brain', { scroll: false })
      return
    }
    hadFocus.current = true
    let active = true
    setLoading(true)
    const seeded = seededChildren.current.get(focus.id)
    seededChildren.current.delete(focus.id)
    const childrenPromise = seeded ? Promise.resolve(seeded) : fetchChildren(focus.id)
    childrenPromise.then((kids) => {
      if (!active) return
      setChildren(kids)
      setLoading(false)
      loadOrbitDocs(kids)
    })
    router.replace(`/second-brain${searchForFocus(focus.id)}`, { scroll: false })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.id])

  // Dive only into nodes that have children; a node's own documents are already shown (as satellites)
  // at this level, so a childless node is not something to enter.
  const dive = useCallback((node: SecondBrainNode) => {
    const seq = ++diveSeq.current
    setLoading(true)
    fetchChildren(node.id).then((kids) => {
      if (seq !== diveSeq.current) return // a newer click superseded this one
      if (kids.length > 0) {
        seededChildren.current.set(node.id, kids)
        dispatch({ type: 'DIVE', node })
      } else {
        setLoading(false) // leaf — open a document via its satellite instead
      }
    })
  }, [])

  const ascend = useCallback(() => dispatch({ type: 'ASCEND' }), [])

  return { graph: buildGraphData(focus, children, roots, docsByNode), focus, loading, dive, ascend }
}
