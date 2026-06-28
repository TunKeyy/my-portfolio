import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'
import { SECOND_BRAIN_TAG } from '@/lib/second-brain/cached-queries'

export const runtime = 'nodejs'

// Constant-time bearer-token check. Length mismatch short-circuits (timingSafeEqual requires equal length).
function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_TOKEN
  if (!expected) {
    // Fail closed: never accept writes when the secret is not configured.
    return NextResponse.json({ error: 'not configured' }, { status: 401 })
  }
  const auth = req.headers.get('authorization') ?? ''
  const provided = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : ''
  if (!provided || !tokenMatches(provided, expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  // { expire: 0 } = immediate expiry (Next's documented webhook/third-party pattern): the next
  // reader after an MCP write sees fresh content, so synced notes appear without an extra visit.
  revalidateTag(SECOND_BRAIN_TAG, { expire: 0 })
  return NextResponse.json({ revalidated: true })
}
