import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'edge'

// Security: Rate limiter - 100 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  limit: 100
})

// Security: Allowed origins
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'https://teme.com',
  'http://localhost:3000' // for development
]

// Security: Valid PostHog endpoints
const VALID_PATHS = [
  '/capture/',
  '/batch/',
  '/decide/',
  '/s/'
]

function isValidRequest(path: string): boolean {
  return VALID_PATHS.some(p => path.startsWith(p))
}

function validateOrigin(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

export async function POST(req: NextRequest) {
  // Security: Get real IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  // Security: Rate limiting with token bucket
  if (!limiter(ip)) {
    console.warn(`[Security] Rate limit exceeded for IP: ${ip}`)
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      }
    })
  }

  // Security: Origin validation
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')

  if (!validateOrigin(origin) && !validateOrigin(referer)) {
    console.warn(`[Security] Invalid origin: ${origin}, referer: ${referer}`)
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Security: Path validation
  const url = req.nextUrl
  const path = url.pathname.replace('/api/analytics/', '')

  if (!isValidRequest('/' + path)) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Security: Content type validation
  const contentType = req.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Security: Size limit (prevent large payloads)
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 100_000) { // 100KB max
    return new Response(JSON.stringify({ error: 'Payload too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get request body (size-limited)
    const body = await req.text()

    // Security: Don't log full body in production
    // Only log metadata for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${req.method} /${path} from ${ip}`)
    }

    // Proxy to PostHog
    const response = await fetch(`https://app.posthog.com/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TEME-Proxy/1.0'
      },
      body
    })

    // Security: Return PostHog response as-is
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json'
      }
    })

  } catch (error) {
    console.error('[Analytics] Proxy error:', error)
    // Security: Don't expose internal errors
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle GET requests (for /decide, /s)
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

  if (!limiter(ip)) {
    return new Response('Too many requests', { status: 429 })
  }

  const path = req.nextUrl.pathname.replace('/api/analytics/', '')

  if (!isValidRequest('/' + path)) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const response = await fetch(`https://app.posthog.com/${path}`)
    return new Response(response.body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response('Internal error', { status: 500 })
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
