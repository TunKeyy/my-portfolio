import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// Contract test: the checked-in migration is the source of truth for the schema.
const sql = readFileSync(
  path.join(process.cwd(), 'supabase/migrations/0001_second_brain.sql'),
  'utf8'
).toLowerCase()

describe('0001_second_brain migration', () => {
  it('creates the nodes and documents tables', () => {
    expect(sql).toMatch(/create table\s+nodes/)
    expect(sql).toMatch(/create table\s+documents/)
  })

  it('models the tree as an adjacency list with on delete restrict', () => {
    expect(sql).toMatch(/parent_id uuid references nodes\(id\) on delete restrict/)
  })

  it('cascades document deletes with their node', () => {
    expect(sql).toMatch(/node_id uuid not null references nodes\(id\) on delete cascade/)
  })

  it('stores both html and markdown bodies via body_format', () => {
    expect(sql).toMatch(/\bbody text\b/)
    expect(sql).toMatch(/body_format text not null default 'html'/)
    expect(sql).toMatch(/check \(body_format in \('html','markdown'\)\)/)
  })

  it('enables RLS with public read on both tables', () => {
    expect(sql).toMatch(/alter table nodes enable row level security/)
    expect(sql).toMatch(/alter table documents enable row level security/)
    const reads = sql.match(/for select\s+using \(true\)/g) ?? []
    expect(reads.length).toBe(2)
  })

  it('enforces root-slug uniqueness despite null parent_id', () => {
    expect(sql).toMatch(/create unique index .* on nodes \(slug\) where parent_id is null/)
  })

  it('declares no anon write policies (service role only)', () => {
    expect(sql).not.toMatch(/for insert/)
    expect(sql).not.toMatch(/for update/)
    expect(sql).not.toMatch(/for delete/)
  })

  it('seeds exactly 3 empty root nodes and no documents', () => {
    const nodeSeeds = sql.match(/insert into nodes/g) ?? []
    expect(nodeSeeds.length).toBe(3)
    expect(sql).not.toMatch(/insert into documents/)
    // roots have no parent: no seed insert may set parent_id
    expect(sql).not.toMatch(/insert into nodes[^;]*parent_id/)
    expect(sql).toContain('software-engineering')
    expect(sql).toContain('music-learning')
    expect(sql).toContain('english-learning')
  })
})
