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
      <div ref={ref} className={cn("h-screen flex flex-col bg-bg", className)}>
        {/* Top Bar */}
        <div className="border-b-2 border-ink bg-ink text-bg px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-accent-green animate-blink" />
            <span className="font-display text-lg font-extrabold tracking-tighter">TEME</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-caption text-[#888]">
              SESSION: <span className="text-accent-blue">0x7F3A2C</span>
            </div>
            <button
              onClick={() => console.log("Report peer clicked")}
              className="px-3 py-1 bg-accent-red text-ink font-mono text-caption font-bold border-2 border-ink hover:bg-ink hover:text-bg transition-colors"
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
            <div className="flex-1 border-r-2 border-ink relative bg-[repeating-linear-gradient(-45deg,#e5e5e5,#e5e5e5_10px,#f0f0ee_10px,#f0f0ee_20px)] flex items-center justify-center">
              <div className="absolute top-3 left-3 bg-ink text-bg border-2 border-ink px-2 py-1 text-caption font-mono font-bold">
                REMOTE_PEER_CAM
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-ink/20 flex items-center justify-center text-ink/60">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-display text-ink/60 text-sm">peer_dev</span>
              </div>
            </div>

            {/* Local Feed */}
            <div className="flex-1 relative bg-bg flex items-center justify-center">
              <div className="absolute top-3 left-3 bg-ink text-bg border-2 border-ink px-2 py-1 text-caption font-mono font-bold">
                LOCAL_HOST_CAM
              </div>
              {isCameraOff ? (
                <div className="w-16 h-16 rounded-full bg-ink/20 flex items-center justify-center text-ink/60">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : (
                <div className="w-48 h-32 rounded bg-ink/10 border-2 border-ink/20 flex items-center justify-center">
                  <span className="font-mono text-caption text-ink/40">[ CAMERA ACTIVE ]</span>
                </div>
              )}

              {/* Media Controls - positioned at bottom of local feed */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-mono font-bold border-2 border-ink transition-colors",
                    isMicMuted ? "bg-accent-red text-ink" : "bg-bg text-ink hover:bg-ink hover:text-bg"
                  )}
                >
                  {isMicMuted ? "UNMUTE" : "MUTE"}
                </button>
                <button
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-mono font-bold border-2 border-ink transition-colors",
                    isCameraOff ? "bg-accent-red text-ink" : "bg-bg text-ink hover:bg-ink hover:text-bg"
                  )}
                >
                  {isCameraOff ? "CAM ON" : "CAM OFF"}
                </button>
                <button
                  onClick={onSkipPeer}
                  className="px-3 py-1.5 text-[11px] font-mono font-bold bg-accent-red text-ink border-2 border-ink hover:bg-ink hover:text-bg transition-colors"
                >
                  SKIP (ESC)
                </button>
              </div>
            </div>
          </div>

          {/* Right: Session Chat */}
          <div className="w-[400px] flex flex-col border-l-2 border-ink bg-bg">
            <div className="px-4 py-3 border-b-2 border-ink bg-ink/5">
              <span className="font-mono text-caption font-semibold text-ink uppercase">Session Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "text-sm",
                    msg.type === "system" && "text-[#888] font-mono text-caption",
                    msg.type === "peer" && "text-accent-green",
                    msg.type === "you" && "text-accent-blue"
                  )}
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span className="font-mono">
                        {msg.type === "peer" ? "> peer_8x92a: " : "> you: "}
                      </span>
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
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-bg border-2 border-ink px-3 py-2 font-mono text-sm focus:outline-none focus:bg-ink/5"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-accent-blue text-bg font-mono text-sm font-bold border-2 border-ink hover:bg-ink hover:text-bg transition-colors"
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
