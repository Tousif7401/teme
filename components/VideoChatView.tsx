"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type VideoChatStatus = "idle" | "starting" | "searching" | "connecting" | "connected";
export interface VideoChatMessage {
  id: number;
  type: "system" | "peer" | "you";
  text: string;
}

export interface VideoChatViewProps {
  className?: string;
  status: VideoChatStatus;
  sessionId: string;
  partnerName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  messages: VideoChatMessage[];
  micMuted: boolean;
  cameraOff: boolean;
  onStart: () => void;
  onStop: () => void;
  onSkip: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSend: (text: string) => void;
  onReport: () => void;
}

/** Attaches a MediaStream to a <video> element. */
function VideoFeed({ stream, muted, mirror }: { stream: MediaStream | null; muted?: boolean; mirror?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn("absolute inset-0 h-full w-full object-cover", mirror && "scale-x-[-1]")}
    />
  );
}

/** Loading overlay shown on a dark screen while the peer/camera is not ready. */
function LoadingOverlay({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-3", dark && "bg-ink/90")}>
      <span className={cn("h-8 w-8 animate-spin rounded-full border-2 border-t-transparent", dark ? "border-bg" : "border-ink")} />
      <span className={cn("font-mono text-caption tracking-wider", dark ? "text-bg" : "text-ink/50")}>{label}</span>
    </div>
  );
}

const VideoChatView = React.forwardRef<HTMLDivElement, VideoChatViewProps>(
  (
    {
      className,
      status,
      sessionId,
      partnerName,
      localStream,
      remoteStream,
      messages,
      micMuted,
      cameraOff,
      onStart,
      onStop,
      onSkip,
      onToggleMic,
      onToggleCamera,
      onSend,
      onReport,
    },
    ref,
  ) => {
    const [message, setMessage] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const active = status !== "idle";

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
      if (message.trim()) {
        onSend(message);
        setMessage("");
      }
    };
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    };

    const remoteLabel =
      status === "searching" ? "SEARCHING FOR A PEER…" : status === "connecting" ? "CONNECTING…" : "WAITING…";

    return (
      <div ref={ref} className={cn("h-screen flex flex-col bg-bg", className)}>
        {/* Top Bar */}
        <div className="border-b-2 border-ink bg-ink text-bg px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={cn("h-2 w-2 rounded-full", status === "connected" ? "bg-accent-green animate-blink" : "bg-[#888]")} />
            <span className="font-display text-lg font-extrabold tracking-tighter">TEME</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-caption text-[#888]">
              SESSION: <span className="text-accent-blue">{sessionId || "—"}</span>
            </div>
            {!active ? (
              <button
                onClick={onStart}
                className="px-3 py-1 bg-accent-green text-ink font-mono text-caption font-bold border-2 border-ink hover:bg-ink hover:text-bg transition-colors"
              >
                [ START ]
              </button>
            ) : (
              <button
                onClick={onStop}
                className="px-3 py-1 bg-accent-red text-ink font-mono text-caption font-bold border-2 border-ink hover:bg-ink hover:text-bg transition-colors"
              >
                [ STOP ]
              </button>
            )}
            <button
              onClick={onReport}
              disabled={status !== "connected"}
              className="px-3 py-1 bg-accent-red text-ink font-mono text-caption font-bold border-2 border-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-40"
            >
              [ REPORT ]
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Video Feeds Side by Side */}
          <div className="flex-1 flex border-r-2 border-ink min-w-0">
            {/* Remote Peer Feed */}
            <div className="flex-1 border-r-2 border-ink relative overflow-hidden bg-[repeating-linear-gradient(-45deg,#e5e5e5,#e5e5e5_10px,#f0f0ee_10px,#f0f0ee_20px)] flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 bg-ink text-bg border-2 border-ink px-2 py-1 text-caption font-mono font-bold">
                REMOTE_PEER_CAM
              </div>
              {remoteStream ? (
                <>
                  <VideoFeed stream={remoteStream} />
                  <div className="absolute bottom-3 left-3 z-10 bg-ink/70 text-bg px-2 py-0.5 text-caption font-mono">
                    {partnerName}
                  </div>
                </>
              ) : active ? (
                <LoadingOverlay label={remoteLabel} dark />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink/50">
                  <span className="font-mono text-caption">PRESS START TO BEGIN</span>
                </div>
              )}
            </div>

            {/* Local Feed */}
            <div className="flex-1 relative overflow-hidden bg-bg flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 bg-ink text-bg border-2 border-ink px-2 py-1 text-caption font-mono font-bold">
                LOCAL_HOST_CAM
              </div>

              {localStream && !cameraOff ? (
                <VideoFeed stream={localStream} muted mirror />
              ) : status === "starting" ? (
                <LoadingOverlay label="INITIALIZING CAMERA…" />
              ) : cameraOff ? (
                <div className="w-16 h-16 rounded-full bg-ink/20 flex items-center justify-center text-ink/60">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : (
                <div className="w-48 h-32 rounded bg-ink/10 border-2 border-ink/20 flex items-center justify-center">
                  <span className="font-mono text-caption text-ink/40">[ CAMERA OFF ]</span>
                </div>
              )}

              {/* Media Controls */}
              {active && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  <button
                    onClick={onToggleMic}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-mono font-bold border-2 border-ink transition-colors",
                      micMuted ? "bg-accent-red text-ink" : "bg-bg text-ink hover:bg-ink hover:text-bg",
                    )}
                  >
                    {micMuted ? "UNMUTE" : "MUTE"}
                  </button>
                  <button
                    onClick={onToggleCamera}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-mono font-bold border-2 border-ink transition-colors",
                      cameraOff ? "bg-accent-red text-ink" : "bg-bg text-ink hover:bg-ink hover:text-bg",
                    )}
                  >
                    {cameraOff ? "CAM ON" : "CAM OFF"}
                  </button>
                  <button
                    onClick={onSkip}
                    className="px-3 py-1.5 text-[11px] font-mono font-bold bg-accent-red text-ink border-2 border-ink hover:bg-ink hover:text-bg transition-colors"
                  >
                    SKIP (ESC)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Session Chat */}
          <div className="w-[400px] flex flex-col border-l-2 border-ink bg-bg">
            <div className="px-4 py-3 border-b-2 border-ink bg-ink/5">
              <span className="font-mono text-caption font-semibold text-ink uppercase">Session Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-[#888] font-mono text-caption">
                  {active ? "// connecting…" : "// press START to find a peer"}
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "text-sm",
                    msg.type === "system" && "text-[#888] font-mono text-caption",
                    msg.type === "peer" && "text-accent-green",
                    msg.type === "you" && "text-accent-blue",
                  )}
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span className="font-mono">{msg.type === "peer" ? `> ${partnerName}: ` : "> you: "}</span>
                      {msg.text}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t-2 border-ink">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={onKey}
                  disabled={status !== "connected"}
                  placeholder={status === "connected" ? "Type a message..." : "Connect to chat…"}
                  className="flex-1 bg-bg border-2 border-ink px-3 py-2 font-mono text-sm focus:outline-none focus:bg-ink/5 disabled:opacity-50"
                />
                <button
                  onClick={send}
                  disabled={status !== "connected"}
                  className="px-4 py-2 bg-accent-blue text-bg font-mono text-sm font-bold border-2 border-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-50"
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

VideoChatView.displayName = "VideoChatView";

export { VideoChatView };
