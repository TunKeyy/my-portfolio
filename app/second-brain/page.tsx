import { cachedRoots } from '@/lib/second-brain/cached-queries'
import { SecondBrainApp } from '@/components/second-brain/second-brain-app'
import './second-brain.css'

export const runtime = 'nodejs'

export const metadata = {
  title: 'Second Brain',
  description: 'A constellation of what I am learning.',
}

export default async function SecondBrainPage() {
  let roots
  try {
    roots = await cachedRoots()
  } catch (e) {
    // Degraded state distinct from "no nodes" — never a 500. Log the real cause: the message
    // below hides it from public users, but a paused DB and a client crash must be tellable apart.
    console.error('[second-brain] roots query failed:', e)
    return (
      <main className="sb-root">
        <div className="sb-degraded" role="status">
          The constellation is napping. Please try again shortly.
        </div>
      </main>
    )
  }
  return <SecondBrainApp roots={roots} />
}
