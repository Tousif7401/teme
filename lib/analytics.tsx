'use client'

import posthog from 'posthog-js'

// Token storage keys (must match services/api.ts)
const ACCESS = 'teme_access'

/**
 * Secure: Decode JWT to extract user ID without additional API call.
 * JWT structure: header.payload.signature (3 base64 parts)
 * Returns null for invalid tokens (user not logged in).
 */
function getUserIdFromToken(): string | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem(ACCESS) || sessionStorage.getItem(ACCESS)
  if (!token) return null

  try {
    // JWT payload is the second part (index 1)
    const payload = token.split('.')[1]
    if (!payload) return null

    // Base64 decode + parse JSON
    const decoded = JSON.parse(atob(payload))
    // Standard JWT claims: 'sub' for subject (user ID) or 'userId'
    return decoded.sub || decoded.userId || decoded.id || null
  } catch {
    return null // Invalid token format
  }
}

// Initialize PostHog on client side
let posthogClient: typeof posthog | undefined = undefined

if (typeof window !== 'undefined') {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

  if (!apiKey) {
    console.error('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set!')
  } else {
    posthogClient = posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: false,
      disable_persistence: false,
      persistence: 'localStorage',
      secure_cookie: true,
      // Enable session recordings on localhost for testing
      session_recording: {
        recordCrossOriginIframes: true,
        maskTextSelector: '*',
      },
      loaded: (ph) => {
        console.log('[PostHog] Loaded successfully!', { apiKey })
        // Ensure window.posthog is set
        ;(window as any).posthog = ph
        console.log('[PostHog] window.posthog set:', typeof (window as any).posthog)

        // Identify user from JWT token
        const userId = getUserIdFromToken()
        if (userId) {
          console.log('[PostHog] Identifying user:', userId)
          ph.identify(userId, { logged_in: true })
        }
      }
    })
  }
}

// Provider wrapper - just pass through, we initialize directly
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/**
 * Helper to get the PostHog instance.
 */
function getPostHog() {
  return posthogClient
}

// Custom analytics functions
export const track = {
  pageView: (page: string, properties?: Record<string, any>) => {
    getPostHog()?.capture('$pageview', {
      $current_url: page,
      ...properties
    })
  },

  event: (name: string, properties?: Record<string, any>) => {
    getPostHog()?.capture(name, properties)
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    getPostHog()?.identify(userId, traits)
  },

  sessionStart: () => {
    getPostHog()?.capture('session_started')
  },

  matchFound: (properties: {
    partnerName: string
    matchTime: number
  }) => {
    getPostHog()?.capture('match_found', properties)
  },

  messageSent: () => {
    getPostHog()?.capture('message_sent')
  },

  messageEdited: () => {
    getPostHog()?.capture('message_edited')
  },

  messageReplied: () => {
    getPostHog()?.capture('message_replied')
  },

  messageCopied: () => {
    getPostHog()?.capture('message_copied')
  },

  messageReported: (reason: string) => {
    getPostHog()?.capture('message_reported', { reason })
  },

  videoToggle: (action: 'camera_on' | 'camera_off' | 'mic_on' | 'mic_off') => {
    getPostHog()?.capture('media_toggled', { action })
  },

  sessionEnded: (duration: number) => {
    getPostHog()?.capture('session_ended', { duration_ms: duration })
  },

  profileViewed: (profileType: 'own' | 'peer') => {
    getPostHog()?.capture('profile_viewed', { profileType })
  },

  reportSubmitted: (category: string) => {
    getPostHog()?.capture('report_submitted', { category })
  },

  featureUsed: (feature: string) => {
    getPostHog()?.capture('feature_used', { feature })
  },

  error: (error: string, context?: Record<string, any>) => {
    getPostHog()?.capture('error_occurred', { error, ...context })
  }
}

export const reset = () => {
  getPostHog()?.reset()
}
