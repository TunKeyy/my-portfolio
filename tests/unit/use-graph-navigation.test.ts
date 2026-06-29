import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  buildGraphData,
  CENTER_ID,
  currentFocus,
  fetchChildren,
  fetchNode,
  focusIdFromSearch,
  graphNavReducer,
  searchForFocus,
  type NavState,
} from '@/components/second-brain/use-graph-navigation'
import type { SecondBrainDocument, SecondBrainNode } from '@/lib/second-brain/types'

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

function doc(id: string, nodeId: string): SecondBrainDocument {
  return {
    id,
    node_id: nodeId,
    title: id.toUpperCase(),
    body: '<p>x</p>',
    body_format: 'html',
    source_url: null,
    tags: [],
    created_at: '',
    updated_at: '',
  }
}

describe('graphNavReducer', () => {
  const empty: NavState = { stack: [] }

  it('dive pushes onto the stack', () => {
    const s1 = graphNavReducer(empty, { type: 'DIVE', node: node('a') })
    expect(s1.stack.map((n) => n.id)).toEqual(['a'])
    const s2 = graphNavReducer(s1, { type: 'DIVE', node: node('b', 'a') })
    expect(s2.stack.map((n) => n.id)).toEqual(['a', 'b'])
  })

  it('ascend pops', () => {
    const s = graphNavReducer({ stack: [node('a'), node('b', 'a')] }, { type: 'ASCEND' })
    expect(s.stack.map((n) => n.id)).toEqual(['a'])
  })

  it('root ascend is a no-op', () => {
    expect(graphNavReducer(empty, { type: 'ASCEND' }).stack).toEqual([])
  })

  it('SET_FOCUS replaces the stack with a single node (deep link)', () => {
    const s = graphNavReducer({ stack: [node('a')] }, { type: 'SET_FOCUS', node: node('z') })
    expect(s.stack.map((n) => n.id)).toEqual(['z'])
  })

  it('RESET clears the stack', () => {
    expect(graphNavReducer({ stack: [node('a')] }, { type: 'RESET' }).stack).toEqual([])
  })
})

describe('currentFocus', () => {
  it('null in roots view', () => expect(currentFocus({ stack: [] })).toBeNull())
  it('top of stack when focused', () =>
    expect(currentFocus({ stack: [node('a'), node('b', 'a')] })?.id).toBe('b'))
})

describe('buildGraphData', () => {
  it('roots view: yellow centre hub + roots, solid links hub->root', () => {
    const g = buildGraphData(null, [], [node('a'), node('b')], {})
    expect(g.nodes[0]).toMatchObject({ id: CENTER_ID, kind: 'core', name: '' })
    expect(g.nodes.slice(1).map((n) => n.id)).toEqual(['a', 'b'])
    expect(g.nodes.slice(1).every((n) => n.kind === 'root')).toBe(true)
    expect(g.links).toEqual([
      { source: CENTER_ID, target: 'a', kind: 'node' },
      { source: CENTER_ID, target: 'b', kind: 'node' },
    ])
  })

  it('focus view: centre hub + children, solid node links', () => {
    const g = buildGraphData(node('a'), [node('b', 'a'), node('c', 'a')], [], {})
    expect(g.nodes[0]).toMatchObject({ id: CENTER_ID, kind: 'core' })
    expect(g.nodes.slice(1).every((n) => n.kind === 'child')).toBe(true)
    expect(g.links).toEqual([
      { source: CENTER_ID, target: 'b', kind: 'node' },
      { source: CENTER_ID, target: 'c', kind: 'node' },
    ])
  })

  it('an orbit node carries its documents as satellites (dashed link node->doc)', () => {
    const g = buildGraphData(node('a'), [node('b', 'a')], [], { b: [doc('d1', 'b')] })
    const docNode = g.nodes.find((n) => n.kind === 'document')
    expect(docNode).toMatchObject({ id: 'doc:d1', kind: 'document', name: 'D1' })
    expect(docNode?.doc?.id).toBe('d1')
    expect(g.links).toEqual([
      { source: CENTER_ID, target: 'b', kind: 'node' },
      { source: 'b', target: 'doc:d1', kind: 'document' },
    ])
  })
})

describe('url helpers', () => {
  it('parses ?node=', () => expect(focusIdFromSearch('?node=abc')).toBe('abc'))
  it('null when absent', () => expect(focusIdFromSearch('?x=1')).toBeNull())
  it('builds the search string', () => {
    expect(searchForFocus('abc')).toBe('?node=abc')
    expect(searchForFocus(null)).toBe('')
  })
})

describe('fetch helpers degrade gracefully', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fetchNode -> null on 404 (stale deep link falls back to roots)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    expect(await fetchNode('missing')).toBeNull()
  })

  it('fetchNode -> null when fetch throws (DB down)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      throw new Error('network')
    }))
    expect(await fetchNode('x')).toBeNull()
  })

  it('fetchChildren -> [] on error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    expect(await fetchChildren('x')).toEqual([])
  })

  it('fetchNode unwraps {data}', async () => {
    const bundle = { node: node('a'), documents: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: bundle }) }))
    expect(await fetchNode('a')).toEqual(bundle)
  })
})
