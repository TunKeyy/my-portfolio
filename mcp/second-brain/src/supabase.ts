import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Service-role client (bypasses RLS). Credentials come ONLY from the MCP process env.
export function createServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  // Never put the values in the message — stdio stderr leaks into the model context.
  if (!url || !key) {
    throw new Error('MCP env not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// Strip anything resembling a URL/token/key from any message before it can reach stderr or the model.
export function scrubError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  return msg
    .replace(/https?:\/\/\S+/g, '[url]')
    .replace(/eyJ[A-Za-z0-9_.-]+/g, '[token]')
    .replace(/sb_(?:secret|publishable)_[A-Za-z0-9]+/g, '[key]')
    .replace(/AKIA[0-9A-Z]{16}/g, '[key]')
}
