"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface VideoCanvasProps {
  stream: MediaStream | null;
  type: "local" | "remote";
  label?: string;
  className?: string;
  mirrored?: boolean;
}

const VideoCanvas = React.forwardRef<HTMLVideoElement, VideoCanvasProps>(
  ({ stream, type, label, className, mirrored = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(type === "local");
    const [isVideoOff, setIsVideoOff] = useState(!stream?.getVideoTracks()[0]?.enabled);

    // Combine refs
    React.useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !stream) return;

      video.srcObject = stream;
      video.play().catch(console.error);

      return () => {
        video.srcObject = null;
      };
    }, [stream]);

    // Track media state
    useEffect(() => {
      if (!stream) return;

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      const handleAudioChange = () => setIsMuted(!audioTrack?.enabled);
      const handleVideoChange = () => setIsVideoOff(!videoTrack?.enabled);

      audioTrack?.addEventListener("enabledchange", handleAudioChange);
      videoTrack?.addEventListener("enabledchange", handleVideoChange);

      return () => {
        audioTrack?.removeEventListener("enabledchange", handleAudioChange);
        videoTrack?.removeEventListener("enabledchange", handleVideoChange);
      };
    }, [stream]);

    return (
      <div className={cn("relative rounded-lg overflow-hidden bg-driftwood/20", className)}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={cn(
            "w-full h-full object-cover",
            mirrored && "transform scaleX(-1)"
          )}
        />

        {/* Video Off Placeholder */}
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-driftwood/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-driftwood/40 mx-auto mb-2 flex items-center justify-center">
                {type === "local" ? (
                  <span className="text-2xl">📷</span>
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <span className="text-caption text-driftwood">
                {type === "local" ? "You" : label || "Peer"}
              </span>
            </div>
          </div>
        )}

        {/* Label Badge */}
        {label && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-midnight-ink/70 rounded backdrop-blur-sm">
            <span className="text-caption text-parchment-white font-geist">
              {label}
            </span>
          </div>
        )}

        {/* Muted Indicator */}
        {isMuted && type === "remote" && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-midnight-ink/70 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-3 h-3 text-parchment-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
          </div>
        )}

        {/* Connection Indicator for Local Video */}
        {type === "local" && stream && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        )}
      </div>
    );
  }
);

VideoCanvas.displayName = "VideoCanvas";

export { VideoCanvas };
