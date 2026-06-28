import { NextResponse } from 'next/server'
import { cachedChildren } from '@/lib/second-brain/cached-queries'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await cachedChildren(id)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'second brain unavailable' }, { status: 503 })
  }
}
