import { NextResponse } from 'next/server'
import { cachedRoots } from '@/lib/second-brain/cached-queries'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await cachedRoots()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'second brain unavailable' }, { status: 503 })
  }
}
