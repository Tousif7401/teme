"use client";

import React from "react";

// Message-specific report categories (adapted from peer categories)
export const MESSAGE_REPORT_CATEGORIES = [
  { id: "spam", label: "Spam / Self-Promotion", severity: "MEDIUM" as const },
  { id: "inappropriate", label: "Inappropriate Content", severity: "HIGH" as const },
  { id: "harassment", label: "Harassment / Bullying", severity: "HIGH" as const },
  { id: "hate_speech", label: "Hate Speech / Slurs", severity: "EMERGENCY" as const },
  { id: "misinformation", label: "Misinformation", severity: "LOW" as const },
  { id: "other", label: "Other Issue", severity: "LOW" as const },
];

export interface MessageReportModalProps {
  open: boolean;
  messageId: string | number | null;
  messageText: string;
  onClose: () => void;
  onSubmit: (messageId: string | number, reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * MessageReportModal - Modal for reporting individual messages.
 *
 * Features:
 * - Message preview (first 100 chars)
 * - Message-specific categories
 * - Severity color coding
 * - Brutalist styling
 */
export const MessageReportModal = React.forwardRef<HTMLDivElement, MessageReportModalProps>(
  ({ open, messageId, messageText, onClose, onSubmit, isSubmitting = false }, ref) => {
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    // Reset selection when modal opens/closes
    React.useEffect(() => {
      if (!open) {
        setSelectedCategory(null);
      }
    }, [open]);

    if (!open || messageId === null) return null;

    const handleSubmit = async () => {
      if (!selectedCategory) return;
      await onSubmit(messageId, selectedCategory);
      setSelectedCategory(null);
    };

    // Truncate message for preview
    const messagePreview = messageText.length > 100
      ? messageText.slice(0, 100) + "..."
      : messageText;

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "EMERGENCY":
          return "var(--accent-red)";
        case "HIGH":
          return "#FF0000";
        case "MEDIUM":
          return "#FFA500";
        case "LOW":
          return "#888";
        default:
          return "#888";
      }
    };

    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(0, 0, 0, 0.7)" }}
        onClick={onClose}
      >
        <div
          ref={ref}
          className="w-full max-w-md"
          style={{ background: "var(--bg)", border: "var(--border)", padding: "24px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{ marginBottom: "20px", borderBottom: "var(--border)", paddingBottom: "16px" }}>
            <h3 style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "700", margin: 0 }}>
              REPORT MESSAGE
            </h3>
            <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#888", margin: "4px 0 0" }}>
              Select a reason for reporting this message
            </p>
            {/* Message Preview */}
            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                background: "rgba(10,10,10,0.05)",
                border: "1px solid var(--ink)",
                fontFamily: "monospace",
                fontSize: "11px",
                color: "var(--ink)",
                fontStyle: "italic",
              }}
            >
              "{messagePreview}"
            </div>
          </div>

          {/* Report Categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {MESSAGE_REPORT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                disabled={isSubmitting}
                className="report-category-btn"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: selectedCategory === category.id ? "var(--accent-red)" : "transparent",
                  color: "var(--ink)",
                  border: "var(--border)",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: getSeverityColor(category.severity),
                  flexShrink: 0,
                }} />
                {category.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: "transparent",
                color: "var(--ink)",
                border: "var(--border)",
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedCategory || isSubmitting}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: !selectedCategory || isSubmitting ? "#ccc" : "var(--accent-red)",
                color: "var(--ink)",
                border: "var(--border)",
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: "700",
                cursor: (!selectedCategory || isSubmitting) ? "not-allowed" : "pointer",
                opacity: (!selectedCategory || isSubmitting) ? 0.5 : 1,
              }}
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MessageReportModal.displayName = "MessageReportModal";
