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
  } catch {
    // Paused/cold DB: a degraded state distinct from "no nodes" — never a 500.
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
