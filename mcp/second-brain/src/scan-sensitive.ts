// Strict publish gate: everything written is world-readable, so reject secrets AND PII by default.
// Returns matched CATEGORY names only — never the matched value.

interface Detector {
  category: string
  re: RegExp
}

const DETECTORS: Detector[] = [
  { category: 'private_key', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { category: 'aws_access_key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { category: 'github_token', re: /\bgh[oprsu]_[A-Za-z0-9]{36,}\b/ },
  { category: 'slack_token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { category: 'google_api_key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { category: 'stripe_key', re: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}\b/ },
  // OpenAI-style: require a digit so slugs like "sk-learn-notes" don't false-positive.
  { category: 'openai_key', re: /\bsk-(?:proj-)?(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{20,}\b/ },
  { category: 'jwt', re: /\beyJ[A-Za-z0-9_-]{6,}\.eyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\b/ },
  { category: 'supabase_key', re: /\bsb_(?:secret|publishable)_[A-Za-z0-9]{8,}\b/ },
  // Connection string with embedded credentials (scheme://user:pass@host).
  { category: 'db_connection_uri', re: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqps?):\/\/[^\s:/@]+:[^\s@]+@/i },
  // Assignment to a credential-named key, where the value is quoted OR a token containing a digit
  // (avoids flagging code like `const secret = computeValue()`).
  { category: 'credential_assignment', re: /\b(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*(?:['"][^'"\n]{4,}['"]|[A-Za-z0-9._-]*\d[A-Za-z0-9._-]{5,})/i },
  { category: 'private_ip', re: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/ },
  // Internal hostnames — '.local' dropped (too common as a file suffix / mDNS to flag reliably).
  { category: 'internal_host', re: /\b[\w-]+\.(?:internal|corp|intranet)\b/i },
  { category: 'email', re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  // Phone: international (+…) or grouped (415-555-2671). Bare digit runs are NOT flagged — they
  // collide with order numbers / IDs and cause alarm fatigue (which defeats the gate).
  { category: 'phone', re: /\+\d[\d().\s-]{7,}\d|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/ },
]

export function scanSensitive(text: string): string[] {
  if (!text) return []
  const hit = new Set<string>()
  for (const d of DETECTORS) {
    if (d.re.test(text)) hit.add(d.category)
  }
  return [...hit]
}
