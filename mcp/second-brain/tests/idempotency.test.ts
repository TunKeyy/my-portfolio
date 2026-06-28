import { describe, it, expect, vi } from 'vitest'
import { addNote } from '../src/tools'
import { mockClient, callsOf } from './mock-client'

describe('addNote idempotency', () => {
  it('a duplicate (node_id, title) returns already_exists and inserts only once', async () => {
    const revalidate = vi.fn().mockResolvedValue(undefined)
    const client = mockClient([
      // first call: resolvePath, existing(empty), insert
      { data: [{ id: 'n1' }] },
      { data: [] },
      { data: { id: 'doc1' } },
      // second call: resolvePath, existing(found) -> short-circuits
      { data: [{ id: 'n1' }] },
      { data: [{ id: 'doc1' }] },
    ])
    const input = { nodePath: 'A', title: 'Same Title', body: '<p>x</p>' }

    const first = await addNote(client, input, { revalidate })
    expect(first).toMatchObject({ status: 'created', id: 'doc1' })

    const second = await addNote(client, input, { revalidate })
    expect(second).toMatchObject({ status: 'already_exists', id: 'doc1' })

    const inserts = callsOf(client).filter((c) => c[0] === 'insert')
    expect(inserts).toHaveLength(1)
    expect(revalidate).toHaveBeenCalledOnce() // only the real insert triggers revalidation
  })
})
