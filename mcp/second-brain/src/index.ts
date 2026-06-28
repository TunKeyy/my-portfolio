#!/usr/bin/env node
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
// Load THIS package's .env regardless of the launcher's cwd (Claude Code runs us from elsewhere).
// quiet: stdout must stay pure JSON-RPC for the stdio transport — no dotenv banner.
config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env'), quiet: true })
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServiceClient, scrubError } from './supabase'
import {
  addNote,
  addNoteInput,
  createNode,
  createNodeInput,
  deleteNode,
  deleteNodeInput,
  deleteNote,
  deleteNoteInput,
  getTree,
  listNotes,
  listNotesInput,
  moveNode,
  moveNodeInput,
  revalidate,
  search,
  searchInput,
  updateNote,
  updateNoteInput,
} from './tools'

const client = createServiceClient()
const server = new McpServer({ name: 'second-brain', version: '1.0.0' })

const ok = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data) }] })
const fail = (e: unknown) => ({
  content: [{ type: 'text' as const, text: `Error: ${scrubError(e)}` }],
  isError: true,
})

server.tool('get_tree', {}, async () => {
  try {
    return ok(await getTree(client))
  } catch (e) {
    return fail(e)
  }
})
server.tool('search', searchInput.shape, async (args) => {
  try {
    return ok(await search(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('create_node', createNodeInput.shape, async (args) => {
  try {
    return ok(await createNode(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('move_node', moveNodeInput.shape, async (args) => {
  try {
    return ok(await moveNode(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('add_note', addNoteInput.shape, async (args) => {
  try {
    return ok(await addNote(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('update_note', updateNoteInput.shape, async (args) => {
  try {
    return ok(await updateNote(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('revalidate', {}, async () => {
  try {
    return ok(await revalidate(client, {}))
  } catch (e) {
    return fail(e)
  }
})
server.tool('list_notes', listNotesInput.shape, async (args) => {
  try {
    return ok(await listNotes(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('delete_note', deleteNoteInput.shape, async (args) => {
  try {
    return ok(await deleteNote(client, args))
  } catch (e) {
    return fail(e)
  }
})
server.tool('delete_node', deleteNodeInput.shape, async (args) => {
  try {
    return ok(await deleteNode(client, args))
  } catch (e) {
    return fail(e)
  }
})

await server.connect(new StdioServerTransport())
