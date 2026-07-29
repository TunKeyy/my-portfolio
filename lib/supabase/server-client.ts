import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ws from 'ws'

// Anon-key client for PUBLIC READS ONLY. Service-role writes live in the second-brain MCP server.
// Uses SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix) so the key is never bundled to the browser.
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_ANON_KEY)'
    )
  }
  // realtime-js needs a WebSocket ctor at construction; Node < 22 has none, so createClient()
  // throws even for our REST-only reads. Supply `ws` — no socket is ever opened.
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: { transport: ws as unknown as typeof WebSocket },
  })
}
