"use client";

import React from "react";

export interface ReportButtonProps {
  messageId: string | number;
  onReport: (messageId: string | number) => void;
  isReported?: boolean;
  disabled?: boolean;
}

/**
 * ReportButton - A flag icon button that appears on hover for message reporting.
 *
 * Features:
 * - Desktop: Hidden by default, appears on group-hover
 * - Mobile: Always visible (no hover on touch devices)
 * - Accessibility: Aria labels, keyboard navigation
 * - Brutalist styling matching TEME design
 */
export const ReportButton = React.forwardRef<HTMLButtonElement, ReportButtonProps>(
  ({ messageId, onReport, isReported = false, disabled = false }, ref) => {
    const handleClick = () => {
      if (!disabled && !isReported) {
        onReport(messageId);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    // If already reported, show a disabled flag icon
    if (isReported) {
      return (
        <span
          className="absolute top-0 right-0 flex items-center justify-center"
          style={{
            width: "20px",
            height: "20px",
            opacity: 0.4,
            cursor: "not-allowed",
          }}
          aria-label="This message has been reported"
        >
          <svg
            style={{ width: "14px", height: "14px" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
          </svg>
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="absolute top-0 right-0 flex items-center justify-center
                   opacity-100 lg:opacity-0 lg:group-hover:opacity-100
                   transition-opacity duration-150 ease-out
                   hover:opacity-100 focus:opacity-100 focus:outline-none"
        style={{
          width: "20px",
          height: "20px",
          background: "transparent",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : undefined,
        }}
        aria-label="Report this message"
        role="button"
        tabIndex={0}
      >
        <svg
          style={{
            width: "14px",
            height: "14px",
            color: "var(--accent-red)",
            filter: "drop-shadow(1px 1px 0 var(--ink))",
          }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
        </svg>
      </button>
    );
  }
);

ReportButton.displayName = "ReportButton";
