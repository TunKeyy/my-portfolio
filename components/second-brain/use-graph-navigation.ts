'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SecondBrainDocument, SecondBrainNode } from '@/lib/second-brain/types'

const DEFAULT_COLOR = '#8b5cf6'

export interface GraphVizNode {
  id: string
  name: string
  color: string
  kind: 'root' | 'core' | 'child'
  node: SecondBrainNode
}
export interface GraphVizLink {
  source: string
  target: string
}
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

export function buildGraphData(
  focus: SecondBrainNode | null,
  children: SecondBrainNode[],
  roots: SecondBrainNode[]
): GraphData {
  if (!focus) {
    return { nodes: roots.map((n) => toViz(n, 'root')), links: [] }
  }
  return {
    nodes: [toViz(focus, 'core'), ...children.map((c) => toViz(c, 'child'))],
    links: children.map((c) => ({ source: focus.id, target: c.id })),
  }
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
  focusDocCount: number
  loading: boolean
  dive: (node: SecondBrainNode) => void
  ascend: () => void
}

export function useGraphNavigation(
  roots: SecondBrainNode[],
  onOpenNode?: (id: string) => void
): UseGraphNavigation {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, dispatch] = useReducer(graphNavReducer, { stack: [] })
  const [children, setChildren] = useState<SecondBrainNode[]>([])
  const [focusDocCount, setFocusDocCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const hadFocus = useRef(false) // true once the user has focused a node (gates URL reset-to-roots)
  const prefetched = useRef<Map<string, SecondBrainNode[]>>(new Map()) // dive-fetched children, reused by the effect
  const diveSeq = useRef(0) // ignore superseded dive clicks
  const focus = currentFocus(state)

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

  // Single source of truth: load the focused node's children + note count, and sync the URL.
  useEffect(() => {
    if (!focus) {
      setChildren([])
      setFocusDocCount(0)
      // Only reset the URL after a real focus existed — never strip a deep link on first paint.
      if (hadFocus.current) router.replace('/second-brain', { scroll: false })
      return
    }
    hadFocus.current = true
    let active = true
    setLoading(true)
    // Reuse children already fetched by dive() for this node (no second request, no split-brain).
    const seeded = prefetched.current.get(focus.id)
    prefetched.current.delete(focus.id)
    const childrenPromise = seeded ? Promise.resolve(seeded) : fetchChildren(focus.id)
    Promise.all([childrenPromise, fetchNode(focus.id)]).then(([kids, bundle]) => {
      if (!active) return
      setChildren(kids)
      setFocusDocCount(bundle?.documents.length ?? 0)
      setLoading(false)
    })
    router.replace(`/second-brain${searchForFocus(focus.id)}`, { scroll: false })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.id])

  // Fetch children once to decide: dive if any (seed them for the effect), else open the leaf's notes.
  const dive = useCallback(
    (node: SecondBrainNode) => {
      const seq = ++diveSeq.current
      setLoading(true)
      fetchChildren(node.id).then((kids) => {
        if (seq !== diveSeq.current) return // a newer click superseded this one
        if (kids.length > 0) {
          prefetched.current.set(node.id, kids)
          dispatch({ type: 'DIVE', node })
        } else {
          setLoading(false)
          onOpenNode?.(node.id)
        }
      })
    },
    [onOpenNode]
  )

  const ascend = useCallback(() => dispatch({ type: 'ASCEND' }), [])

  return { graph: buildGraphData(focus, children, roots), focus, focusDocCount, loading, dive, ascend }
}
