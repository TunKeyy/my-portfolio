import { describe, it, expect } from 'vitest'
import { parsePath, slugify, resolvePath } from '../src/path-resolver'
import { mockClient, callsOf } from './mock-client'

describe('slugify / parsePath', () => {
  it('slugifies titles to seed-style slugs', () => {
    expect(slugify('Software Engineering')).toBe('software-engineering')
    expect(slugify('  C++  Tips! ')).toBe('c-tips')
  })
  it('rejects empty / whitespace / empty-segment paths', () => {
    expect(() => parsePath('')).toThrow()
    expect(() => parsePath(' a ')).toThrow(/whitespace/)
    expect(() => parsePath('a//b')).toThrow(/empty segment/)
    expect(() => parsePath('/a')).toThrow(/empty segment/)
    expect(() => parsePath('a/')).toThrow(/empty segment/)
  })
  it('splits a valid path', () => {
    expect(parsePath('A/B/C')).toEqual(['A', 'B', 'C'])
  })
})

describe('resolvePath', () => {
  it('resolves segment-by-segment scoped to parent_id', async () => {
    const client = mockClient([{ data: [{ id: 'root1' }] }, { data: [{ id: 'child1' }] }])
    const id = await resolvePath(client, 'Software Engineering/React')
    expect(id).toBe('child1')
    // first segment scoped to null parent, second to root1
    expect(callsOf(client)).toContainEqual(['is', 'nodes', 'parent_id', null])
    expect(callsOf(client)).toContainEqual(['eq', 'nodes', 'parent_id', 'root1'])
    expect(callsOf(client)).toContainEqual(['eq', 'nodes', 'slug', 'react'])
  })

  it('errors clearly when a segment is not found', async () => {
    const client = mockClient([{ data: [] }])
    await expect(resolvePath(client, 'Nope')).rejects.toThrow(/not found: "Nope"/)
  })

  it('errors on ambiguous multi-match', async () => {
    const client = mockClient([{ data: [{ id: 'x' }, { id: 'y' }] }])
    await expect(resolvePath(client, 'Dup')).rejects.toThrow(/ambiguous/)
  })
})
