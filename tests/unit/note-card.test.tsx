// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { NoteCard } from '@/components/second-brain/note-card'
import type { SecondBrainDocument } from '@/lib/second-brain/types'

afterEach(cleanup)

function doc(over: Partial<SecondBrainDocument> = {}): SecondBrainDocument {
  return {
    id: 'd1',
    node_id: 'n1',
    title: 'My Note',
    body: '<p>hello</p>',
    body_format: 'html',
    source_url: null,
    tags: ['x', 'y'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '',
    ...over,
  }
}

describe('NoteCard', () => {
  it('renders title, tags, and sanitized body', () => {
    render(<NoteCard doc={doc()} />)
    expect(screen.getByText('My Note')).toBeTruthy()
    expect(screen.getByText('#x')).toBeTruthy()
    expect(screen.getByText('hello')).toBeTruthy()
  })

  it('does not execute injected script content (client-side sanitize)', () => {
    render(<NoteCard doc={doc({ body: '<p>ok</p><img src=x onerror="window.__xss=1">' })} />)
    expect((window as unknown as { __xss?: number }).__xss).toBeUndefined()
    expect(document.querySelector('[onerror]')).toBeNull()
  })

  it('copy button copies the raw body', () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<NoteCard doc={doc()} />)
    fireEvent.click(screen.getByRole('button', { name: /copy note/i }))
    expect(writeText).toHaveBeenCalledWith('<p>hello</p>')
  })

  it('collapses long bodies behind a Show note button', () => {
    render(<NoteCard doc={doc({ body: `<p>${'a'.repeat(800)}</p>` })} />)
    const showBtn = screen.getByRole('button', { name: /show note/i })
    fireEvent.click(showBtn)
    expect(screen.queryByRole('button', { name: /show note/i })).toBeNull()
  })
})
