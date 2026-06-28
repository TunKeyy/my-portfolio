import DOMPurify from 'isomorphic-dompurify'

// Explicit, pinned allowlist — shared by the MCP write path (Phase 5) and the render path.
// Anything not listed is dropped. on* handlers are excluded by the attribute allowlist;
// javascript:/data: URIs are blocked by ALLOWED_URI_REGEXP.
const CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'hr', 'span', 'div', 'blockquote',
    'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'code', 'pre', 'kbd',
    'ul', 'ol', 'li',
    'a', 'img',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'figure', 'figcaption',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  // https, mailto, root-relative (/path but not //host), and anchors. Blocks javascript: and data:.
  ALLOWED_URI_REGEXP: /^(?:https:|mailto:|\/(?!\/)|#)/i,
  FORBID_TAGS: ['script', 'style', 'svg', 'math', 'foreignobject', 'iframe', 'object', 'embed', 'form', 'input', 'template'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  USE_PROFILES: { html: true },
}

let hooked = false
function ensureHooks(): void {
  if (hooked) return
  hooked = true
  // Force safe rel/target on any surviving link.
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer')
      node.setAttribute('target', '_blank')
    }
  })
}

export function sanitizeHtml(dirty: string): string {
  ensureHooks()
  return DOMPurify.sanitize(dirty ?? '', CONFIG) as unknown as string
}
