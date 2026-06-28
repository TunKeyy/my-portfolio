// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const replace = vi.fn()
const search = { value: '' }
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(search.value),
}))

import { useGraphNavigation } from '@/components/second-brain/use-graph-navigation'
import type { SecondBrainNode } from '@/lib/second-brain/types'

function node(id: string, parent: string | null = null): SecondBrainNode {
  return {
    id,
    parent_id: parent,
    title: id.toUpperCase(),
    slug: id,
    description: null,
    color: '#fff',
    icon: null,
    sort_order: 0,
    created_at: '',
    updated_at: '',
  }
}

const roots = [node('a'), node('b')]

interface Handler {
  match: RegExp
  body?: unknown
  ok?: boolean
  status?: number
}
function stubFetch(handlers: Handler[]) {
  const fn = vi.fn(async (url: string) => {
    const h = handlers.find((x) => x.match.test(url))
    if (!h) return { ok: false, status: 404, json: async () => ({}) }
    return { ok: h.ok ?? true, status: h.status ?? 200, json: async () => h.body }
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('useGraphNavigation hook', () => {
  beforeEach(() => {
    replace.mockClear()
    search.value = ''
  })
  afterEach(() => vi.unstubAllGlobals())

  it('renders roots initially (around the centre hub)', () => {
    stubFetch([])
    const { result } = renderHook(() => useGraphNavigation(roots))
    const orbit = result.current.graph.nodes.filter((n) => n.kind !== 'core')
    expect(orbit.map((n) => n.id)).toEqual(['a', 'b'])
    expect(result.current.focus).toBeNull()
  })

  it('dive into a leaf (no children) opens its notes, does not change focus', async () => {
    stubFetch([{ match: /\/children$/, body: { data: [] } }])
    const onOpenNode = vi.fn()
    const { result } = renderHook(() => useGraphNavigation(roots, onOpenNode))
    result.current.dive(node('a'))
    await waitFor(() => expect(onOpenNode).toHaveBeenCalledWith('a'))
    expect(result.current.focus).toBeNull()
  })

  it('dive into a parent focuses it and fetches children exactly once (no double-fetch)', async () => {
    const fetchFn = stubFetch([
      { match: /\/children$/, body: { data: [node('a1', 'a')] } },
      { match: /\/nodes\/a$/, body: { data: { node: node('a'), documents: [] } } },
    ])
    const onOpenNode = vi.fn()
    const { result } = renderHook(() => useGraphNavigation(roots, onOpenNode))
    result.current.dive(node('a'))
    await waitFor(() => expect(result.current.focus?.id).toBe('a'))
    expect(result.current.graph.nodes.some((n) => n.id === 'a1')).toBe(true)
    expect(onOpenNode).not.toHaveBeenCalled()
    const childrenCalls = fetchFn.mock.calls.filter(([u]) => /\/children$/.test(u as string))
    expect(childrenCalls).toHaveLength(1)
  })

  it('stale ?node= deep link falls back to roots (RESET), no crash', async () => {
    search.value = 'node=missing'
    stubFetch([{ match: /\/nodes\/missing$/, ok: false, status: 404 }])
    const { result } = renderHook(() => useGraphNavigation(roots))
    await waitFor(() => expect(result.current.focus).toBeNull())
    const orbit = result.current.graph.nodes.filter((n) => n.kind !== 'core')
    expect(orbit.map((n) => n.id)).toEqual(['a', 'b'])
  })

  it('valid ?node= deep link focuses that node', async () => {
    search.value = 'node=a'
    stubFetch([
      { match: /\/nodes\/a$/, body: { data: { node: node('a'), documents: [] } } },
      { match: /\/children$/, body: { data: [] } },
    ])
    const { result } = renderHook(() => useGraphNavigation(roots))
    await waitFor(() => expect(result.current.focus?.id).toBe('a'))
  })
})
