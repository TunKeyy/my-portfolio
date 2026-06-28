import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeHtml } from './sanitize'
import { scanSensitive } from './scan-sensitive'
import { resolvePath, slugify } from './path-resolver'
import { triggerRevalidate } from './revalidate'

const MAX_BODY = 100_000
const SEARCH_LIMIT = 20

export interface ToolDeps {
  revalidate: () => Promise<void>
}
const defaultDeps: ToolDeps = { revalidate: triggerRevalidate }

// Strict publish gate: reject on any secret/PII match unless explicitly overridden.
function assertSafe(parts: Array<string | undefined>, allow: boolean | undefined): void {
  if (allow) return
  const cats = scanSensitive(parts.filter(Boolean).join('\n'))
  if (cats.length > 0) {
    throw new Error(
      `blocked: sensitive content detected [${cats.join(', ')}] — set allow_sensitive: true to publish anyway`
    )
  }
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`)
}

// ---- read-only ----

export async function getTree(client: SupabaseClient) {
  const { data, error } = await client.from('nodes').select('*').order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return { nodes: data ?? [] }
}

export const searchInput = z.object({ query: z.string().min(1).max(100) })
export async function search(client: SupabaseClient, input: unknown) {
  const { query } = searchInput.parse(input)
  const { data, error } = await client
    .from('nodes')
    .select('id,title,slug,parent_id')
    .ilike('title', `%${escapeLike(query)}%`)
    .limit(SEARCH_LIMIT)
  if (error) throw new Error(error.message)
  return { results: data ?? [] }
}

// ---- mutations (gate + sanitize + revalidate) ----

export const createNodeInput = z.object({
  parentPath: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  allow_sensitive: z.boolean().optional(),
})
export async function createNode(client: SupabaseClient, input: unknown, deps: ToolDeps = defaultDeps) {
  const p = createNodeInput.parse(input)
  assertSafe([p.title, p.description], p.allow_sensitive)
  const parentId = p.parentPath ? await resolvePath(client, p.parentPath) : null
  const slug = slugify(p.slug ?? p.title)
  const { data, error } = await client
    .from('nodes')
    .insert({
      parent_id: parentId,
      title: p.title,
      slug,
      description: p.description ?? null,
      color: p.color ?? null,
      icon: p.icon ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  await deps.revalidate()
  return { status: 'created', id: data.id, slug }
}

export const moveNodeInput = z.object({
  id: z.string().min(1),
  newParentPath: z.string().optional(), // omit -> move to root
})
export async function moveNode(client: SupabaseClient, input: unknown, deps: ToolDeps = defaultDeps) {
  const p = moveNodeInput.parse(input)
  const newParentId = p.newParentPath ? await resolvePath(client, p.newParentPath) : null
  // Cycle check: walk ancestors of the new parent; reject if we reach the node being moved.
  let cursor: string | null = newParentId
  while (cursor) {
    if (cursor === p.id) throw new Error('move would create a cycle')
    const { data, error } = await client.from('nodes').select('parent_id').eq('id', cursor).maybeSingle()
    if (error) throw new Error(error.message)
    cursor = (data?.parent_id as string | null) ?? null
  }
  const { error } = await client.from('nodes').update({ parent_id: newParentId }).eq('id', p.id)
  if (error) throw new Error(error.message)
  await deps.revalidate()
  return { status: 'moved', id: p.id }
}

export const addNoteInput = z.object({
  nodePath: z.string().min(1),
  title: z.string().min(1),
  body: z.string().max(MAX_BODY).optional(),
  format: z.enum(['html', 'markdown']).default('html'),
  source_url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  idempotency_key: z.string().optional(),
  allow_sensitive: z.boolean().optional(),
})
export async function addNote(client: SupabaseClient, input: unknown, deps: ToolDeps = defaultDeps) {
  const p = addNoteInput.parse(input)
  assertSafe([p.title, p.body, p.source_url, ...(p.tags ?? [])], p.allow_sensitive)
  const nodeId = await resolvePath(client, p.nodePath)

  // Idempotent: dedupe on (node_id, title).
  const existing = await client.from('documents').select('id').eq('node_id', nodeId).eq('title', p.title)
  if (existing.error) throw new Error(existing.error.message)
  const rows = (existing.data ?? []) as { id: string }[]
  if (rows.length > 0) return { status: 'already_exists', id: rows[0].id }

  // html sanitized at write; markdown stored raw (converted+sanitized at render in the Next app).
  const body = p.format === 'html' ? sanitizeHtml(p.body ?? '') : p.body ?? ''
  const { data, error } = await client
    .from('documents')
    .insert({
      node_id: nodeId,
      title: p.title,
      body,
      body_format: p.format,
      source_url: p.source_url ?? null,
      tags: p.tags ?? [],
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  await deps.revalidate()
  return { status: 'created', id: data.id }
}

export const updateNoteInput = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  body: z.string().max(MAX_BODY).optional(),
  format: z.enum(['html', 'markdown']).optional(),
  source_url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  allow_sensitive: z.boolean().optional(),
})
export async function updateNote(client: SupabaseClient, input: unknown, deps: ToolDeps = defaultDeps) {
  const p = updateNoteInput.parse(input)
  assertSafe([p.title, p.body, p.source_url, ...(p.tags ?? [])], p.allow_sensitive)
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (p.title !== undefined) patch.title = p.title
  if (p.source_url !== undefined) patch.source_url = p.source_url
  if (p.tags !== undefined) patch.tags = p.tags
  if (p.body !== undefined) {
    const fmt = p.format ?? 'html'
    patch.body = fmt === 'html' ? sanitizeHtml(p.body) : p.body
    patch.body_format = fmt
  }
  const { error } = await client.from('documents').update(patch).eq('id', p.id)
  if (error) throw new Error(error.message)
  await deps.revalidate()
  return { status: 'updated', id: p.id }
}

export async function revalidate(_client: SupabaseClient, _input: unknown, deps: ToolDeps = defaultDeps) {
  await deps.revalidate()
  return { status: 'revalidated' }
}
