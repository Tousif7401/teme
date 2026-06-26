"use client";

import { useState, useEffect } from "react";
import { sessionRecording } from "@/lib/analytics";

/**
 * Analytics consent banner for GDPR/CCPA compliance.
 * Asks users to opt-in to session recordings.
 * Session recordings are OFF by default - user must consent.
 */
export function AnalyticsConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    // Check if user has already made a decision
    const consent = localStorage.getItem("posthog_session_recording_consent");
    const dismissed = localStorage.getItem("posthog_consent_dismissed");

    if (consent === "true" || consent === "false" || dismissed === "true") {
      setHasDecided(true);
    } else {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    sessionRecording.grantConsent();
    setShowBanner(false);
    setHasDecided(true);
  };

  const handleDecline = () => {
    sessionRecording.revokeConsent();
    localStorage.setItem("posthog_consent_dismissed", "true");
    setShowBanner(false);
    setHasDecided(true);
  };

  if (!showBanner || hasDecided) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-midnight-ink text-parchment-white border-t border-driftwood/30 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[13px] text-driftwood/90 flex-1">
          We use session recordings to improve TEME.{" "}
          <span className="text-parchment-white/70">
            Recordings capture screen interactions for product improvement.
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 text-[12px] font-medium text-driftwood hover:text-parchment-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 bg-parchment-white text-midnight-ink text-[12px] font-medium rounded-buttons hover:bg-driftwood/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
