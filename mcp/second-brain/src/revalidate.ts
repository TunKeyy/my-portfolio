export interface RevalidateDeps {
  fetchFn?: typeof fetch
  backoffMs?: number
  retries?: number
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Ping the site's revalidate endpoint after a write. Retry with backoff and FAIL LOUD (throw) so
// the model surfaces a stale-site condition instead of silently dropping it.
export async function triggerRevalidate(deps: RevalidateDeps = {}): Promise<void> {
  const fetchFn = deps.fetchFn ?? fetch
  const backoffMs = deps.backoffMs ?? 200
  const retries = deps.retries ?? 3

  const url = process.env.REVALIDATE_URL
  const token = process.env.REVALIDATE_TOKEN
  if (!url || !token) throw new Error('revalidate not configured (REVALIDATE_URL / REVALIDATE_TOKEN)')

  let lastErr = 'unknown error'
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) return
      lastErr = `HTTP ${res.status}`
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'request failed'
    }
    if (attempt < retries - 1) await delay(backoffMs * (attempt + 1))
  }
  throw new Error(`revalidate failed after ${retries} attempts: ${lastErr}`)
}
