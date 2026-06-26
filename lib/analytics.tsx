'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

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

/**
 * Get PostHog configuration options.
 * Session recordings are ENABLED by default (no consent required).
 */
function getPostHogOptions() {
  return {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // Disable autocapture for privacy
    disable_session_recording: false, // Session recordings ON
    disable_persistence: false,
    persistence: 'localStorage' as const,
    secure_cookie: true,
    loaded: () => {
      // Secure: Identify user from JWT token
      const userId = getUserIdFromToken()
      if (userId) {
        posthog.identify(userId, {
          logged_in: true,
        })
      }
    }
  }
}

// Provider wrapper - single source of initialization
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!}
      options={getPostHogOptions()}
    >
      {children}
    </PHProvider>
  )
}

/**
 * Helper to get the PostHog instance.
 * Returns undefined during SSR or if not initialized.
 */
function getPostHog() {
  if (typeof window === 'undefined') return undefined
  return posthog
}

// Custom analytics functions - use the global posthog instance
export const track = {
  // Page views (auto-captured, but manual available)
  pageView: (page: string, properties?: Record<string, any>) => {
    getPostHog()?.capture('$pageview', {
      $current_url: page,
      ...properties
    })
  },

  // Custom events
  event: (name: string, properties?: Record<string, any>) => {
    getPostHog()?.capture(name, properties)
  },

  // User identification
  identify: (userId: string, traits?: Record<string, any>) => {
    getPostHog()?.identify(userId, traits)
  },

  // User actions
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

  // Feature usage
  featureUsed: (feature: string) => {
    getPostHog()?.capture('feature_used', { feature })
  },

  // Error tracking
  error: (error: string, context?: Record<string, any>) => {
    getPostHog()?.capture('error_occurred', { error, ...context })
  }
}

// Reset on logout - clears user identity and session
export const reset = () => {
  getPostHog()?.reset()
}
