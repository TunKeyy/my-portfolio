import { describe, it, expect, vi } from 'vitest'
import { moveNode } from '../src/tools'
import { mockClient } from './mock-client'

const deps = () => ({ revalidate: vi.fn().mockResolvedValue(undefined) })

describe('moveNode cycle check', () => {
  it('rejects moving a node under its own descendant (cycle)', async () => {
    const d = deps()
    // resolvePath('child') -> child; walk ancestors of child: child.parent_id === 'parent' (the node moving)
    const client = mockClient([
      { data: [{ id: 'child' }] }, // resolvePath newParentPath
      { data: { parent_id: 'parent' } }, // ancestor walk: child's parent is the node being moved
    ])
    await expect(
      moveNode(client, { id: 'parent', newParentPath: 'child' }, d)
    ).rejects.toThrow(/cycle/)
    expect(d.revalidate).not.toHaveBeenCalled()
  })

  it('moves a node to a non-ancestor parent and revalidates', async () => {
    const d = deps()
    const client = mockClient([
      { data: [{ id: 'np' }] }, // resolvePath
      { data: { parent_id: null } }, // ancestor walk ends (np is a root)
      { error: null }, // update
    ])
    const res = await moveNode(client, { id: 'n', newParentPath: 'np' }, d)
    expect(res).toMatchObject({ status: 'moved', id: 'n' })
    expect(d.revalidate).toHaveBeenCalledOnce()
  })
})
