import type { SupabaseClient } from '@supabase/supabase-js'

// slug is unique only per-parent, so resolve "Domain/Sub/Topic" segment-by-segment scoped to parent_id.

export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parsePath(path: string): string[] {
  if (!path || !path.trim()) throw new Error('path is empty')
  if (path !== path.trim()) throw new Error('path has leading/trailing whitespace')
  const segments = path.split('/')
  if (segments.some((s) => s.trim() === '')) {
    throw new Error('path has an empty segment (leading, trailing, or double slash)')
  }
  return segments.map((s) => s.trim())
}

// Returns the resolved node id, or throws a clear error on not-found / ambiguity.
export async function resolvePath(client: SupabaseClient, path: string): Promise<string> {
  const segments = parsePath(path)
  let parentId: string | null = null
  let id = ''
  for (const seg of segments) {
    const slug = slugify(seg)
    let query = client.from('nodes').select('id').eq('slug', slug)
    query = parentId === null ? query.is('parent_id', null) : query.eq('parent_id', parentId)
    const { data, error } = await query
    if (error) throw new Error(`path resolve failed at "${seg}": ${error.message}`)
    const rows = (data ?? []) as { id: string }[]
    if (rows.length === 0) throw new Error(`path segment not found: "${seg}"`)
    if (rows.length > 1) throw new Error(`ambiguous path segment: "${seg}"`)
    id = rows[0].id
    parentId = id
  }
  return id
}
