"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ChatOnlyViewProps {
  className?: string;
  onEndSession?: () => void;
  onRequestVideo?: () => void;
}

const ChatOnlyView = React.forwardRef<HTMLDivElement, ChatOnlyViewProps>(
  ({ className, onEndSession, onRequestVideo }, ref) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
      { id: 1, type: "system", text: "[14:02:11] SYSTEM: Peer connection established via WebSocket." },
      { id: 2, type: "system", text: "[14:02:12] SYSTEM: peer_8x92a joined the session." },
      { id: 3, type: "peer", text: "Anyone here good with React concurrency?" },
      { id: 4, type: "you", text: "Yeah, what's the issue?" },
      { id: 5, type: "peer", text: "Check the scratchpad below. I've got this infinite loop problem." },
      { id: 6, type: "system", text: "[14:03:45] SYSTEM: Shared scratchpad updated by peer_8x92a." },
    ]);
    const [code, setCode] = useState(`function useDataFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Problem: infinite loop happening here?
  useEffect(() => {
    fetch(url).then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [data]); // <- dependency causes re-render loop

  return { data, loading };
}`);

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

    const getCurrentTimestamp = () => {
      const now = new Date();
      return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    };

    return (
      <div ref={ref} className={cn("h-screen flex flex-col font-mono", className)} style={{ background: "var(--ink)", color: "var(--bg)" }}>
        {/* Top Bar */}
        <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "2px solid #333", background: "var(--ink)", color: "var(--bg)" }}>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-red)" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-yellow)" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-green)" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600" }}>MODE 02: TERMINAL + CHAT</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="blinking-dot" style={{ width: "8px", height: "8px", borderWidth: "2px" }} />
            <span style={{ fontSize: "12px" }}>WSS // CONNECTED</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Terminal Chat */}
          <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: "1px dashed #444" }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3" style={{ fontSize: "15px" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={
                    msg.type === "system"
                      ? { color: "#888" }
                      : msg.type === "peer"
                      ? { color: "var(--accent-green)" }
                      : { color: "var(--accent-blue)" }
                  }
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span style={{ fontWeight: "bold" }}>
                        {msg.type === "peer" ? "> peer_8x92a: " : "> you: "}
                      </span>
                      {msg.text}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4" style={{ borderTop: "1px dashed #444" }}>
              <div className="flex gap-3 font-bold">
                <span className="animate-blink" style={{ color: "var(--accent-green)" }}>_</span>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="type message..."
                  className="flex-1 bg-transparent border-none focus:outline-none placeholder-[#888]"
                  style={{ color: "var(--bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Right: Code Scratchpad */}
          <div style={{ width: "500px", display: "flex", flexDirection: "column", borderLeft: "1px solid #333", background: "var(--ink)", color: "var(--bg)" }}>
            {/* Scratchpad Header */}
            <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #333", background: "#111" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#888" }}>// SHARED SCRATCHPAD (LIVE SYNC)</span>
              <div className="flex gap-2">
                <div className="blinking-dot" style={{ width: "8px", height: "8px", borderWidth: "2px" }} />
                <span style={{ fontSize: "12px" }}>SYNCED</span>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 p-6 overflow-auto" style={{ fontSize: "15px", lineHeight: "1.5", background: "#111" }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent border-none resize-none focus:outline-none"
                style={{
                  color: "#a78bfa",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "15px",
                  lineHeight: "1.5",
                }}
                spellCheck={false}
              />
            </div>

            {/* Status Bar */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #333", background: "var(--ink)" }}>
              <div className="flex gap-4" style={{ fontSize: "12px" }}>
                <span style={{ color: "#888" }}>LANG: JavaScript</span>
                <span style={{ color: "#888" }}>LN: 14</span>
                <span style={{ color: "#888" }}>COL: 42</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onRequestVideo}
                  className="btn"
                  style={{
                    background: "var(--accent-blue)",
                    color: "var(--bg)",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    border: "var(--border)",
                  }}
                >
                  [ UPGRADE TO VIDEO ]
                </button>
                <button
                  onClick={onEndSession}
                  className="btn"
                  style={{
                    background: "var(--accent-red)",
                    color: "var(--ink)",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    border: "var(--border)",
                  }}
                >
                  [ END SESSION ]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatOnlyView.displayName = "ChatOnlyView";

export { ChatOnlyView };
