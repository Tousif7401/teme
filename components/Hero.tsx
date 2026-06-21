"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function Hero() {
  const { landingMode } = useAppStore();
  const [radarStatus, setRadarStatus] = useState("AWAITING AUTH");
  const [radarText, setRadarText] = useState("IDENTITY REQUIRED");
  const [scanlineStyle, setScanlineStyle] = useState({});

  const handleButtonHover = (isHovering: boolean) => {
    if (isHovering) {
      setRadarStatus(landingMode === "tech" ? "ROUTING..." : "CHECKING VIBES...");
      setRadarText("HANDSHAKE READY");
      setScanlineStyle({
        background: "var(--ink)",
        animationDuration: "1s",
      });
    } else {
      setRadarStatus("AWAITING AUTH");
      setRadarText(
        landingMode === "tech" ? "IDENTITY REQUIRED" : "VIBE CHECK PENDING"
      );
      setScanlineStyle({
        background:
          landingMode === "tech" ? "var(--accent-red)" : "var(--accent-purple)",
        animationDuration: "3s",
      });
    }
  };

  return (
    <main className="hero">
      {/* Left Panel */}
      <div className="hero-left">
        <div>
          <h1>
            <span className="tech-only">Talk code.</span>
            <span className="tech-only">Skip the BS.</span>
            <span className="nontech-only">Pitch ideas.</span>
            <span className="nontech-only">Find Builders.</span>
          </h1>
          <p>
            <span className="tech-only">
              A volatile, anonymous 1-on-1 network exclusively for developers.
              Drop into the queue, share your terminal, or hit ESC to route to
              the next peer.
            </span>
            <span className="nontech-only">
              Zero coding required. Jump into 1-on-1 chats with developers. Ask
              how AI works, pitch your startup idea, or find a technical
              co-founder instantly.
            </span>
          </p>
        </div>

        {/* Auth Console */}
        <div className="auth-console">
          <div className="auth-console-header tech-only">
            ~/teme/auth/require_identity
          </div>
          <div className="auth-console-header nontech-only">
            SYSTEM // VERIFY VIBE CHECK
          </div>
          <div className="auth-buttons">
            <button
              className="btn github"
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
            >
              <span>[ Auth: GitHub ]</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </button>
            <button
              className="btn google"
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
            >
              <span>[ Auth: Google ]</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Radar Box */}
      <div className="hero-right">
        <div className="radar-box">
          {/* Radar Header */}
          <div className="radar-header">
            <span className="tech-only">PORT: 443</span>
            <span className="nontech-only">RADAR: ACTIVE</span>
            <span
              style={{
                color:
                  radarStatus === "ROUTING..." || radarStatus === "CHECKING VIBES..."
                    ? "var(--ink)"
                    : "var(--accent-red)",
              }}
            >
              {radarStatus}
            </span>
          </div>

          {/* Radar Content */}
          <div className="radar-content">
            <div className="scanline" style={scanlineStyle} />
            <div style={{ color: "#888" }}>
              <span className="tech-only">
                IDENTITY
                <br />
                REQUIRED
              </span>
              <span className="nontech-only">
                VIBE CHECK
                <br />
                PENDING
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
