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

    // Get current timestamp for display
    const getCurrentTimestamp = () => {
      const now = new Date();
      return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    };

    return (
      <div ref={ref} className={cn("h-screen flex flex-col bg-ink text-bg font-mono", className)}>
        {/* Top Bar */}
        <div className="border-b border-[#333] bg-ink text-bg px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-red" />
              <span className="w-2 h-2 rounded-full bg-accent-yellow" />
              <span className="w-2 h-2 rounded-full bg-accent-green" />
            </div>
            <span className="text-caption font-semibold">MODE 02: TERMINAL + CHAT</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-accent-green animate-blink" />
            <span className="text-caption text-accent-green">WSS // CONNECTED</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Terminal Chat */}
          <div className="flex-1 flex flex-col border-r border-[#333] min-w-0">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "text-[15px]",
                    msg.type === "system" && "text-[#888]",
                    msg.type === "peer" && "text-accent-green",
                    msg.type === "you" && "text-accent-blue"
                  )}
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span className="font-bold">
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
            <div className="border-t border-dashed border-[#444] p-4">
              <div className="flex gap-3 font-bold">
                <span className="text-accent-green animate-blink">_</span>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="type message..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-bg placeholder-[#888]"
                />
              </div>
            </div>
          </div>

          {/* Right: Code Scratchpad */}
          <div className="w-[500px] flex flex-col border-l border-[#333] bg-ink text-bg">
            {/* Scratchpad Header */}
            <div className="border-b border-[#333] px-4 py-3 flex justify-between items-center bg-[#111]">
              <span className="text-caption font-semibold text-[#888]">// SHARED SCRATCHPAD (LIVE SYNC)</span>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-blink" />
                <span className="text-caption text-accent-green">SYNCED</span>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 p-6 text-[15px] leading-relaxed overflow-auto bg-[#111]">
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
            <div className="border-t border-[#333] px-4 py-3 bg-ink flex items-center justify-between">
              <div className="flex gap-4 text-caption">
                <span className="text-[#888]">LANG: JavaScript</span>
                <span className="text-[#888]">LN: 14</span>
                <span className="text-[#888]">COL: 42</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onRequestVideo}
                  className="px-4 py-1.5 bg-accent-blue text-bg text-caption font-bold border border-accent-blue hover:bg-bg hover:text-ink transition-colors"
                >
                  [ UPGRADE TO VIDEO ]
                </button>
                <button
                  onClick={onEndSession}
                  className="px-4 py-1.5 bg-accent-red text-ink text-caption font-bold border border-accent-red hover:bg-bg hover:text-ink transition-colors"
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
