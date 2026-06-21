"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export interface HeroProps {
  className?: string;
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(({ className }, ref) => {
  const { setCurrentView } = useAppStore();
  const [radarStatus, setRadarStatus] = useState<"AWAITING AUTH" | "ROUTING...">("AWAITING AUTH");
  const [radarText, setRadarText] = useState("IDENTITY REQUIRED");

  const handleGitHubHover = (isHovering: boolean) => {
    if (isHovering) {
      setRadarStatus("ROUTING...");
      setRadarText("HANDSHAKE READY");
    } else {
      setRadarStatus("AWAITING AUTH");
      setRadarText("IDENTITY REQUIRED");
    }
  };

  const handleGoogleHover = (isHovering: boolean) => {
    if (isHovering) {
      setRadarStatus("ROUTING...");
      setRadarText("HANDSHAKE READY");
    } else {
      setRadarStatus("AWAITING AUTH");
      setRadarText("IDENTITY REQUIRED");
    }
  };

  const handleAuth = (provider: "github" | "google") => {
    setCurrentView("launchpad");
  };

  return (
    <section
      ref={ref}
      className={cn("grid grid-cols-1 lg:grid-cols-2 border-b-2 border-ink", className)}
    >
      {/* Left Column: Hero Content */}
      <div className="border-r-0 border-b-2 border-ink lg:border-b-0 lg:border-r-2 px-6 py-12 lg:px-12 lg:py-12 flex flex-col justify-between">
        <div>
          <h1 className="font-display text-display lg:text-[7rem] font-extrabold tracking-tighter mb-6">
            Talk code.<br />
            Skip the BS.
          </h1>
          <p className="text-body text-ink max-w-[440px] font-medium mb-12">
            A volatile, anonymous 1-on-1 network exclusively for developers. Drop into the queue, share your terminal, or hit ESC to route to the next peer.
          </p>
        </div>

        {/* Auth Console */}
        <div className="bg-ink text-bg border-2 border-ink p-6">
          <div className="text-caption text-[#888] mb-4 uppercase font-mono">
            ~/teme/auth/require_identity
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="flex items-center justify-between px-6 py-4 font-mono text-base font-semibold uppercase text-ink bg-[#E2E8F0] border-2 border-ink shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-hover transition-all"
              onMouseEnter={() => handleGitHubHover(true)}
              onMouseLeave={() => handleGitHubHover(false)}
              onClick={() => handleAuth("github")}
            >
              <span>[ Initialize: GitHub ]</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </button>
            <button
              className="flex items-center justify-between px-6 py-4 font-mono text-base font-semibold uppercase text-ink bg-accent-yellow border-2 border-ink shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-hover transition-all"
              onMouseEnter={() => handleGoogleHover(true)}
              onMouseLeave={() => handleGoogleHover(false)}
              onClick={() => handleAuth("google")}
            >
              <span>[ Initialize: Google ]</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Radar Box */}
      <div className="px-6 py-12 lg:p-6 relative flex items-center justify-center bg-grid bg-grid-grid bg-center">
        <div className="w-full max-w-[400px] aspect-square bg-bg border-2 border-ink shadow-brutal flex flex-col relative overflow-hidden">
          {/* Radar Header */}
          <div className="border-b-2 border-ink px-3 py-2 text-caption font-semibold flex justify-between items-center z-10">
            <span>PORT: 443</span>
            <span className={radarStatus === "ROUTING..." ? "text-ink" : "text-accent-red"}>
              {radarStatus}
            </span>
          </div>

          {/* Radar Content */}
          <div className="flex-1 flex items-center justify-center font-display text-[32px] font-extrabold relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent-red opacity-50 animate-scan" />
            <div className="text-center text-[20px] text-[#888]">
              {radarText.split(" ").map((word, i) => (
                <React.Fragment key={i}>
                  {word}
                  {i < radarText.split(" ").length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export { Hero };
