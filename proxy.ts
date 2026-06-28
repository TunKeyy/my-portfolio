import { NextResponse, type NextRequest } from 'next/server'

// Optional password gate for /second-brain via HTTP Basic Auth (native browser popup).
// Set SECOND_BRAIN_PASSWORD to enable; leave it empty/unset to keep the page public.
const REALM = 'Second Brain'

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  })
}

// Length-safe constant-time-ish compare (avoids early-exit timing on the password).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function proxy(req: NextRequest) {
  const password = process.env.SECOND_BRAIN_PASSWORD
  if (!password) return NextResponse.next() // gate disabled when unset/empty

  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Basic ')) return unauthorized()

  let decoded = ''
  try {
    decoded = atob(auth.slice('Basic '.length))
  } catch {
    return unauthorized()
  }
  // Any username is accepted; only the password is checked.
  const provided = decoded.slice(decoded.indexOf(':') + 1)
  if (!safeEqual(provided, password)) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ['/second-brain', '/second-brain/:path*'],
}
