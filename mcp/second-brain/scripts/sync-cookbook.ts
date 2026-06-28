// One-off: sync the Claude Code Cookbook into Second Brain as a "Claude" node under
// "Software Engineering". Reuses the MCP handlers (sanitize + gates). Run: `tsx scripts/sync-cookbook.ts`
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
config({ path: join(here, '../.env'), quiet: true })

import { createServiceClient } from '../src/supabase'
import { addNote, createNode } from '../src/tools'
import { resolvePath } from '../src/path-resolver'
import { triggerRevalidate } from '../src/revalidate'

// Don't fail the whole sync if the site isn't up to revalidate; we trigger it explicitly at the end.
const noopRevalidate = { revalidate: async () => {} }

async function main() {
  const client = createServiceClient()
  const cookbook = readFileSync(join(here, '../../../content/docs/claude-code-cookbook.md'), 'utf8')

  let nodeExists = true
  try {
    await resolvePath(client, 'Software Engineering/Claude')
  } catch {
    nodeExists = false
  }
  if (!nodeExists) {
    const created = await createNode(
      client,
      {
        parentPath: 'Software Engineering',
        title: 'Claude',
        description: 'Claude Code knowledge and cookbook.',
        icon: '🤖',
        color: '#d97706',
      },
      noopRevalidate
    )
    console.log('node:', created)
  } else {
    console.log('node: Software Engineering/Claude already exists')
  }

  // Markdown: stored raw, converted + sanitized at render. allow_sensitive: own documentation.
  const note = await addNote(
    client,
    {
      nodePath: 'Software Engineering/Claude',
      title: 'Claude Code Cookbook',
      body: cookbook,
      format: 'markdown',
      tags: ['claude-code', 'cookbook'],
      allow_sensitive: true,
    },
    noopRevalidate
  )
  console.log('note:', note)

  try {
    await triggerRevalidate()
    console.log('revalidated site')
  } catch (e) {
    console.log('revalidate skipped:', e instanceof Error ? e.message : String(e))
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('SYNC FAILED:', e instanceof Error ? e.message : e)
    process.exit(1)
  })
