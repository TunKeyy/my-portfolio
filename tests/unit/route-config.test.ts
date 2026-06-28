import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const read = (p: string) => readFileSync(path.join(process.cwd(), p), 'utf8')

const ROUTES = [
  'app/api/second-brain/roots/route.ts',
  'app/api/second-brain/nodes/[id]/route.ts',
  'app/api/second-brain/nodes/[id]/children/route.ts',
  'app/api/second-brain/revalidate/route.ts',
]

describe('second-brain route config', () => {
  it('every route pins the nodejs runtime', () => {
    for (const r of ROUTES) {
      expect(read(r)).toMatch(/export const runtime = ['"]nodejs['"]/)
    }
  })

  it('anon key is read from a server-only var, never a NEXT_PUBLIC_ one', () => {
    const src = read('lib/supabase/server-client.ts')
    expect(src).toMatch(/SUPABASE_ANON_KEY/)
    expect(src).not.toMatch(/NEXT_PUBLIC_SUPABASE_ANON/)
  })
})
