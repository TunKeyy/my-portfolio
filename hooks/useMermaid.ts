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

const DARK = {
  background: '#0f1214',
  primaryColor: '#181d20',
  primaryBorderColor: '#e08a2e',
  primaryTextColor: '#e6eaec',
  secondaryColor: '#20272b',
  tertiaryColor: '#181d20',
  lineColor: '#95a0a8',
  textColor: '#e6eaec',
  mainBkg: '#181d20',
  nodeBorder: '#e08a2e',
  clusterBkg: '#181d20',
  clusterBorder: '#2a3237',
  titleColor: '#e6eaec',
  edgeLabelBackground: '#0f1214',
  noteBkgColor: '#20272b',
  noteBorderColor: '#e08a2e',
  noteTextColor: '#e6eaec',
  actorBkg: '#181d20',
  actorBorder: '#e08a2e',
  actorTextColor: '#e6eaec',
  actorLineColor: '#95a0a8',
  signalColor: '#95a0a8',
  signalTextColor: '#e6eaec',
  labelBoxBkgColor: '#181d20',
  labelBoxBorderColor: '#e08a2e',
  labelTextColor: '#e6eaec',
  loopTextColor: '#e6eaec',
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
