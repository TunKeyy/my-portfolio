'use client'

import { useEffect, type RefObject } from 'react'

// Render <pre class="mermaid"> blocks inside `ref` into SVG on the client. Mermaid mutates the DOM
// at runtime, so its injected SVG bypasses the HTML sanitizer (which only runs on the string).
// `dep` should be the injected HTML so we re-run when the body changes. Failures leave the raw
// source visible instead of throwing.
export function useMermaid(ref: RefObject<HTMLElement | null>, dep: unknown): void {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])'))
    if (nodes.length === 0) return

    let cancelled = false
    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default
        const light = document.documentElement.classList.contains('light')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: light ? 'default' : 'dark',
        })
        if (cancelled) return
        await mermaid.run({ nodes })
      } catch {
        // leave the raw mermaid source visible if rendering fails
      }
    })()

    return () => {
      cancelled = true
    }
  }, [ref, dep])
}
