'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

type T = { scale: number; tx: number; ty: number }
const IDENTITY: T = { scale: 1, tx: 0, ty: 0 }
const clamp = (s: number) => Math.min(8, Math.max(1, s))

// Full-screen image viewer: wheel/pinch to zoom, hold-drag to pan, double-click to toggle.
export function ImageLightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  const [t, setT] = useState<T>(IDENTITY)
  const stageRef = useRef<HTMLDivElement>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinch = useRef<{ dist: number; scale: number } | null>(null)

  const reset = useCallback(() => setT(IDENTITY), [])

  // Escape to close, "0" to reset; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '0') reset()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, reset])

  // Native non-passive wheel listener so preventDefault works; zoom toward the cursor.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      setT((p) => {
        const ns = clamp(p.scale * factor)
        const ratio = ns / p.scale
        return { scale: ns, tx: cx - (cx - p.tx) * ratio, ty: cy - (cy - p.ty) * ratio }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: ReactPointerEvent) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: t.scale }
      drag.current = null
    } else {
      drag.current = { x: e.clientX, y: e.clientY, tx: t.tx, ty: t.ty }
    }
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      setT((p) => ({ ...p, scale: clamp(pinch.current!.scale * (d / pinch.current!.dist)) }))
    } else if (drag.current) {
      setT((p) => ({ ...p, tx: drag.current!.tx + (e.clientX - drag.current!.x), ty: drag.current!.ty + (e.clientY - drag.current!.y) }))
    }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) drag.current = null
    else {
      const [p] = [...pointers.current.values()]
      drag.current = { x: p.x, y: p.y, tx: t.tx, ty: t.ty }
    }
  }

  return (
    <div
      className="sb-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sb-lightbox-toolbar">
        <button type="button" onClick={() => setT((p) => ({ ...p, scale: clamp(p.scale * 1.25) }))} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => setT((p) => ({ ...p, scale: clamp(p.scale / 1.25) }))} aria-label="Zoom out">−</button>
        <button type="button" onClick={reset} aria-label="Reset zoom">⟲</button>
        <button type="button" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div
        ref={stageRef}
        className="sb-lightbox-stage"
        onPointerDown={(e) => { if (e.target === e.currentTarget) return; onPointerDown(e) }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => setT((p) => (p.scale > 1 ? IDENTITY : { scale: 2, tx: 0, ty: 0 }))}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <img
          src={src}
          alt={alt || ''}
          draggable={false}
          style={{ transform: `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`, cursor: t.scale > 1 ? 'grab' : 'zoom-out' }}
        />
      </div>
    </div>
  )
}
