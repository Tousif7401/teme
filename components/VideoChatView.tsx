"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ProfileDialog, SimpleProfileDialog, MessageActionMenu, MessageReportModal } from "@/components";
import { backend } from "@/services/api";

export type VideoChatStatus = "idle" | "starting" | "searching" | "connecting" | "connected";
export interface VideoChatMessage {
  id: number;
  type: "system" | "peer" | "you";
  text: string;
  isReported?: boolean;
  isEdited?: boolean;
  replyTo?: number;
  replyText?: string;
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
  onSend: (text: string, replyContext?: { replyTo: number; replyText: string }) => void;
  onUpdateMessage?: (messageId: number, newText: string) => void;
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
    { className, status, sessionId, partnerName, localStream, remoteStream, messages, micMuted, cameraOff, onStart, onStop, onSkip, onToggleMic, onToggleCamera, onSend, onUpdateMessage, onReport },
    ref,
  ) => {
    const [message, setMessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [showFullProfileDialog, setShowFullProfileDialog] = useState(false);
    const [fullProfileEditMode, setFullProfileEditMode] = useState(false);

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

    const [userProfile, setUserProfile] = useState({
      displayName: "you_dev",
      role: "fullstack",
      region: "in",
      techStack: ["React", "TypeScript", "Next.js", "Tailwind"],
      interestedIn: ["pair-programming"],
      languages: ["en"],
    });
    const chatEndRef = useRef<HTMLDivElement>(null);
    const active = status !== "idle";
    const connected = status === "connected";

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

    const send = () => {
      if (message.trim()) {
        // If replying to a message, include the reply reference
        const replyContext = replyingTo ? {
          replyTo: replyingTo.id,
          replyText: replyingTo.text
        } : undefined;
        onSend(message, replyContext);
        setMessage("");
        setReplyingTo(null);
      }
    };
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    };

    const remoteLabel = status === "searching" ? "SEARCHING FOR A PEER…" : status === "connecting" ? "CONNECTING…" : "WAITING…";

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

    // Reply handlers
    const handleReplyToMessage = (messageId: number) => {
      const msg = messages.find(m => m.id === messageId);
      if (msg && msg.type !== "system") {
        const sender = msg.type === "peer" ? partnerName : "you";
        setReplyingTo({ id: msg.id, text: msg.text, sender });
        // Focus on input
        document.getElementById("chat-input")?.focus();
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
        // Call the parent's onUpdateMessage callback
        if (onUpdateMessage) {
          onUpdateMessage(editingMessageId, editingMessageText.trim());
        }
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

    return (
      <div ref={ref} className={cn("h-screen flex flex-col", className)} style={{ background: "var(--bg)", color: "var(--ink)" }}>
        {/* Top Bar */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center" style={{ background: "var(--ink)", color: "var(--bg)", borderBottom: "var(--border)" }}>
          <div className="flex items-center gap-1.5">
            <div className="blinking-dot" style={{ width: "9px", height: "9px", borderWidth: "2px" }} />
            <span className="text-base sm:text-xl" style={{ fontFamily: "sans-serif", fontWeight: 800, letterSpacing: "-0.05em" }}>TEME</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4">
            <div className="hidden sm:block" style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>
              SESSION: <span style={{ color: "var(--accent-blue)" }}>{sessionId || "—"}</span>
            </div>
            {!active ? (
              <button onClick={onStart} className="btn text-[11px] sm:text-xs px-2.5 py-1 sm:px-3" style={{ background: "var(--accent-green)", color: "var(--ink)", fontFamily: "monospace", fontWeight: "bold" }}>
                START
              </button>
            ) : (
              <button onClick={onStop} className="btn text-[11px] sm:text-xs px-2.5 py-1 sm:px-3" style={{ background: "var(--accent-red)", color: "var(--ink)", fontFamily: "monospace", fontWeight: "bold" }}>
                STOP
              </button>
            )}
            <button onClick={onReport} disabled={!connected} className="btn text-[11px] sm:text-xs px-2.5 py-1 sm:px-3" style={{ background: "var(--accent-red)", color: "var(--ink)", fontFamily: "monospace", fontWeight: "bold", opacity: connected ? 1 : 0.4 }}>
              REPORT
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:flex-1 lg:overflow-hidden flex-1 flex flex-col lg:flex-row">
          {/* Left: Video Feeds - stacked on mobile, side-by-side on desktop */}
          <div className="flex-1 flex flex-col sm:flex-row min-w-0 lg:min-h-full" style={{ borderRight: "var(--border)", height: "calc(100vh - 120px - 48px)" }}>
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
                <>
                  <VideoFeed stream={localStream} muted mirror />
                  {/* Mic Off Indicator */}
                  {micMuted && (
                    <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, background: "rgba(255,51,102,0.9)", color: "var(--bg)", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "monospace", fontSize: "10px", fontWeight: "bold", border: "var(--border)" }}>
                      <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a11 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                      MIC OFF
                    </div>
                  )}
                </>
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
                  className="group"
                  onTouchStart={() => msg.type !== "system" && handleTouchStart(msg.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  style={
                    msg.type === "system"
                      ? { color: "#888", fontFamily: "monospace", fontSize: "11px" }
                      : { color: "var(--ink)" } // All non-system messages use ink color (no accent colors)
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
                                fontSize: "14px",
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
                              <span style={{ fontFamily: "monospace" }}>{msg.type === "peer" ? `> ${partnerName}: ` : "> you: "}</span>
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
            <div className="p-2 sm:p-3" style={{ borderTop: "2px solid var(--ink)" }}>
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
              <div className="flex gap-0">
                <input
                  id="chat-input"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={onKey}
                  disabled={!connected}
                  placeholder={replyingTo ? "Replying..." : (connected ? "Type a message..." : "Connect to chat…")}
                  style={{ flex: 1, background: "var(--bg)", border: "var(--border)", padding: "8px 12px", fontFamily: "monospace", fontSize: "14px", opacity: connected ? 1 : 0.5 }}
                />
                <button onClick={send} disabled={!connected} className="btn" style={{ background: "var(--accent-blue)", color: "var(--bg)", padding: "8px 21px", fontFamily: "monospace", fontSize: "14px", fontWeight: "bold", width: "auto", opacity: connected ? 1 : 0.5 }}>
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Chat Bar - Full width, black background */}
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden w-full"
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
  },
);

VideoChatView.displayName = "VideoChatView";

export { VideoChatView };
