import { NextRequest } from 'next/server'

// Simple in-memory rate limit for development
const ipRequests = new Map<string, number[]>()
const RATE_LIMIT = 100
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const requests = ipRequests.get(ip) || []
  const recent = requests.filter(t => now - t < RATE_WINDOW)
  if (recent.length >= RATE_LIMIT) return false
  recent.push(now)
  ipRequests.set(ip, recent)
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  if (!checkRateLimit(ip)) {
    console.warn(`[Analytics] Rate limit exceeded for IP: ${ip}`)
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Get the full path with query string
  const url = req.nextUrl
  const fullPath = url.pathname.replace('/api/analytics', '') + url.search

  // Get body as buffer (don't decode - PostHog sends gzipped data)
  const body = await req.arrayBuffer()
  const contentLength = body.byteLength

  // Build headers - pass through most original headers
  const headers: HeadersInit = {
    'User-Agent': 'TEME-Proxy/1.0',
    'Content-Length': contentLength.toString(),
  }

  // Pass through content-type and other important headers
  const contentType = req.headers.get('content-type')
  if (contentType) headers['Content-Type'] = contentType

  const encoding = req.headers.get('content-encoding')
  if (encoding) headers['Content-Encoding'] = encoding

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] POST ${fullPath} (${contentLength} bytes) from ${ip}`)
  }

  try {
    const posthogUrl = `https://app.posthog.com${fullPath}`
    const response = await fetch(posthogUrl, {
      method: 'POST',
      headers,
      body: new Uint8Array(body),
    })

    // Debug logging for errors
    if (!response.ok && process.env.NODE_ENV === 'development') {
      console.warn(`[Analytics] PostHog returned ${response.status} for ${fullPath}`)
    }

    // Return the response - don't read the body, just pass it through
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      }
    })

  } catch (error) {
    console.error('[Analytics] Proxy error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

  if (!checkRateLimit(ip)) {
    return new Response('Too many requests', { status: 429 })
  }

  const url = req.nextUrl
  const fullPath = url.pathname.replace('/api/analytics', '') + url.search

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] GET ${fullPath}`)
  }

  try {
    const posthogUrl = `https://app.posthog.com${fullPath}`
    const response = await fetch(posthogUrl)

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      }
    })
  } catch (error) {
    console.error('[Analytics] GET error:', error)
    return new Response('Internal error', { status: 500 })
  }
}

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
