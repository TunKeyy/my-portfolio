import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { triggerRevalidate } from '../src/revalidate'

describe('triggerRevalidate', () => {
  beforeEach(() => {
    process.env.REVALIDATE_URL = 'https://example.test/api/second-brain/revalidate'
    process.env.REVALIDATE_TOKEN = 'tok'
  })
  afterEach(() => {
    delete process.env.REVALIDATE_URL
    delete process.env.REVALIDATE_TOKEN
  })

  it('succeeds with a bearer token on 2xx', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await triggerRevalidate({ fetchFn: fetchFn as never })
    expect(fetchFn).toHaveBeenCalledOnce()
    const [, init] = fetchFn.mock.calls[0]
    expect((init as { headers: Record<string, string> }).headers.authorization).toBe('Bearer tok')
  })

  it('fails LOUD (throws) after retries on persistent failure', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(
      triggerRevalidate({ fetchFn: fetchFn as never, backoffMs: 0, retries: 2 })
    ).rejects.toThrow(/revalidate failed after 2 attempts/)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('throws when the network call rejects', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    await expect(
      triggerRevalidate({ fetchFn: fetchFn as never, backoffMs: 0, retries: 1 })
    ).rejects.toThrow(/revalidate failed/)
  })

  it('throws when not configured (no env)', async () => {
    delete process.env.REVALIDATE_URL
    await expect(triggerRevalidate({ fetchFn: vi.fn() as never })).rejects.toThrow(/not configured/)
  })
})
