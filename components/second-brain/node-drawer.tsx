'use client'

import { useEffect, useRef, useState } from 'react'
import { NoteCard } from './note-card'
import { fetchNode, type NodeBundle } from './use-graph-navigation'

interface NodeDrawerProps {
  nodeId: string | null
  open: boolean
  onClose: () => void
}

export function NodeDrawer({ nodeId, open, onClose }: NodeDrawerProps) {
  const [bundle, setBundle] = useState<NodeBundle | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open || !nodeId) return
    let active = true
    setLoading(true)
    setBundle(null)
    setFilter('')
    fetchNode(nodeId).then((b) => {
      if (!active) return
      setBundle(b)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [open, nodeId])

  // a11y: Esc to close, focus trap, restore focus on close.
  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement as HTMLElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Tab') trapFocus(e, panelRef.current)
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      lastFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const docs = bundle?.documents ?? []
  const q = filter.trim().toLowerCase()
  const filtered = q
    ? docs.filter(
        (d) => d.title.toLowerCase().includes(q) || (d.body ?? '').toLowerCase().includes(q)
      )
    : docs

  return (
    <div className="sb-drawer-overlay" onClick={onClose}>
      <div
        className="sb-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={bundle?.node.title ?? 'Notes'}
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sb-drawer-head">
          <div className="sb-breadcrumb">{bundle?.node.title ?? '…'}</div>
          <button type="button" onClick={onClose} className="sb-drawer-close" aria-label="Close">
            ✕
          </button>
        </header>

        <input
          className="sb-drawer-filter"
          placeholder="Filter notes…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter notes"
        />

        <div className="sb-drawer-feed">
          {loading && <div className="sb-spinner" role="status" aria-label="Loading notes" />}
          {!loading && filtered.length === 0 && <p className="sb-empty">No notes yet.</p>}
          {filtered.map((d) => (
            <NoteCard key={d.id} doc={d} />
          ))}
        </div>
      </div>
    </div>
  )
}

function trapFocus(e: KeyboardEvent, panel: HTMLElement | null) {
  if (!panel) return
  const focusables = panel.querySelectorAll<HTMLElement>(
    'button, [href], input, [tabindex]:not([tabindex="-1"])'
  )
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
