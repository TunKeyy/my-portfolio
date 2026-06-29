import { NextResponse } from 'next/server'
import { cachedNodeWithDocuments } from '@/lib/second-brain/cached-queries'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await cachedNodeWithDocuments(id)
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (e) {
    const debug = new URL(req.url).searchParams.get('debug') === '1'
    const detail = debug
      ? { name: (e as Error)?.name, message: (e as Error)?.message, stack: (e as Error)?.stack?.split('\n').slice(0, 4) }
      : undefined
    return NextResponse.json({ error: 'second brain unavailable', detail }, { status: 503 })
  }
}
