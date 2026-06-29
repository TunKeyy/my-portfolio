'use client'

import { useEffect, useRef, useState } from 'react'
import { NoteCard } from './note-card'
import type { SecondBrainDocument } from '@/lib/second-brain/types'

interface DocumentWindowProps {
  doc: SecondBrainDocument | null
  open: boolean
  onClose: () => void
}

// Centred modal showing one document's content. The doc (with rendered body) is passed in from the
// constellation, so opening it needs no extra fetch.
export function DocumentWindow({ doc, open, onClose }: DocumentWindowProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // a11y: Esc to close, focus trap, restore focus on close.
  useEffect(() => {
    if (!open) {
      setFullscreen(false) // reset so the next open starts windowed
      return
    }
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

  if (!open || !doc) return null

  return (
    <div className="sb-doc-overlay" onClick={onClose}>
      <div
        className={`sb-doc-window${fullscreen ? ' sb-doc-window--full' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sb-doc-window-head">
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="sb-doc-icon-btn"
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
            aria-pressed={fullscreen}
          >
            {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="sb-doc-icon-btn"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="sb-doc-window-body">
          <NoteCard doc={doc} forceOpen />
        </div>
      </div>
    </div>
  )
}

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function MaximizeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

function MinimizeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M3 16h3a2 2 0 0 1 2 2v3M21 16h-3a2 2 0 0 0-2 2v3" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
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
