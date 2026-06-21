"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave?: () => void;
  className?: string;
  variant?: "floating" | "inline";
}

const MediaControls = React.forwardRef<HTMLDivElement, MediaControlsProps>(
  (
    {
      isAudioEnabled,
      isVideoEnabled,
      onToggleAudio,
      onToggleVideo,
      onLeave,
      className,
      variant = "floating",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          variant === "floating" && "p-2 bg-midnight-ink/90 backdrop-blur-sm rounded-2xl shadow-lg",
          variant === "inline" && "px-4 py-2 bg-warm-sand rounded-cards",
          className
        )}
      >
        {/* Toggle Audio */}
        <button
          onClick={onToggleAudio}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isAudioEnabled
              ? "bg-white/10 text-parchment-white hover:bg-white/20"
              : "bg-red-500 text-parchment-white hover:bg-red-600",
            variant === "inline" && [
              isAudioEnabled
                ? "bg-white text-midnight-ink hover:bg-driftwood"
                : "bg-red-500 text-white hover:bg-red-600",
            ]
          )}
          title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {isAudioEnabled ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* Toggle Video */}
        <button
          onClick={onToggleVideo}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isVideoEnabled
              ? "bg-white/10 text-parchment-white hover:bg-white/20"
              : "bg-red-500 text-parchment-white hover:bg-red-600",
            variant === "inline" && [
              isVideoEnabled
                ? "bg-white text-midnight-ink hover:bg-driftwood"
                : "bg-red-500 text-white hover:bg-red-600",
            ]
          )}
          title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          )}
        </button>

        {/* Leave Button */}
        {onLeave && (
          <>
            <div className={cn(
              "w-px h-6",
              variant === "floating" ? "bg-white/20" : "bg-ash-border"
            )} />
            <button
              onClick={onLeave}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-red-500 text-parchment-white hover:bg-red-600"
              )}
              title="Leave room"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        )}
      </div>
    );
  }
);

MediaControls.displayName = "MediaControls";

export { MediaControls };
