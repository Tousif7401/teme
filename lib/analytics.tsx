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
 * Check if user has consented to session recordings.
 * Stored in localStorage as 'posthog_session_recording_consent'
 */
function hasRecordingConsent(): boolean {
  if (typeof window === 'undefined') return false
  const consent = localStorage.getItem('posthog_session_recording_consent')
  return consent === 'true'
}

// Initialize PostHog client-side
export const analytics = typeof window !== 'undefined'
  ? posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // Disable autocapture for privacy
      disable_session_recording: !hasRecordingConsent(), // Respect consent
      disable_persistence: false,
      persistence: 'localStorage',
      secure_cookie: true,
      loaded: (ph) => {
        // Secure: Identify user from JWT token
        const userId = getUserIdFromToken()
        if (userId) {
          ph.identify(userId, {
            // Add traits that help distinguish users without PII
            logged_in: true,
          })
        }
      }
    })
  : undefined

// Provider wrapper - uses apiKey directly
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!}
      options={{
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false,
        disable_session_recording: false, // Will be toggled by consent
        disable_persistence: false,
        persistence: 'localStorage',
        secure_cookie: true,
        loaded: (ph) => {
          // Check consent and toggle recording
          if (!hasRecordingConsent()) {
            ph.stopSessionRecording()
          }

          // Identify user from JWT
          const userId = getUserIdFromToken()
          if (userId) {
            ph.identify(userId, { logged_in: true })
          }
        }
      }}
    >
      {children}
    </PHProvider>
  )
}

// Custom analytics functions
export const track = {
  // Page views (auto-captured, but manual available)
  pageView: (page: string, properties?: Record<string, any>) => {
    analytics?.capture('$pageview', {
      $current_url: page,
      ...properties
    })
  },

  // Custom events
  event: (name: string, properties?: Record<string, any>) => {
    analytics?.capture(name, properties)
  },

  // User identification
  identify: (userId: string, traits?: Record<string, any>) => {
    analytics?.identify(userId, traits)
  },

  // User actions
  sessionStart: () => {
    analytics?.capture('session_started')
  },

  matchFound: (properties: {
    partnerName: string
    matchTime: number
  }) => {
    analytics?.capture('match_found', properties)
  },

  messageSent: () => {
    analytics?.capture('message_sent')
  },

  messageEdited: () => {
    analytics?.capture('message_edited')
  },

  messageReplied: () => {
    analytics?.capture('message_replied')
  },

  messageCopied: () => {
    analytics?.capture('message_copied')
  },

  messageReported: (reason: string) => {
    analytics?.capture('message_reported', { reason })
  },

  videoToggle: (action: 'camera_on' | 'camera_off' | 'mic_on' | 'mic_off') => {
    analytics?.capture('media_toggled', { action })
  },

  sessionEnded: (duration: number) => {
    analytics?.capture('session_ended', { duration_ms: duration })
  },

  profileViewed: (profileType: 'own' | 'peer') => {
    analytics?.capture('profile_viewed', { profileType })
  },

  reportSubmitted: (category: string) => {
    analytics?.capture('report_submitted', { category })
  },

  // Feature usage
  featureUsed: (feature: string) => {
    analytics?.capture('feature_used', { feature })
  },

  // Error tracking
  error: (error: string, context?: Record<string, any>) => {
    analytics?.capture('error_occurred', { error, ...context })
  }
}

// Reset on logout - clears user identity and session
export const reset = () => {
  analytics?.reset()
}

/**
 * Session recording consent controls.
 * Users can opt-in/out of session recordings for privacy.
 */
export const sessionRecording = {
  /** Grant consent for session recordings */
  grantConsent: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('posthog_session_recording_consent', 'true')
    }
    analytics?.startSessionRecording()
  },

  /** Revoke consent for session recordings */
  revokeConsent: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('posthog_session_recording_consent', 'false')
    }
    analytics?.stopSessionRecording()
  },

  /** Check if user has granted consent */
  hasConsent: (): boolean => hasRecordingConsent(),
}
