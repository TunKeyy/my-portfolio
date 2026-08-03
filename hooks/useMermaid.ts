'use client'

import { useEffect, type RefObject } from 'react'

// Editorial theme (matches the Claude artifact + .sb-doc-window): cool paper surfaces,
// burnt-orange accent, system-ui sans.
const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

const LIGHT = {
  background: '#f6f8f8',
  primaryColor: '#ecf0f1',
  primaryBorderColor: '#c1690f',
  primaryTextColor: '#14181b',
  secondaryColor: '#e2e7ea',
  tertiaryColor: '#ecf0f1',
  lineColor: '#59636c',
  textColor: '#14181b',
  mainBkg: '#ecf0f1',
  nodeBorder: '#c1690f',
  clusterBkg: '#ecf0f1',
  clusterBorder: '#d2d9dd',
  titleColor: '#14181b',
  edgeLabelBackground: '#f6f8f8',
  noteBkgColor: '#f3e4d2',
  noteBorderColor: '#c1690f',
  noteTextColor: '#14181b',
  actorBkg: '#ecf0f1',
  actorBorder: '#c1690f',
  actorTextColor: '#14181b',
  actorLineColor: '#59636c',
  signalColor: '#59636c',
  signalTextColor: '#14181b',
  labelBoxBkgColor: '#ecf0f1',
  labelBoxBorderColor: '#c1690f',
  labelTextColor: '#14181b',
  loopTextColor: '#14181b',
}

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
        // Diagrams only render inside the always-light .sb-doc-window, so the theme is fixed.
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: FONT_STACK,
          themeVariables: { fontFamily: FONT_STACK, ...LIGHT },
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
