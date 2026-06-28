import { unstable_cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server-client'
import { getChildren, getNodeWithDocuments, getRoots } from './queries'
import { renderDocuments } from './render-documents'
import type { NodeWithDocuments, Result, SecondBrainNode } from './types'

// supabase-js does NOT forward Next's { next: { tags } }, so revalidateTag over raw queries is a
// no-op. Wrapping reads in unstable_cache with this shared tag makes revalidateTag effective.
export const SECOND_BRAIN_TAG = 'second-brain'
const REVALIDATE_SECONDS = 3600

// Throw on error so unstable_cache memoizes ONLY successful results — a transient/paused-DB
// error must not get stuck in the cache for the full TTL. Routes catch the throw -> 503.
// createServerClient also throws (missing env) and likewise stays uncached.
async function unwrap<T>(fn: () => Promise<Result<T>>): Promise<T> {
  const result = await fn()
  if (result.error) throw new Error(result.error)
  return result.data as T
}

export const cachedRoots = unstable_cache(
  () => unwrap<SecondBrainNode[]>(() => getRoots(createServerClient())),
  ['second-brain-roots'],
  { tags: [SECOND_BRAIN_TAG], revalidate: REVALIDATE_SECONDS }
)

export const cachedChildren = unstable_cache(
  (parentId: string) =>
    unwrap<SecondBrainNode[]>(() => getChildren(createServerClient(), parentId)),
  ['second-brain-children'],
  { tags: [SECOND_BRAIN_TAG], revalidate: REVALIDATE_SECONDS }
)

export const cachedNodeWithDocuments = unstable_cache(
  (nodeId: string) =>
    unwrap<NodeWithDocuments | null>(async () => {
      const res = await getNodeWithDocuments(createServerClient(), nodeId)
      if (res.error || !res.data) return res
      // Convert markdown + sanitize bodies here so the (cached) result is render-safe HTML.
      return {
        data: { node: res.data.node, documents: await renderDocuments(res.data.documents) },
        error: null,
      }
    }),
  ['second-brain-node'],
  { tags: [SECOND_BRAIN_TAG], revalidate: REVALIDATE_SECONDS }
)
