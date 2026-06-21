"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface VideoChatViewProps {
  className?: string;
  onEndCall?: () => void;
  onSkipPeer?: () => void;
}

const VideoChatView = React.forwardRef<HTMLDivElement, VideoChatViewProps>(
  ({ className, onEndCall, onSkipPeer }, ref) => {
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
      { id: 1, type: "system", text: "[14:02:11] Peer connection established via WebRTC." },
      { id: 2, type: "peer", text: "Hey! Can you see my screen?" },
      { id: 3, type: "you", text: "Yeah, looks good. What are we working on?" },
      { id: 4, type: "peer", text: "This React hook issue. Check the scratchpad." },
    ]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
      if (message.trim()) {
        setMessages([...messages, { id: Date.now(), type: "you", text: message }]);
        setMessage("");
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    return (
      <div ref={ref} className={cn("h-screen flex flex-col", className)} style={{ background: "var(--bg)", color: "var(--ink)" }}>
        {/* Top Bar */}
        <div className="px-4 py-2 flex justify-between items-center" style={{ background: "var(--ink)", color: "var(--bg)", borderBottom: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="blinking-dot" style={{ width: "12px", height: "12px", borderWidth: "2px" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "800", letterSpacing: "-0.05em" }}>
              TEME
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>
              SESSION: <span style={{ color: "var(--accent-blue)" }}>0x7F3A2C</span>
            </div>
            <button
              onClick={() => console.log("Report peer clicked")}
              className="btn"
              style={{ background: "var(--accent-red)", color: "var(--ink)", padding: "4px 12px", fontSize: "12px" }}
            >
              [ REPORT ]
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Video Feeds Side by Side */}
          <div className="flex-1 flex min-w-0" style={{ borderRight: "var(--border)" }}>
            {/* Remote Peer Feed */}
            <div className="flex-1 relative flex items-center justify-center" style={{ borderRight: "var(--border)", background: "repeating-linear-gradient(-45deg, #e5e5e5, #e5e5e5 10px, #f0f0ee 10px, #f0f0ee 20px)" }}>
              <div className="px-2 py-1 text-caption font-bold absolute top-3 left-3" style={{ background: "var(--ink)", color: "var(--bg)", border: "var(--border)", fontSize: "10px" }}>
                REMOTE_PEER_CAM
              </div>
              <div className="flex flex-col items-center gap-2">
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                  <svg style={{ width: "32px", height: "32px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span style={{ fontFamily: "var(--font-display)", color: "rgba(10,10,10,0.6)", fontSize: "14px" }}>peer_dev</span>
              </div>
            </div>

            {/* Local Feed */}
            <div className="flex-1 relative flex items-center justify-center" style={{ background: "var(--bg)" }}>
              <div className="px-2 py-1 text-caption font-bold absolute top-3 left-3" style={{ background: "var(--ink)", color: "var(--bg)", border: "var(--border)", fontSize: "10px" }}>
                LOCAL_HOST_CAM
              </div>
              {isCameraOff ? (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                  <svg style={{ width: "32px", height: "32px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : (
                <div style={{ width: "192px", height: "128px", borderRadius: "4px", background: "rgba(10,10,10,0.1)", border: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(10,10,10,0.4)" }}>[ CAMERA ACTIVE ]</span>
                </div>
              )}

              {/* Media Controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className="cam-btn"
                  style={{
                    background: isMicMuted ? "var(--accent-red)" : "var(--bg)",
                    color: "var(--ink)",
                    border: "var(--border)",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {isMicMuted ? "UNMUTE" : "MUTE"}
                </button>
                <button
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className="cam-btn"
                  style={{
                    background: isCameraOff ? "var(--accent-red)" : "var(--bg)",
                    color: "var(--ink)",
                    border: "var(--border)",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {isCameraOff ? "CAM ON" : "CAM OFF"}
                </button>
                <button
                  onClick={onSkipPeer}
                  className="cam-btn"
                  style={{
                    background: "var(--accent-red)",
                    color: "var(--ink)",
                    border: "var(--border)",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  SKIP (ESC)
                </button>
              </div>
            </div>
          </div>

          {/* Right: Session Chat */}
          <div style={{ width: "400px", display: "flex", flexDirection: "column", borderLeft: "var(--border)", background: "var(--bg)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "var(--border)", background: "rgba(10,10,10,0.05)" }}>
              <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Session Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ fontSize: "14px" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={
                    msg.type === "system"
                      ? { color: "#888", fontFamily: "monospace", fontSize: "12px" }
                      : msg.type === "peer"
                      ? { color: "var(--accent-green)" }
                      : { color: "var(--accent-blue)" }
                  }
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span style={{ fontFamily: "monospace" }}>
                        {msg.type === "peer" ? "> peer_8x92a: " : "> you: "}
                      </span>
                      {msg.text}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3" style={{ borderTop: "var(--border)" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: "var(--bg)",
                    border: "var(--border)",
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="btn"
                  style={{
                    background: "var(--accent-blue)",
                    color: "var(--bg)",
                    padding: "8px 16px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoChatView.displayName = "VideoChatView";

export { VideoChatView };
