'use client'

import { useState } from 'react'
import { sanitizeHtml } from '@/lib/second-brain/sanitize-html'
import type { SecondBrainDocument } from '@/lib/second-brain/types'

const COLLAPSE_THRESHOLD = 600

export function NoteCard({ doc }: { doc: SecondBrainDocument }) {
  // Defense in depth: re-sanitize in the real browser (catches mXSS that server jsdom can miss).
  const clean = sanitizeHtml(doc.body ?? '')
  const long = clean.length > COLLAPSE_THRESHOLD
  const [open, setOpen] = useState(!long)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(doc.body ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <article className="sb-note-card">
      <header className="sb-note-head">
        <h3>{doc.title}</h3>
        <button type="button" onClick={copy} className="sb-copy" aria-label="Copy note">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </header>

      {doc.tags?.length > 0 && (
        <ul className="sb-tags">
          {doc.tags.map((t) => (
            <li key={t}>#{t}</li>
          ))}
        </ul>
      )}

      <div className="sb-note-meta">
        {doc.created_at && <time dateTime={doc.created_at}>{formatDate(doc.created_at)}</time>}
        {doc.source_url && (
          <a href={doc.source_url} target="_blank" rel="noopener noreferrer">
            source
          </a>
        )}
      </div>

      {open ? (
        <div className="sb-note-body prose" dangerouslySetInnerHTML={{ __html: clean }} />
      ) : (
        <button type="button" className="sb-expand" onClick={() => setOpen(true)}>
          Show note
        </button>
      )}
    </article>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString()
}
