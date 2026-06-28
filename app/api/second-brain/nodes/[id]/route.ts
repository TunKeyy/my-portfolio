import { NextResponse } from 'next/server'
import { cachedNodeWithDocuments } from '@/lib/second-brain/cached-queries'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await cachedNodeWithDocuments(id)
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'second brain unavailable' }, { status: 503 })
  }
}
