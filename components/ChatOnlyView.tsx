"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SimpleProfileDialog, ProfileDialog, MessageActionMenu, MessageReportModal } from "@/components";
import { backend } from "@/services/api";

export interface ChatOnlyViewProps {
  className?: string;
  onEndSession?: () => void;
  onRequestVideo?: () => void;
  onReport?: () => void;
}

export interface ChatOnlyMessage {
  id: number;
  type: "system" | "peer" | "you";
  text: string;
  isReported?: boolean;
  isEdited?: boolean;
  replyTo?: number;
  replyText?: string;
}

const ChatOnlyView = React.forwardRef<HTMLDivElement, ChatOnlyViewProps>(
  ({ className, onEndSession, onRequestVideo, onReport }, ref) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatOnlyMessage[]>([
      { id: 1, type: "system", text: "[14:02:11] Peer connection established via WebSocket." },
      { id: 2, type: "system", text: "[14:02:12] peer_8x92a joined the session." },
      { id: 3, type: "peer", text: "Anyone here good with React concurrency?" },
      { id: 4, type: "you", text: "Yeah, what's the issue?" },
      { id: 5, type: "peer", text: "Check the scratchpad. I've got this infinite loop problem." },
      { id: 6, type: "system", text: "[14:03:45] Shared scratchpad updated by peer_8x92a." },
    ]);
    const [showPanel, setShowPanel] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [showPeerProfileDialog, setShowPeerProfileDialog] = useState(false);
    const [showFullProfileDialog, setShowFullProfileDialog] = useState(false);
    const [fullProfileEditMode, setFullProfileEditMode] = useState(false);
    const [userProfile, setUserProfile] = useState({
      displayName: "you_dev",
      role: "fullstack",
      region: "in",
      techStack: ["React", "TypeScript", "Next.js", "Tailwind"],
      interestedIn: ["pair-programming"],
      languages: ["en"],
    });
    const [peerProfile, setPeerProfile] = useState({
      displayName: "peer_dev",
      role: "backend",
      region: "us",
      techStack: ["Node.js", "Python", "PostgreSQL", "Redis"],
      interestedIn: ["system-design", "open-source"],
      languages: ["en"],
    });
    const [userStacks, setUserStacks] = useState(["React", "TypeScript", "Next.js", "Tailwind"]);
    const [newStackInput, setNewStackInput] = useState("");

    // Message reporting state
    const [showMessageReportModal, setShowMessageReportModal] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [selectedMessageText, setSelectedMessageText] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [showMessageReportConfirm, setShowMessageReportConfirm] = useState(false);
    const [showCopyConfirm, setShowCopyConfirm] = useState(false);
    const [reportedMessageIds, setReportedMessageIds] = useState<Set<number>>(new Set());

    // Reply to message state
    const [replyingTo, setReplyingTo] = useState<{ id: number; text: string; sender: string } | null>(null);
    // Action menu state
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
    // Message editing state
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingMessageText, setEditingMessageText] = useState("");
    const editInputRef = useRef<HTMLInputElement>(null);
    const isEditingCancelledRef = useRef(false);
    // Long press state
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Cleanup long-press timer on unmount
    useEffect(() => {
      return () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
      };
    }, []);

    const handleSendMessage = () => {
      if (message.trim()) {
        const newMessage: ChatOnlyMessage = {
          id: Date.now(),
          type: "you",
          text: message,
          // Add reply context if replying
          ...(replyingTo && {
            replyTo: replyingTo.id,
            replyText: replyingTo.text
          })
        };
        setMessages([...messages, newMessage]);
        setMessage("");
        setReplyingTo(null);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    // Reply handlers
    const handleReplyToMessage = (messageId: number) => {
      const msg = messages.find(m => m.id === messageId);
      if (msg && msg.type !== "system") {
        const sender = msg.type === "peer" ? "peer_8x92a" : "you";
        setReplyingTo({ id: msg.id, text: msg.text, sender });
        // Focus on input
        document.getElementById("chat-only-input")?.focus();
      }
    };

    const handleCancelReply = () => {
      setReplyingTo(null);
    };

    // Action menu handlers
    const handleOpenActionMenu = (messageId: number) => {
      // Close any open menu first
      if (actionMenuOpen === messageId) {
        setActionMenuOpen(null);
      } else {
        setActionMenuOpen(messageId);
      }
    };

    const handleCloseActionMenu = () => {
      setActionMenuOpen(null);
    };

    const handleMenuReply = (messageId: number) => {
      handleReplyToMessage(messageId);
    };

    const handleMenuReport = (messageId: number) => {
      handleReportMessage(messageId);
    };

    const handleCopyMessage = (text: string) => {
      navigator.clipboard.writeText(text);
      setShowCopyConfirm(true);
      setTimeout(() => setShowCopyConfirm(false), 2000);
    };

    const handleEditMessage = (messageId: number) => {
      const msg = messages.find(m => m.id === messageId);
      if (msg && msg.type === "you") {
        setEditingMessageId(messageId);
        setEditingMessageText(msg.text);
        // Close the action menu
        setActionMenuOpen(null);
        // Focus on edit input after render
        setTimeout(() => editInputRef.current?.focus(), 0);
      }
    };

    const handleSaveEdit = () => {
      if (isEditingCancelledRef.current) {
        isEditingCancelledRef.current = false;
        setEditingMessageId(null);
        setEditingMessageText("");
        return;
      }
      if (editingMessageId && editingMessageText.trim()) {
        const updatedMessages = messages.map(msg =>
          msg.id === editingMessageId
            ? {
                ...msg,
                text: editingMessageText.trim(),
                isEdited: msg.text !== editingMessageText.trim() ? true : msg.isEdited
              } as ChatOnlyMessage
            : msg
        );
        setMessages(updatedMessages);
        setEditingMessageId(null);
        setEditingMessageText("");
      }
    };

    const handleCancelEdit = (e?: React.MouseEvent) => {
      e?.preventDefault();
      isEditingCancelledRef.current = true;
      setEditingMessageId(null);
      setEditingMessageText("");
    };

    const handleMenuEdit = (messageId: number) => {
      handleEditMessage(messageId);
    };

    // Handle keyboard for edit input
    const handleEditKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    };

    // Long press handlers for mobile
    const handleTouchStart = (messageId: number) => {
      longPressTimerRef.current = setTimeout(() => {
        handleOpenActionMenu(messageId);
        longPressTimerRef.current = null;
      }, 500);
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleTouchMove = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
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

    // Message reporting handlers
    const handleReportMessage = (messageId: number) => {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        setSelectedMessageId(messageId);
        setSelectedMessageText(msg.text);
        setShowMessageReportModal(true);
      }
    };

    const handleSubmitMessageReport = async (messageId: string | number, reason: string) => {
      setIsSubmittingReport(true);

      try {
        // TODO: Send to backend when API is ready
        // await backend.reportMessage(messageId.toString(), reason);
        console.log("Message report submitted:", { messageId, reason });

        // Mark message as reported in local state
        setReportedMessageIds(prev => new Set(prev).add(Number(messageId)));

        // Show confirmation
        setShowMessageReportModal(false);
        setShowMessageReportConfirm(true);

        // Hide confirmation after 3 seconds
        setTimeout(() => setShowMessageReportConfirm(false), 3000);
      } catch (error) {
        console.error("Failed to submit message report:", error);
      } finally {
        setIsSubmittingReport(false);
      }
    };

    const handleCloseMessageReportModal = () => {
      setShowMessageReportModal(false);
      setSelectedMessageId(null);
      setSelectedMessageText("");
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
              onClick={onReport}
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
                onClick={() => setShowPeerProfileDialog(true)}
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
                <span className="hidden sm:inline">[ REQUEST VIDEO CHAT ]</span>
                <span className="sm:hidden">[ VIDEO CHAT ]</span>
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
                  className="group"
                  onTouchStart={() => msg.type !== "system" && handleTouchStart(msg.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  style={
                    msg.type === "system"
                      ? { color: "#888", fontFamily: "monospace", fontSize: "13px" }
                      : { color: "var(--ink)" }
                  }
                >
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <div className="flex items-start gap-2 relative">
                      {/* Message content or edit field */}
                      <span className="flex-1">
                        {editingMessageId === msg.id ? (
                          // Edit mode
                          <div className="flex items-center gap-2">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              onBlur={handleSaveEdit}
                              style={{
                                flex: 1,
                                background: "var(--bg)",
                                border: "var(--border)",
                                padding: "4px 8px",
                                fontFamily: "monospace",
                                fontSize: "15px",
                              }}
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEdit}
                              style={{
                                background: "var(--accent-green)",
                                color: "var(--ink)",
                                border: "var(--border)",
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                fontFamily: "monospace",
                                cursor: "pointer",
                              }}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onMouseDown={handleCancelEdit}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                handleCancelEdit();
                              }}
                              style={{
                                background: "var(--accent-red)",
                                color: "var(--ink)",
                                border: "var(--border)",
                                padding: "4px 8px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                fontFamily: "monospace",
                                cursor: "pointer",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          // View mode
                          <>
                            {/* Reply context */}
                            {msg.replyTo && msg.replyText && (
                              <div style={{
                                marginBottom: "4px",
                                padding: "6px 8px",
                                background: "rgba(10,10,10,0.05)",
                                borderLeft: "2px solid var(--ink)",
                                fontSize: "12px",
                                color: "#888",
                                fontFamily: "monospace",
                              }}>
                                ↩ <span style={{ fontWeight: "600" }}>Replying to:</span> "{msg.replyText}"
                              </div>
                            )}
                            <div>
                              <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
                                {msg.type === "peer" ? "> peer_8x92a: " : "> you: "}
                              </span>
                              {msg.text}
                            {/* Edited badge */}
                            {msg.isEdited && (
                              <span style={{
                                marginLeft: "8px",
                                padding: "2px 6px",
                                background: "rgba(10,10,10,0.1)",
                                color: "#888",
                                fontFamily: "monospace",
                                fontSize: "9px",
                                fontStyle: "italic",
                              }}>
                                (edited)
                              </span>
                            )}
                            {/* Reported badge */}
                            {reportedMessageIds.has(msg.id) && (
                              <span style={{
                                marginLeft: "8px",
                                padding: "2px 6px",
                                background: "var(--accent-red)",
                                color: "var(--ink)",
                                fontFamily: "monospace",
                                fontSize: "9px",
                                fontWeight: "700",
                                border: "1px solid var(--ink)",
                              }}>
                                REPORTED
                              </span>
                            )}
                            </div>
                          </>
                        )}
                      </span>

                      {/* Action buttons - only show when not editing */}
                      {editingMessageId !== msg.id && (
                        <span className="flex items-center gap-1 opacity-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
                          {/* Reply icon */}
                          <button
                            onClick={() => handleReplyToMessage(msg.id)}
                            className="p-1 hover:bg-warm-sand/50 rounded transition-colors"
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--accent-blue)",
                            }}
                            title="Reply"
                            aria-label="Reply to this message"
                          >
                            <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>

                          {/* Report icon - only for peer messages */}
                          {msg.type === "peer" && !reportedMessageIds.has(msg.id) && (
                            <button
                              onClick={() => handleReportMessage(msg.id)}
                              className="p-1 hover:bg-warm-sand/50 rounded transition-colors"
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--accent-red)",
                              }}
                              title="Report"
                              aria-label="Report this message"
                            >
                              <svg style={{ width: "16px", height: "16px" }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                              </svg>
                            </button>
                          )}

                          {/* Edit icon - only for own messages */}
                          {msg.type === "you" && (
                            <button
                              onClick={() => handleEditMessage(msg.id)}
                              className="p-1 hover:bg-warm-sand/50 rounded transition-colors"
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--accent-blue)",
                              }}
                              title="Edit"
                              aria-label="Edit this message"
                            >
                              <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Three-dot menu button */}
                          <button
                            onClick={() => handleOpenActionMenu(msg.id)}
                            className="p-1 hover:bg-warm-sand/50 rounded transition-colors"
                            style={{
                              background: actionMenuOpen === msg.id ? "rgba(10,10,10,0.1)" : "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--ink)",
                            }}
                            aria-label="More options"
                          >
                            <svg style={{ width: "16px", height: "16px" }} fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>
                        </span>
                      )}

                      {/* Action menu dropdown */}
                      {actionMenuOpen === msg.id && editingMessageId !== msg.id && (
                        <MessageActionMenu
                          open={actionMenuOpen === msg.id}
                          onClose={handleCloseActionMenu}
                          onCopy={() => handleCopyMessage(msg.text)}
                          onReply={() => handleMenuReply(msg.id)}
                          onReport={() => handleMenuReport(msg.id)}
                          onEdit={() => handleMenuEdit(msg.id)}
                          isOwnMessage={msg.type === "you"}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 sm:p-4" style={{ borderTop: "2px solid var(--ink)" }}>
              {/* Reply context bar */}
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 p-2" style={{ background: "rgba(10,10,10,0.05)", border: "1px solid var(--ink)", fontSize: "11px" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: "600", color: "var(--accent-blue)" }}>
                    ↩ Replying to {replyingTo.sender}:
                  </span>
                  <span style={{ fontFamily: "monospace", color: "#888", fontStyle: "italic", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    "{replyingTo.text.slice(0, 50)}{replyingTo.text.length > 50 ? "..." : ""}"
                  </span>
                  <button
                    onClick={handleCancelReply}
                    style={{ background: "transparent", border: "none", color: "var(--ink)", cursor: "pointer", padding: "2px 6px", fontSize: "14px", fontWeight: "bold" }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex">
                <input
                  id="chat-only-input"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingTo ? "Replying..." : "Type a message..."}
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

        {/* Simple Profile Dialog */}
        <SimpleProfileDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          userProfile={userProfile}
          buttons={[
            {
              label: "[ VIEW FULL PROFILE ]",
              onClick: () => {
                setShowProfileDialog(false);
                setFullProfileEditMode(false);
                setShowFullProfileDialog(true);
              },
              variant: "primary",
            },
            {
              label: "[ EDIT PROFILE ]",
              onClick: () => {
                setShowProfileDialog(false);
                setFullProfileEditMode(true);
                setShowFullProfileDialog(true);
              },
              variant: "secondary",
            },
          ]}
        />

        {/* Full Profile Dialog */}
        <ProfileDialog
          open={showFullProfileDialog}
          onClose={() => setShowFullProfileDialog(false)}
          existingProfile={userProfile}
          initialEditMode={fullProfileEditMode}
          onSave={(updatedProfile) => {
            setUserProfile(updatedProfile);
            setShowFullProfileDialog(false);
            setShowProfileDialog(true);
          }}
        />

        {/* Peer Profile Dialog (Read-only) */}
        <SimpleProfileDialog
          open={showPeerProfileDialog}
          onClose={() => setShowPeerProfileDialog(false)}
          userProfile={peerProfile}
          readOnly={true}
        />

        {/* Message Report Modal */}
        <MessageReportModal
          open={showMessageReportModal}
          messageId={selectedMessageId}
          messageText={selectedMessageText}
          onClose={handleCloseMessageReportModal}
          onSubmit={handleSubmitMessageReport}
          isSubmitting={isSubmittingReport}
        />

        {/* Message Report Confirmation Toast */}
        {showMessageReportConfirm && (
          <div
            style={{
              position: "fixed",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 200,
              background: "var(--accent-green)",
              color: "var(--ink)",
              border: "var(--border)",
              padding: "12px 24px",
              fontFamily: "monospace",
              fontWeight: "700",
              fontSize: "13px",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            ✓ Message reported
            <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
          </div>
        )}

        {/* Copy Confirmation Toast */}
        {showCopyConfirm && (
          <div
            style={{
              position: "fixed",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 200,
              background: "var(--accent-blue)",
              color: "var(--bg)",
              border: "var(--border)",
              padding: "12px 24px",
              fontFamily: "monospace",
              fontWeight: "700",
              fontSize: "13px",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            ✓ Message copied
            <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
          </div>
        )}
      </div>
    );
  }
);

ChatOnlyView.displayName = "ChatOnlyView";

export { ChatOnlyView };
