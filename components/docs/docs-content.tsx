'use client'
import { SmartLink } from './smart-link'

/**
 * Renders pre-processed HTML (produced server-side by lib/markdown-to-html.ts).
 * We use dangerouslySetInnerHTML because the HTML has already been sanitised
 * by the unified/rehype pipeline (no user-supplied raw HTML allowed).
 *
 * SmartLink is applied via CSS + global link-intercept rather than React
 * component injection, because dangerouslySetInnerHTML bypasses React tree.
 * External link decoration is handled in globals.css.
 */
export function DocsContent({ html }: { html: string }) {
  return (
    <article
      className="prose prose-slate dark:prose-invert max-w-none"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// SmartLink is exported for potential standalone use elsewhere in docs UI.
export { SmartLink }
