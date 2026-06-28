import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  NodeWithDocuments,
  Result,
  SecondBrainDocument,
  SecondBrainNode,
} from './types'

const SEARCH_LIMIT = 20

function fail<T>(e: unknown): Result<T> {
  return { data: null, error: e instanceof Error ? e.message : String(e) }
}

// Escape Postgres LIKE/ILIKE wildcards so user text matches literally.
function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`)
}

export async function getRoots(client: SupabaseClient): Promise<Result<SecondBrainNode[]>> {
  try {
    const { data, error } = await client
      .from('nodes')
      .select('*')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
    if (error) return { data: null, error: error.message }
    return { data: (data ?? []) as SecondBrainNode[], error: null }
  } catch (e) {
    return fail(e)
  }
}

export async function getChildren(
  client: SupabaseClient,
  parentId: string
): Promise<Result<SecondBrainNode[]>> {
  try {
    const { data, error } = await client
      .from('nodes')
      .select('*')
      .eq('parent_id', parentId)
      .order('sort_order', { ascending: true })
    if (error) return { data: null, error: error.message }
    return { data: (data ?? []) as SecondBrainNode[], error: null }
  } catch (e) {
    return fail(e)
  }
}

export async function getNodeWithDocuments(
  client: SupabaseClient,
  nodeId: string
): Promise<Result<NodeWithDocuments | null>> {
  try {
    const { data: node, error: nodeError } = await client
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .maybeSingle()
    if (nodeError) return { data: null, error: nodeError.message }
    if (!node) return { data: null, error: null } // not found -> 404 contract
    const { data: docs, error: docError } = await client
      .from('documents')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
    if (docError) return { data: null, error: docError.message }
    return {
      data: {
        node: node as SecondBrainNode,
        documents: (docs ?? []) as SecondBrainDocument[],
      },
      error: null,
    }
  } catch (e) {
    return fail(e)
  }
}

export async function searchNodes(
  client: SupabaseClient,
  q: string
): Promise<Result<SecondBrainNode[]>> {
  try {
    const { data, error } = await client
      .from('nodes')
      .select('*')
      .ilike('title', `%${escapeLike(q)}%`)
      .limit(SEARCH_LIMIT)
    if (error) return { data: null, error: error.message }
    return { data: (data ?? []) as SecondBrainNode[], error: null }
  } catch (e) {
    return fail(e)
  }
}
