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

/** Attaches a MediaStream to a <video> element that fills its tile. */
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
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: mirror ? "scaleX(-1)" : undefined }}
    />
  );
}

/** Loading overlay shown while the peer/camera is not ready. */
function LoadingOverlay({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: dark ? "rgba(10,10,10,0.92)" : "transparent",
      }}
    >
      <span
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: `3px solid ${dark ? "var(--bg)" : "var(--ink)"}`,
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.1em", color: dark ? "var(--bg)" : "rgba(10,10,10,0.5)" }}>
        {label}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const LABEL_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "12px",
  left: "12px",
  zIndex: 10,
  background: "var(--ink)",
  color: "var(--bg)",
  border: "var(--border)",
  padding: "4px 8px",
  fontSize: "10px",
  fontWeight: "bold",
  fontFamily: "monospace",
};

const VideoChatView = React.forwardRef<HTMLDivElement, VideoChatViewProps>(
  (
    { className, status, sessionId, partnerName, localStream, remoteStream, messages, micMuted, cameraOff, onStart, onStop, onSkip, onToggleMic, onToggleCamera, onSend, onReport },
    ref,
  ) => {
    const [message, setMessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [userStacks, setUserStacks] = useState(["React", "TypeScript", "Next.js", "Tailwind"]);
    const [newStackInput, setNewStackInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const active = status !== "idle";
    const connected = status === "connected";

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

    const handleAddStack = () => {
      if (newStackInput.trim() && !userStacks.includes(newStackInput.trim())) {
        setUserStacks([...userStacks, newStackInput.trim()]);
        setNewStackInput("");
      }
    };

    const handleRemoveStack = (stackToRemove: string) => {
      setUserStacks(userStacks.filter(stack => stack !== stackToRemove));
    };

    const handleStackKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddStack();
      }
    };

    const remoteLabel = status === "searching" ? "SEARCHING FOR A PEER…" : status === "connecting" ? "CONNECTING…" : "WAITING…";

    return (
      <div ref={ref} className={cn("h-screen flex flex-col", className)} style={{ background: "var(--bg)", color: "var(--ink)" }}>
        {/* Top Bar */}
        <div className="px-2 sm:px-4 py-6 sm:py-7 flex justify-between items-center" style={{ background: "var(--ink)", color: "var(--bg)", borderBottom: "var(--border)" }}>
          <div className="flex items-center gap-0" style={{ marginLeft: "5px" }}>
            <div className="blinking-dot" style={{ width: "10px", height: "10px", borderWidth: "2px" }} />
            <span className="hidden sm:inline" style={{ fontFamily: "sans-serif", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.05em" }}>TEME</span>
            <span className="sm:hidden" style={{ fontFamily: "sans-serif", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.05em" }}>TEME</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-4">
            <div className="hidden sm:block" style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>
              SESSION: <span style={{ color: "var(--accent-blue)" }}>{sessionId || "—"}</span>
            </div>
            {!active ? (
              <button onClick={onStart} className="btn topbar-btn max-sm:flex-[0_0_46px] max-sm:-mt-0.5" style={{ background: "var(--accent-green)", color: "var(--ink)", padding: "1px 3px sm:px-3 sm:py-1", fontSize: "6px", fontFamily: "monospace", fontWeight: "bold", marginRight: "5px" }}>
                <span className="text-[6px] sm:text-xs">[ START ]</span>
              </button>
            ) : (
              <button onClick={onStop} className="btn topbar-btn max-sm:flex-[0_0_42px]" style={{ background: "var(--accent-red)", color: "var(--ink)", padding: "1px 3px sm:px-3 sm:py-1", fontSize: "6px", fontFamily: "monospace", fontWeight: "bold" }}>
                <span className="text-[6px] sm:text-xs">[ STOP ]</span>
              </button>
            )}
            <button onClick={onReport} disabled={!connected} className="btn topbar-btn max-sm:flex-[0_0_65px]" style={{ background: "var(--accent-red)", color: "var(--ink)", padding: "1px 3px sm:px-3 sm:py-1", fontSize: "6px", fontFamily: "monospace", fontWeight: "bold", opacity: connected ? 1 : 0.4, marginRight: "10px" }}>
              <span className="text-[6px] sm:text-xs">[ REPORT ]</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Video Feeds - stacked on mobile, side-by-side on desktop */}
          <div className="flex-1 flex flex-col sm:flex-row min-w-0" style={{ borderRight: "var(--border)" }}>
            {/* Remote Peer Feed */}
            <div className="flex-1 relative flex items-center justify-center border-b sm:border-b-0 sm:border-r" style={{ overflow: "hidden", borderColor: "var(--border)", background: "repeating-linear-gradient(-45deg, #e5e5e5, #e5e5e5 10px, #f0f0ee 10px, #f0f0ee 20px)" }}>
              <div style={LABEL_STYLE}>REMOTE_PEER_CAM</div>
              {remoteStream ? (
                <>
                  <VideoFeed stream={remoteStream} />
                  <div style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 10, background: "rgba(10,10,10,0.7)", color: "var(--bg)", padding: "2px 8px", fontFamily: "monospace", fontSize: "11px" }}>
                    {partnerName}
                  </div>
                </>
              ) : active ? (
                <LoadingOverlay label={remoteLabel} dark />
              ) : (
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(10,10,10,0.5)" }}>PRESS START TO BEGIN</span>
              )}
            </div>

            {/* Local Feed */}
            <div className="flex-1 relative flex items-center justify-center" style={{ overflow: "hidden", background: "var(--bg)" }}>
              <div style={LABEL_STYLE}>LOCAL_HOST_CAM</div>
              {localStream && !cameraOff ? (
                <VideoFeed stream={localStream} muted mirror />
              ) : status === "starting" ? (
                <LoadingOverlay label="INITIALIZING CAMERA…" />
              ) : cameraOff ? (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                  <svg style={{ width: "32px", height: "32px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : (
                <div style={{ width: "192px", height: "128px", borderRadius: "4px", background: "rgba(10,10,10,0.1)", border: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(10,10,10,0.4)" }}>[ CAMERA OFF ]</span>
                </div>
              )}

              {/* Media Controls */}
              {active && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 10 }}>
                  <button onClick={onToggleMic} className="cam-btn" style={{ background: micMuted ? "var(--accent-red)" : "var(--bg)", color: "var(--ink)", border: "var(--border)", padding: "6px 12px", fontSize: "11px", fontWeight: "bold", fontFamily: "monospace" }}>
                    {micMuted ? "UNMUTE" : "MUTE"}
                  </button>
                  <button onClick={onToggleCamera} className="cam-btn" style={{ background: cameraOff ? "var(--accent-red)" : "var(--bg)", color: "var(--ink)", border: "var(--border)", padding: "6px 12px", fontSize: "11px", fontWeight: "bold", fontFamily: "monospace" }}>
                    {cameraOff ? "CAM ON" : "CAM OFF"}
                  </button>
                  <button onClick={onSkip} className="cam-btn" style={{ background: "var(--accent-red)", color: "var(--ink)", border: "var(--border)", padding: "6px 12px", fontSize: "11px", fontWeight: "bold", fontFamily: "monospace" }}>
                    SKIP (ESC)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Session Chat - Equal width on desktop */}
          <div className={cn(
            "fixed inset-0 z-50 flex flex-col w-full", // Mobile: fullscreen overlay
            !showChat && "hidden", // Hidden by default on mobile
            "lg:flex lg:static lg:w-1/4" // Desktop: always visible, static position, 25% width
          )} style={{ borderLeft: "2px solid var(--ink)", background: "var(--bg)" }}>
            {/* Chat Header */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center" style={{ borderBottom: "2px solid var(--ink)", background: "rgba(10,10,10,0.05)" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Session Chat</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowProfileDialog(true)}
                  style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--ink)", padding: "4px 8px", fontSize: "10px", cursor: "pointer", fontFamily: "monospace" }}
                >
                  [ PROFILE ]
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  className="lg:hidden"
                  style={{ background: "var(--ink)", color: "var(--bg)", border: "2px solid var(--ink)", padding: "4px 8px", fontSize: "10px", cursor: "pointer" }}
                >
                  [ CLOSE ]
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ fontSize: "14px" }}>
              {messages.length === 0 && (
                <div style={{ color: "#888", fontFamily: "monospace", fontSize: "12px" }}>{active ? "// connecting…" : "// press START to find a peer"}</div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={
                    msg.type === "system"
                      ? { color: "#888", fontFamily: "monospace", fontSize: "11px" }
                      : { color: "var(--ink)" } // All non-system messages use ink color (no accent colors)
                  }
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span style={{ fontFamily: "monospace" }}>{msg.type === "peer" ? `> ${partnerName}: ` : "> you: "}</span>
                      {msg.text}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-2 sm:p-3" style={{ borderTop: "2px solid var(--ink)" }}>
              <div className="flex gap-0">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={onKey}
                  disabled={!connected}
                  placeholder={connected ? "Type a message..." : "Connect to chat…"}
                  style={{ flex: 1, background: "var(--bg)", border: "var(--border)", padding: "8px 12px", fontFamily: "monospace", fontSize: "14px", opacity: connected ? 1 : 0.5 }}
                />
                <button onClick={send} disabled={!connected} className="btn" style={{ background: "var(--accent-blue)", color: "var(--bg)", padding: "8px 21px", fontFamily: "monospace", fontSize: "14px", fontWeight: "bold", opacity: connected ? 1 : 0.5, width: "auto" }}>
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Chat Bar - Full width, black background */}
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
          style={{
            background: "#000",
            color: "#fff",
            padding: "12px 16px",
            fontSize: "12px",
            fontFamily: "monospace",
            fontWeight: "bold",
            borderTop: "2px solid var(--border)"
          }}
        >
          [ CHAT ]
        </button>

        {/* Profile Dialog */}
        {showProfileDialog && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setShowProfileDialog(false)}
          >
            <div
              className="w-full max-w-md"
              style={{ background: "var(--bg)", border: "2px solid var(--ink)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "2px solid var(--ink)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "700" }}>PROFILE</span>
                <button
                  onClick={() => setShowProfileDialog(false)}
                  style={{ background: "transparent", color: "var(--ink)", border: "none", fontSize: "20px", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>

              {/* Dialog Content */}
              <div className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                    <svg style={{ width: "32px", height: "32px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700" }}>you_dev</div>
                    <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>// local host</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    style={{
                      flex: 1,
                      background: "var(--accent-blue)",
                      color: "var(--bg)",
                      padding: "8px 12px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      fontWeight: "600",
                      border: "2px solid var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    [ VIEW PROFILE ]
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "var(--ink)",
                      padding: "8px 12px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      fontWeight: "600",
                      border: "2px solid var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    [ EDIT PROFILE ]
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: "2px", background: "var(--ink)", margin: "16px 0" }} />

                {/* Stacks Section */}
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Your Stack</span>
                  <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {userStacks.map((stack) => (
                      <div
                        key={stack}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          padding: "4px 8px",
                          background: "rgba(10,10,10,0.1)",
                          border: "1px solid var(--ink)",
                        }}
                      >
                        <span>{stack}</span>
                        <button
                          onClick={() => handleRemoveStack(stack)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", fontSize: "14px", lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Stack Input */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newStackInput}
                      onChange={(e) => setNewStackInput(e.target.value)}
                      onKeyPress={handleStackKeyPress}
                      placeholder="Add stack..."
                      style={{
                        flex: 1,
                        background: "var(--bg)",
                        border: "2px solid var(--ink)",
                        padding: "6px 10px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    />
                    <button
                      onClick={handleAddStack}
                      style={{
                        background: "var(--ink)",
                        color: "var(--bg)",
                        padding: "6px 12px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        fontWeight: "600",
                        border: "2px solid var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      [ + ]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

VideoChatView.displayName = "VideoChatView";

export { VideoChatView };
