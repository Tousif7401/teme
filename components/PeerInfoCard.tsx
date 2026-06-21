"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PeerInfo {
  username: string;
  languages: string[];
  vibe: string;
  avatar?: string;
  region?: string;
}

export interface PeerInfoCardProps {
  peer: PeerInfo;
  isConnected?: boolean;
  className?: string;
  variant?: "compact" | "full";
}

const vibeLabels: Record<string, string> = {
  mentorship: "Looking for mentorship",
  pair: "Pair programming",
  review: "Code review",
  casual: "Casual chat",
};

const PeerInfoCard = React.forwardRef<HTMLDivElement, PeerInfoCardProps>(
  ({ peer, isConnected = true, className, variant = "compact" }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-cards border",
          variant === "compact"
            ? "p-3 bg-warm-sand/50 border-ash-border"
            : "p-4 bg-white border-ash-border shadow-subtle-2",
          className
        )}
      >
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )}
            />
            <span className="text-caption text-fog font-geist">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {peer.region && (
            <span className="text-caption text-fog font-geist">{peer.region}</span>
          )}
        </div>

        {/* Avatar + Username */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-driftwood/20 flex items-center justify-center">
            {peer.avatar ? (
              <img src={peer.avatar} alt={peer.username} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </div>
          <div>
            <div className="text-subheading font-medium text-midnight-ink">
              {peer.username}
            </div>
            {variant === "full" && peer.vibe && (
              <div className="text-caption text-driftwood">
                {vibeLabels[peer.vibe] || peer.vibe}
              </div>
            )}
          </div>
        </div>

        {/* Languages */}
        {peer.languages.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {peer.languages.slice(0, 3).map((lang, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-tags bg-midnight-ink/5 text-caption text-driftwood font-geist"
              >
                {lang}
              </span>
            ))}
            {peer.languages.length > 3 && (
              <span className="text-caption text-fog">
                +{peer.languages.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

PeerInfoCard.displayName = "PeerInfoCard";

export { PeerInfoCard };
