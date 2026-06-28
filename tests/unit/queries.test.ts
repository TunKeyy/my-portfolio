import { describe, it, expect } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getChildren,
  getNodeWithDocuments,
  getRoots,
  searchNodes,
} from '@/lib/second-brain/queries'

type TableResult = { data: unknown; error: unknown }

// Minimal chainable Supabase mock: each builder method records the call and returns itself;
// the builder is thenable (await => the table's configured result), and supports maybeSingle().
function mockClient(byTable: Record<string, TableResult>) {
  const calls: unknown[][] = []
  const builder = (table: string) => {
    const result = byTable[table] ?? { data: null, error: null }
    const b: Record<string, unknown> = {}
    for (const m of ['select', 'is', 'eq', 'ilike', 'order', 'limit']) {
      b[m] = (...args: unknown[]) => {
        calls.push([m, table, ...args])
        return b
      }
    }
    b.maybeSingle = () => {
      calls.push(['maybeSingle', table])
      return Promise.resolve(result)
    }
    b.then = (resolve: (v: TableResult) => unknown) => Promise.resolve(result).then(resolve)
    return b
  }
  const client = {
    from: (table: string) => {
      calls.push(['from', table])
      return builder(table)
    },
    _calls: calls,
  }
  return client as unknown as SupabaseClient & { _calls: unknown[][] }
}

function callsOf(client: unknown): unknown[][] {
  return (client as { _calls: unknown[][] })._calls
}

describe('getRoots', () => {
  it('queries nodes with null parent ordered by sort_order', async () => {
    const rows = [{ id: '1', parent_id: null, title: 'SWE' }]
    const client = mockClient({ nodes: { data: rows, error: null } })
    const res = await getRoots(client)
    expect(res.error).toBeNull()
    expect(res.data).toEqual(rows)
    expect(callsOf(client)).toContainEqual(['is', 'nodes', 'parent_id', null])
  })

  it('returns {error} instead of throwing when the client fails (paused DB)', async () => {
    const client = {
      from: () => {
        throw new Error('connection refused')
      },
    } as unknown as SupabaseClient
    const res = await getRoots(client)
    expect(res.data).toBeNull()
    expect(res.error).toMatch(/connection refused/)
  })

  it('maps a Supabase error object to {error}', async () => {
    const client = mockClient({ nodes: { data: null, error: { message: 'rls denied' } } })
    const res = await getRoots(client)
    expect(res.error).toBe('rls denied')
  })
})

describe('getChildren', () => {
  it('filters by parent_id', async () => {
    const client = mockClient({ nodes: { data: [], error: null } })
    const res = await getChildren(client, 'p1')
    expect(res.data).toEqual([])
    expect(callsOf(client)).toContainEqual(['eq', 'nodes', 'parent_id', 'p1'])
  })
})

describe('getNodeWithDocuments', () => {
  it('returns the node plus its documents', async () => {
    const node = { id: 'n1', title: 'Topic' }
    const docs = [{ id: 'd1', node_id: 'n1', title: 'Note' }]
    const client = mockClient({
      nodes: { data: node, error: null },
      documents: { data: docs, error: null },
    })
    const res = await getNodeWithDocuments(client, 'n1')
    expect(res.error).toBeNull()
    expect(res.data).toEqual({ node, documents: docs })
  })

  it('returns {data:null,error:null} for a missing node (404 contract)', async () => {
    const client = mockClient({
      nodes: { data: null, error: null },
      documents: { data: [], error: null },
    })
    const res = await getNodeWithDocuments(client, 'missing')
    expect(res.data).toBeNull()
    expect(res.error).toBeNull()
  })
})

describe('searchNodes', () => {
  it('escapes LIKE wildcards in the query (no injection of % or _)', async () => {
    const client = mockClient({ nodes: { data: [], error: null } })
    await searchNodes(client, '50%_off')
    const ilike = callsOf(client).find((c) => c[0] === 'ilike') as unknown[]
    expect(ilike[2]).toBe('title')
    expect(ilike[3]).toBe('%50\\%\\_off%')
  })
})
