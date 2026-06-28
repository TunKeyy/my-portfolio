import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const revalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: (...a: unknown[]) => revalidateTag(...a),
  unstable_cache: (fn: unknown) => fn,
}))

import { POST } from '@/app/api/second-brain/revalidate/route'

function post(token?: string) {
  const headers: Record<string, string> = {}
  if (token !== undefined) headers.authorization = `Bearer ${token}`
  return POST(
    new Request('http://localhost/api/second-brain/revalidate', { method: 'POST', headers })
  )
}

describe('revalidate route', () => {
  beforeEach(() => {
    revalidateTag.mockClear()
    process.env.REVALIDATE_TOKEN = 'super-secret-token'
  })
  afterEach(() => {
    delete process.env.REVALIDATE_TOKEN
  })

  it('401 when no token is provided', async () => {
    const res = await post()
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('401 on a wrong token', async () => {
    const res = await post('nope')
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('401 (fail-closed) when REVALIDATE_TOKEN env is unset', async () => {
    delete process.env.REVALIDATE_TOKEN
    const res = await post('super-secret-token')
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('200 and revalidates the shared tag on a correct token', async () => {
    const res = await post('super-secret-token')
    expect(res.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith('second-brain', { expire: 0 })
  })
})
