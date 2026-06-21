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
      { id: 1, type: "system", text: "[14:02:11] Peer connection established via WebSocket." },
      { id: 2, type: "system", text: "[14:02:12] peer_8x92a joined the session." },
      { id: 3, type: "peer", text: "Anyone here good with React concurrency?" },
      { id: 4, type: "you", text: "Yeah, what's the issue?" },
      { id: 5, type: "peer", text: "Check the scratchpad. I've got this infinite loop problem." },
      { id: 6, type: "system", text: "[14:03:45] Shared scratchpad updated by peer_8x92a." },
    ]);
    const [showPanel, setShowPanel] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [userStacks, setUserStacks] = useState(["React", "TypeScript", "Next.js", "Tailwind"]);
    const [newStackInput, setNewStackInput] = useState("");

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

    return (
      <div ref={ref} className={cn("h-screen flex flex-col", className)} style={{ background: "var(--bg)", color: "var(--ink)" }}>
        {/* Top Bar */}
        <div className="px-2 sm:px-4 py-6 sm:py-7 flex justify-between items-center" style={{ background: "var(--ink)", color: "var(--bg)", borderBottom: "var(--border)" }}>
          <div className="flex items-center gap-0" style={{ marginLeft: "5px" }}>
            <div className="blinking-dot" style={{ width: "10px", height: "10px", borderWidth: "2px" }} />
            <span className="hidden sm:inline" style={{ fontFamily: "sans-serif", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.05em" }}>
              TEME
            </span>
            <span className="sm:hidden" style={{ fontFamily: "sans-serif", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.05em" }}>
              TEME
            </span>
            <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#888", marginLeft: "8px" }} className="hidden sm:inline">// TEXT MODE</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block" style={{ fontFamily: "monospace", fontSize: "16px", color: "#888" }}>
              SESSION: <span style={{ color: "var(--accent-blue)" }}>0x7F3A2C</span>
            </div>
            <button
              onClick={() => console.log("Report peer clicked")}
              style={{ background: "var(--accent-red)", color: "var(--ink)", padding: "10px 18px", fontSize: "16px", border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              <span className="hidden sm:inline">[ REPORT ]</span>
              <span className="sm:hidden">[ ! ]</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
          {/* Left: Peer Panel */}
          <div className={cn(
            "fixed inset-0 z-50 flex flex-col w-full",
            !showPanel && "hidden",
            "lg:flex lg:static lg:w-1/4"
          )} style={{ borderRight: "2px solid var(--ink)", background: "var(--bg)", order: "-1" }}>
            {/* Close Button (Mobile) */}
            <button
              onClick={() => setShowPanel(false)}
              className="lg:hidden"
              style={{ background: "var(--ink)", color: "var(--bg)", border: "2px solid var(--ink)", padding: "6px 10px", fontSize: "12px", cursor: "pointer" }}
            >
              [ CLOSE ]
            </button>

            {/* Panel Content */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col items-center">
              {/* Peer Avatar */}
              <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                <svg style={{ width: "48px", height: "48px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Peer Name & Status */}
              <div className="flex items-center gap-2 mt-4">
                <div className="blinking-dot" style={{ width: "8px", height: "8px", borderWidth: "2px" }} />
                <span style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700" }}>peer_8x92a</span>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: "2px", background: "var(--ink)", margin: "16px 0" }} />

              {/* Stack Info */}
              <div style={{ width: "100%", textAlign: "left" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Stack</span>
                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 8px", background: "rgba(10,10,10,0.1)", border: "1px solid var(--ink)" }}>React</span>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 8px", background: "rgba(10,10,10,0.1)", border: "1px solid var(--ink)" }}>TypeScript</span>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 8px", background: "rgba(10,10,10,0.1)", border: "1px solid var(--ink)" }}>Node.js</span>
                </div>
              </div>

              {/* View Profile Button */}
              <button
                onClick={() => console.log("View profile clicked")}
                style={{
                  width: "100%",
                  marginTop: "16px",
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
                [ VIEW FULL PROFILE ]
              </button>
            </div>

            {/* Panel Actions */}
            <div className="p-3 sm:p-4 flex flex-col gap-2" style={{ borderTop: "2px solid var(--ink)" }}>
              <button
                onClick={onRequestVideo}
                style={{
                  background: "var(--accent-blue)",
                  color: "var(--bg)",
                  padding: "10px 16px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: "bold",
                  border: "2px solid var(--ink)",
                  cursor: "pointer",
                }}
              >
                <span className="hidden sm:inline">[ UPGRADE TO VIDEO ]</span>
                <span className="sm:hidden">[ VIDEO ]</span>
              </button>
              <button
                onClick={onEndSession}
                style={{
                  background: "var(--accent-red)",
                  color: "var(--ink)",
                  padding: "10px 16px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: "bold",
                  border: "2px solid var(--ink)",
                  cursor: "pointer",
                }}
              >
                <span className="hidden sm:inline">[ END SESSION ]</span>
                <span className="sm:hidden">[ END ]</span>
              </button>
            </div>

            {/* Profile Section */}
            <div
              className="p-3 sm:p-4 cursor-pointer"
              style={{ borderTop: "2px solid var(--ink)" }}
              onClick={() => setShowProfileDialog(true)}
            >
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Your Profile</span>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                    <svg style={{ width: "20px", height: "20px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }}>you_dev</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#888" }}>// local host</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Chat Area */}
          <div className={cn("flex-1 flex flex-col min-w-0", showPanel && "hidden lg:flex")} style={{ background: "var(--bg)" }}>
            {/* Peer Status Bar */}
            <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2" style={{ borderBottom: "2px solid var(--ink)", background: "rgba(10,10,10,0.05)" }}>
              <div className="blinking-dot" style={{ width: "8px", height: "8px", borderWidth: "2px" }} />
              <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "600" }}>peer_8x92a</span>
              <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#888" }}>// connected via WebSocket</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3" style={{ fontSize: "15px" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={
                    msg.type === "system"
                      ? { color: "#888", fontFamily: "monospace", fontSize: "13px" }
                      : { color: "var(--ink)" }
                  }
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span>
                      <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
                        {msg.type === "peer" ? "> peer_8x92a: " : "> you: "}
                      </span>
                      {msg.text}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 sm:p-4" style={{ borderTop: "2px solid var(--ink)" }}>
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: "var(--bg)",
                    border: "2px solid var(--ink)",
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: "15px",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    background: "var(--accent-blue)",
                    color: "var(--bg)",
                    padding: "10px 16px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "bold",
                    border: "2px solid var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  SEND
                </button>
              </div>
            </div>

            {/* Mobile Panel Toggle */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="lg:hidden flex items-center justify-center gap-2 py-3 px-4"
              style={{ background: "var(--ink)", color: "var(--bg)", borderTop: "2px solid var(--ink)" }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }}>PEER INFO</span>
            </button>
          </div>
        </div>

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
  }
);

ChatOnlyView.displayName = "ChatOnlyView";

export { ChatOnlyView };
