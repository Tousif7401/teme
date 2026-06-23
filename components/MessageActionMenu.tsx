"use client";

import React, { useRef, useEffect, useState } from "react";

export interface MessageActionMenuProps {
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
  onReply: () => void;
  onReport: () => void;
  onEdit: () => void;
  isOwnMessage: boolean;
}

/**
 * MessageActionMenu - Dropdown menu with message options
 *
 * For peer messages: Copy, Reply, Report
 * For own messages: Copy, Reply, Edit, Option
 */
export const MessageActionMenu = React.forwardRef<HTMLDivElement, MessageActionMenuProps>(
  ({ open, onClose, onCopy, onReply, onReport, onEdit, isOwnMessage }, ref) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [dropDirection, setDropDirection] = useState<"up" | "down">("up");

    // Calculate available space and set drop direction
    useEffect(() => {
      if (!open || !menuRef.current) return;

      const rect = menuRef.current.getBoundingClientRect();
      const menuHeight = 140; // Approximate height of the menu
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Show below if not enough space above
      setDropDirection(spaceAbove < menuHeight + 20 ? "down" : "up");
    }, [open]);

    // Handle click outside to close
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    const handleAction = (action: () => void) => {
      action();
      onClose();
    };

    return (
      <div
        ref={menuRef}
        style={{
          position: "absolute",
          ...(dropDirection === "up"
            ? { bottom: "calc(100% + 6px)" }
            : { top: "calc(100% + 6px)" }
          ),
          right: 0,
          background: "var(--bg)",
          border: "var(--border)",
          boxShadow: "var(--shadow-brutal-hover)",
          padding: "4px",
          minWidth: "130px",
          zIndex: 50,
          borderRadius: "4px",
        }}
      >
        {/* Copy Option */}
        <button
          onClick={() => handleAction(onCopy)}
          className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-warm-sand/50 transition-colors"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "var(--ink)",
          }}
        >
          <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>

        {/* Reply Option */}
        <button
          onClick={() => handleAction(onReply)}
          className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-warm-sand/50 transition-colors"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "var(--ink)",
          }}
        >
          <svg style={{ width: "14px", height: "14px", color: "var(--accent-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Reply
        </button>

        {/* Report Option - only for peer messages */}
        {!isOwnMessage && (
          <button
            onClick={() => handleAction(onReport)}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-warm-sand/50 transition-colors"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "var(--accent-red)",
            }}
          >
            <svg style={{ width: "14px", height: "14px" }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
            </svg>
            Report
          </button>
        )}

        {/* Edit Option - only for own messages */}
        {isOwnMessage && (
          <button
            onClick={() => handleAction(onEdit)}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-warm-sand/50 transition-colors"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "var(--accent-blue)",
            }}
          >
            <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
      </div>
    );
  }
);

MessageActionMenu.displayName = "MessageActionMenu";
