import { describe, it, expect, vi } from 'vitest'
import { addNote, createNode, deleteNode, deleteNote, getTree, listNotes, search } from '../src/tools'
import { mockClient, callsOf } from './mock-client'

const deps = () => ({ revalidate: vi.fn().mockResolvedValue(undefined) })

describe('createNode', () => {
  it('creates a root node and revalidates', async () => {
    const d = deps()
    const client = mockClient([{ data: { id: 'n1' } }])
    const res = await createNode(client, { title: 'React' }, d)
    expect(res).toMatchObject({ status: 'created', id: 'n1', slug: 'react' })
    expect(d.revalidate).toHaveBeenCalledOnce()
  })

  it('rejects invalid input (missing title)', async () => {
    await expect(createNode(mockClient([]), {}, deps())).rejects.toThrow()
  })
})

describe('search', () => {
  it('escapes ILIKE wildcards (no injection)', async () => {
    const client = mockClient([{ data: [] }])
    await search(client, { query: '50%_x' })
    const ilike = callsOf(client).find((c) => c[0] === 'ilike') as unknown[]
    expect(ilike[3]).toBe('%50\\%\\_x%')
  })

  it('rejects an over-long query (Zod max)', async () => {
    await expect(search(mockClient([]), { query: 'a'.repeat(101) })).rejects.toThrow()
  })
})

describe('getTree (read-only, no revalidate)', () => {
  it('returns the node list', async () => {
    const client = mockClient([{ data: [{ id: 'n1' }, { id: 'n2' }] }])
    const res = await getTree(client)
    expect(res.nodes).toHaveLength(2)
  })
})

describe('addNote validation + publish gate', () => {
  it('rejects a body over the size cap', async () => {
    await expect(
      addNote(mockClient([]), { nodePath: 'A', title: 't', body: 'a'.repeat(100001) }, deps())
    ).rejects.toThrow()
  })

  it('blocks a body containing a secret (sensitive gate)', async () => {
    const d = deps()
    await expect(
      addNote(mockClient([]), { nodePath: 'A', title: 't', body: 'AKIAIOSFODNN7EXAMPLE' }, d)
    ).rejects.toThrow(/blocked: sensitive content/)
    expect(d.revalidate).not.toHaveBeenCalled()
  })

  it('allows a flagged body with allow_sensitive: true', async () => {
    const d = deps()
    const client = mockClient([
      { data: [{ id: 'n1' }] }, // resolvePath
      { data: [] }, // existing-title check
      { data: { id: 'doc1' } }, // insert
    ])
    const res = await addNote(
      client,
      { nodePath: 'A', title: 't', body: '<p>AKIAIOSFODNN7EXAMPLE</p>', allow_sensitive: true },
      d
    )
    expect(res).toMatchObject({ status: 'created', id: 'doc1' })
    expect(d.revalidate).toHaveBeenCalledOnce()
  })
})

describe('listNotes (read-only)', () => {
  it('resolves the node path then returns its documents', async () => {
    const client = mockClient([
      { data: [{ id: 'n1' }] }, // resolvePath
      { data: [{ id: 'd1', title: 't' }] }, // documents
    ])
    const res = await listNotes(client, { nodePath: 'A' })
    expect(res.notes).toEqual([{ id: 'd1', title: 't' }])
  })
})

describe('deleteNote', () => {
  it('deletes by id and revalidates', async () => {
    const d = deps()
    const client = mockClient([{ error: null }])
    const res = await deleteNote(client, { id: 'doc1' }, d)
    expect(res).toMatchObject({ status: 'deleted', id: 'doc1' })
    expect(d.revalidate).toHaveBeenCalledOnce()
  })
})

describe('deleteNode', () => {
  it('deletes a leaf node by path and revalidates', async () => {
    const d = deps()
    const client = mockClient([
      { data: [{ id: 'n1' }] }, // resolvePath
      { data: [] }, // no children
      { error: null }, // delete n1
    ])
    const res = await deleteNode(client, { path: 'A' }, d)
    expect(res).toMatchObject({ status: 'deleted', id: 'n1', removed_nodes: 1 })
    expect(d.revalidate).toHaveBeenCalledOnce()
  })

  it('refuses a node with children unless recursive', async () => {
    const d = deps()
    const client = mockClient([
      { data: [{ id: 'root' }] }, // resolvePath
      { data: [{ id: 'c1' }] }, // has a child
    ])
    await expect(deleteNode(client, { path: 'A' }, d)).rejects.toThrow(/recursive: true/)
    expect(d.revalidate).not.toHaveBeenCalled()
  })

  it('recursive delete removes the subtree child-first', async () => {
    const d = deps()
    const client = mockClient([
      { data: [{ id: 'root' }] }, // resolvePath
      { data: [{ id: 'c1' }] }, // children of root
      { data: [] }, // children of c1
      { error: null }, // delete c1
      { error: null }, // delete root
    ])
    const res = await deleteNode(client, { path: 'A', recursive: true }, d)
    expect(res).toMatchObject({ status: 'deleted', id: 'root', removed_nodes: 2 })
    const deletes = callsOf(client).filter((c) => c[0] === 'eq' && c[2] === 'id')
    expect(deletes.map((c) => c[3])).toEqual(['c1', 'root']) // children before parents
  })

  it('requires path or id', async () => {
    await expect(deleteNode(mockClient([]), {}, deps())).rejects.toThrow(/provide path or id/)
  })
})
