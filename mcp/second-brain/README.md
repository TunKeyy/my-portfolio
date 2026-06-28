# second-brain MCP server

A local **stdio** MCP server for syncing the Second Brain knowledge graph into Supabase. It holds the
Supabase **service-role key** in its own process env — the AI never reads that key, and tools never
accept credentials as inputs. After every write it pings the site's revalidate endpoint.

> ⚠️ **Everything you sync is immediately PUBLIC.** The site has no draft/private gate (v1). The
> sensitive-data scan below is a *last line of defense*, not a guarantee — review what you publish.

## Tools

| Tool | Purpose | Writes? |
|------|---------|---------|
| `get_tree` | Dump the full node tree | no |
| `search` | Find nodes by title (parameterized ILIKE) | no |
| `create_node` | Add a domain/sub-topic (`parentPath` optional) | yes |
| `move_node` | Re-parent a node (rejects cycles) | yes |
| `add_note` | Add a note to a node (idempotent on `node_id`+`title`) | yes |
| `update_note` | Edit a note | yes |
| `list_notes` | List notes under a node (`nodePath`) — drives update/clear discovery | no |
| `delete_note` | Delete a note by `id` | yes |
| `delete_node` | Delete a node by `path`/`id` (docs cascade; `recursive: true` for a subtree) | yes |
| `revalidate` | Manually re-trigger site revalidation | (trigger) |

- `delete_node` refuses a node with children unless `recursive: true`; it removes the subtree
  child-first (the `parent_id` FK is `ON DELETE RESTRICT`) and lets documents cascade.
- `body` accepts `format: 'html' | 'markdown'`. HTML is sanitized at write; Markdown is stored raw and
  converted + sanitized at render by the Next app (no duplication).
- **Publish gate (strict):** every write is scanned for secrets **and** PII (emails, phones, IPs,
  internal hosts, keys, tokens, private keys, JWTs). A match is **rejected** unless you pass
  `allow_sensitive: true` on that call. The error lists matched *categories*, never the value.
- `body` is capped at 100 000 chars. `move_node` walks ancestors and refuses to create a cycle.
- Revalidation **fails loud**: if the site can't be revalidated after retries, the tool errors so you
  can reconcile (or call `revalidate` manually).

## Setup

1. Install deps (resolved from the repo root): the server uses `@modelcontextprotocol/sdk`,
   `@supabase/supabase-js`, `dotenv`, `zod`, `isomorphic-dompurify`, run via `tsx`.
2. Create `mcp/second-brain/.env` (gitignored by the repo's `.env*` rule) with **names only** shown
   in `.env.example` below — fill in real values locally.
3. Run: `npm start` (from this dir) → `tsx src/index.ts`.

### `.env.example` (create this file yourself; the values stay local)

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=        # service_role / sb_secret_… key — MCP ONLY, never in the web app
REVALIDATE_URL=https://<your-site>/api/second-brain/revalidate   # or http://localhost:3000/... for local
REVALIDATE_TOKEN=                 # must match the web app's REVALIDATE_TOKEN
```

### Claude Code MCP config

Add to your Claude Code MCP settings (adjust the absolute path):

```json
{
  "mcpServers": {
    "second-brain": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/my-portfolio/mcp/second-brain/src/index.ts"]
    }
  }
}
```

The server loads its `.env` via `dotenv`, so credentials never appear in the MCP config or tool I/O.

## Tests

Run from the repo root (`npm run test:unit`) — the MCP tests live in `tests/` and are included in the
root Vitest config. Standalone typecheck: `npm run typecheck` from this dir.
