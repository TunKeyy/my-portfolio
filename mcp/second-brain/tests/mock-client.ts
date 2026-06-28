import type { SupabaseClient } from '@supabase/supabase-js'

export interface MockResponse {
  data?: unknown
  error?: { message: string } | null
}

// Queue-based Supabase mock: each terminal (await / .single() / .maybeSingle()) shifts the next
// response. Craft the queue to match a handler's call order. Records calls in _calls.
export function mockClient(queue: MockResponse[]) {
  const calls: unknown[][] = []
  const take = () => Promise.resolve(queue.shift() ?? { data: null, error: null })
  const builder = (table: string) => {
    const b: Record<string, unknown> = {}
    const chain = (m: string) =>
      (...args: unknown[]) => {
        calls.push([m, table, ...args])
        return b
      }
    for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'is', 'ilike', 'limit', 'order']) {
      b[m] = chain(m)
    }
    b.single = () => {
      calls.push(['single', table])
      return take()
    }
    b.maybeSingle = () => {
      calls.push(['maybeSingle', table])
      return take()
    }
    b.then = (res: (v: MockResponse) => unknown, rej?: (e: unknown) => unknown) => take().then(res, rej)
    return b
  }
  const client = {
    from: (table: string) => {
      calls.push(['from', table])
      return builder(table)
    },
    _calls: calls,
  }
  return client as unknown as SupabaseClient & { _calls: unknown[][] }
}

export function callsOf(client: unknown): unknown[][] {
  return (client as { _calls: unknown[][] })._calls
}
