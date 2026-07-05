'use client'

import { useEffect, type RefObject } from 'react'

// Claude-artifact-inspired look: warm neutral surfaces, coral accent, clean sans-serif.
const FONT_STACK =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

const LIGHT = {
  background: '#faf9f5',
  primaryColor: '#f0eee6',
  primaryBorderColor: '#d97757',
  primaryTextColor: '#1f1e1d',
  secondaryColor: '#eae7dc',
  tertiaryColor: '#f5f4ee',
  lineColor: '#a39d8f',
  textColor: '#1f1e1d',
  mainBkg: '#f0eee6',
  nodeBorder: '#d97757',
  clusterBkg: '#f5f4ee',
  clusterBorder: '#d6d1c4',
  titleColor: '#1f1e1d',
  edgeLabelBackground: '#faf9f5',
  noteBkgColor: '#f6ecd6',
  noteBorderColor: '#d97757',
  noteTextColor: '#1f1e1d',
  actorBkg: '#f0eee6',
  actorBorder: '#d97757',
  actorTextColor: '#1f1e1d',
  actorLineColor: '#a39d8f',
  signalColor: '#6b6558',
  signalTextColor: '#1f1e1d',
  labelBoxBkgColor: '#f0eee6',
  labelBoxBorderColor: '#d97757',
  labelTextColor: '#1f1e1d',
  loopTextColor: '#1f1e1d',
}

const DARK = {
  background: '#262624',
  primaryColor: '#30302e',
  primaryBorderColor: '#d97757',
  primaryTextColor: '#f5f4ee',
  secondaryColor: '#3a3937',
  tertiaryColor: '#2a2a28',
  lineColor: '#8c8579',
  textColor: '#f5f4ee',
  mainBkg: '#30302e',
  nodeBorder: '#d97757',
  clusterBkg: '#2a2a28',
  clusterBorder: '#4a4844',
  titleColor: '#f5f4ee',
  edgeLabelBackground: '#262624',
  noteBkgColor: '#3a3937',
  noteBorderColor: '#d97757',
  noteTextColor: '#f5f4ee',
  actorBkg: '#30302e',
  actorBorder: '#d97757',
  actorTextColor: '#f5f4ee',
  actorLineColor: '#8c8579',
  signalColor: '#b8b1a3',
  signalTextColor: '#f5f4ee',
  labelBoxBkgColor: '#30302e',
  labelBoxBorderColor: '#d97757',
  labelTextColor: '#f5f4ee',
  loopTextColor: '#f5f4ee',
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
        const light = document.documentElement.classList.contains('light')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: FONT_STACK,
          themeVariables: { fontFamily: FONT_STACK, ...(light ? LIGHT : DARK) },
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
