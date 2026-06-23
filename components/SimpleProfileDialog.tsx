"use client";

import React from "react";

interface UserProfile {
  displayName: string;
  role: string;
  region: string;
  techStack: string[];
}

interface ButtonConfig {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface SimpleProfileDialogProps {
  open: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  buttons?: ButtonConfig[];
  readOnly?: boolean;
}

export function SimpleProfileDialog({ open, onClose, userProfile, buttons, readOnly = false }: SimpleProfileDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 max-sm:p-0 max-sm:items-end"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-sm:max-w-full max-sm:h-[85vh] max-sm:rounded-t-lg max-sm:rounded-b-none max-sm:mb-0"
        style={{ background: "var(--bg)", border: "2px solid var(--ink)", padding: "32px", borderRadius: "8px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex justify-between items-center max-sm:px-0 max-sm:py-2" style={{ borderBottom: "2px solid var(--ink)", marginLeft: "-32px", marginRight: "-32px", marginTop: "-32px", marginBottom: "24px", paddingLeft: "32px", paddingRight: "32px", paddingTop: "24px", paddingBottom: "16px" }}>
          <span className="max-sm:text-xs" style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "700", position: "relative", top: "1px" }}>PROFILE</span>
          <button
            onClick={onClose}
            className="max-sm:text-base"
            style={{ background: "transparent", color: "var(--ink)", border: "none", fontSize: "20px", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* Dialog Content */}
        <div style={{ marginTop: "16px" }} className="max-sm:mt-3">
          {/* User Info */}
          <div className="flex items-center gap-4 max-sm:gap-3" style={{ marginBottom: "13px" }}>
            <div className="max-sm:w-12 max-sm:h-12" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
              <svg className="max-sm:w-8 max-sm:h-8" style={{ width: "32px", height: "32px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="max-sm:min-w-0 max-sm:flex-1">
              <div className="max-sm:text-base max-sm:truncate" style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700" }}>{userProfile.displayName}</div>
              <div className="max-sm:text-[10px] max-sm:truncate" style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>// {userProfile.role} • {userProfile.region.toUpperCase()}</div>
            </div>
          </div>

          {/* Action Buttons */}
          {!readOnly && buttons && buttons.length > 0 && (
            <div className="flex gap-3 max-sm:gap-2 max-sm:flex-col">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className="max-sm:text-xs max-sm:py-2"
                  style={{
                    flex: 1,
                    background: button.variant === "primary" ? "var(--accent-blue)" : "transparent",
                    color: button.variant === "primary" ? "var(--bg)" : "var(--ink)",
                    padding: "10px 16px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: "2px solid var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="max-sm:my-4" style={{ height: "2px", background: "var(--ink)", margin: "24px 0" }} />

          {/* Stacks Preview */}
          <div>
            <span className="max-sm:text-[10px]" style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", textTransform: "uppercase" }}>{readOnly ? "Stack" : "Your Stack (Preview)"}</span>
            <div className="max-sm:gap-2 max-sm:mt-2" style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {userProfile.techStack.slice(0, 6).map((stack) => (
                <div
                  key={stack}
                  className="max-sm:text-[10px] max-sm:px-2 max-sm:py-1"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    padding: "4px 8px",
                    background: "rgba(10,10,10,0.1)",
                    border: "1px solid var(--ink)",
                  }}
                >
                  {stack}
                </div>
              ))}
              {userProfile.techStack.length > 6 && (
                <div style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 8px", color: "#888" }}>
                  +{userProfile.techStack.length - 6} more
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
