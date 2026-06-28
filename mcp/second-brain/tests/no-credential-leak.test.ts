import { describe, it, expect, vi, afterEach } from 'vitest'
import { scrubError } from '../src/supabase'
import { createNode } from '../src/tools'
import { mockClient } from './mock-client'

const URL_SENTINEL = 'https://secretproject123.supabase.co'
const KEY_SENTINEL = 'sb_secret_ABCDEF0123456789'
const TOKEN_SENTINEL = 'eyJhbGc.eyJzdWI.signature'

describe('credential leak protection', () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('scrubError removes urls, keys, tokens, and aws keys', () => {
    const dirty = `connect ${URL_SENTINEL} key ${KEY_SENTINEL} token ${TOKEN_SENTINEL} aws AKIAIOSFODNN7EXAMPLE`
    const clean = scrubError(new Error(dirty))
    expect(clean).not.toContain('secretproject123')
    expect(clean).not.toContain(KEY_SENTINEL)
    expect(clean).not.toContain('eyJhbGc')
    expect(clean).not.toContain('AKIAIOSFODNN7EXAMPLE')
  })

  it('a successful tool result never contains env credential values', async () => {
    process.env.SUPABASE_URL = URL_SENTINEL
    process.env.SUPABASE_SERVICE_ROLE_KEY = KEY_SENTINEL
    const client = mockClient([{ data: { id: 'n1' } }])
    const res = await createNode(client, { title: 'React' }, { revalidate: vi.fn().mockResolvedValue(undefined) })
    const serialized = JSON.stringify(res)
    expect(serialized).not.toContain(URL_SENTINEL)
    expect(serialized).not.toContain(KEY_SENTINEL)
  })
})
