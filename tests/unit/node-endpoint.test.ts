import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/second-brain/cached-queries', () => ({
  cachedNodeWithDocuments: vi.fn(),
  SECOND_BRAIN_TAG: 'second-brain',
}))

import { GET } from '@/app/api/second-brain/nodes/[id]/route'
import { cachedNodeWithDocuments } from '@/lib/second-brain/cached-queries'

const mockFn = vi.mocked(cachedNodeWithDocuments)

function get(id: string) {
  return GET(new Request(`http://localhost/api/second-brain/nodes/${id}`), {
    params: Promise.resolve({ id }),
  })
}

// Each test sets its own mock implementation (full override), so no beforeEach reset is needed.
// (mockReset here interacts badly with Vitest's thrown-result tracking and falsely fails the suite.)
describe('node endpoint', () => {
  it('404 for an unknown node id', async () => {
    mockFn.mockResolvedValue(null)
    const res = await get('missing')
    expect(res.status).toBe(404)
  })

  it('503 when the data layer throws (paused DB)', async () => {
    mockFn.mockImplementation(() => {
      throw new Error('db paused')
    })
    const res = await get('x')
    expect(res.status).toBe(503)
  })

  it('200 with data for a known node', async () => {
    mockFn.mockResolvedValue({ node: { id: 'n1' }, documents: [] } as never)
    const res = await get('n1')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.node.id).toBe('n1')
  })
})
