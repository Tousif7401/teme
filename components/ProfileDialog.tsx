"use client";

import React, { useState, useRef, useEffect } from "react";

const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile", "design", "student", "other"];
const REGIONS = [
  ["in", "India"], ["eu", "Europe"], ["na", "North America"], ["sa", "South America"],
  ["me", "Middle East"], ["af", "Africa"], ["as", "Asia (other)"], ["oc", "Oceania"],
];
const STACK_SUGGESTIONS = ["typescript", "javascript", "python", "react", "next.js", "node", "go", "rust", "java", "c++", "postgres", "mongodb", "docker", "kubernetes", "aws", "graphql"];
const INTEREST_SUGGESTIONS = ["pair-programming", "code-review", "system-design", "open-source", "hackathons", "startups", "mentoring", "debugging", "ai/ml", "web3", "freelance", "casual"];
const LANG_SUGGESTIONS = ["en", "hi", "es", "fr", "de", "pt", "zh", "ja", "ar"];

interface UserProfile {
  displayName: string;
  role: string;
  region: string;
  techStack: string[];
  interestedIn: string[];
  languages: string[];
  avatar?: string;
}

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  existingProfile?: UserProfile;
  initialEditMode?: boolean;
  onSave?: (updatedProfile: UserProfile) => void;
}

export function ProfileDialog({ open, onClose, existingProfile, initialEditMode = false, onSave }: ProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    role: "fullstack",
    region: "in",
    techStack: [],
    interestedIn: [],
    languages: ["en"],
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile when dialog opens
  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
      setAvatarPreview(existingProfile.avatar || "");
    }
    setIsEditing(initialEditMode);
  }, [existingProfile, open, initialEditMode]);

  const handleSave = () => {
    // TODO: Save to backend
    console.log("Saving profile:", profile);
    if (avatarFile) {
      console.log("Avatar file to upload:", avatarFile);
    }
    setIsEditing(false);
    onSave?.(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original profile
    if (existingProfile) {
      setProfile(existingProfile);
      setAvatarPreview(existingProfile.avatar || "");
    }
    setAvatarFile(null);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag input handlers
  const addTag = (field: "techStack" | "interestedIn" | "languages", value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !profile[field].includes(tag) && profile[field].length < 20) {
      setProfile({ ...profile, [field]: [...profile[field], tag] });
    }
  };

  const removeTag = (field: "techStack" | "interestedIn" | "languages", tag: string) => {
    setProfile({ ...profile, [field]: profile[field].filter((t) => t !== tag) });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 max-sm:p-0 max-sm:items-end"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-sm:max-w-full max-sm:h-[90vh] max-sm:rounded-t-lg max-sm:rounded-b-none max-sm:mb-0 max-sm:overflow-y-auto"
        style={{ background: "var(--bg)", border: "2px solid var(--ink)", borderRadius: "8px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex justify-between items-center" style={{ borderBottom: "2px solid var(--ink)", paddingLeft: "40px", paddingRight: "40px", paddingTop: "4px", paddingBottom: "4px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "700" }}>
            {isEditing ? "EDIT PROFILE" : "PROFILE"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "transparent", color: "var(--ink)", border: "none", fontSize: "20px", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* Dialog Content */}
        <div style={{ overflowY: "auto", flex: 1, paddingLeft: "40px", paddingRight: "40px", paddingTop: "28px", paddingBottom: "28px" }}>
          {/* Avatar Section */}
          <div className="flex items-center gap-5 mb-8">
            <div
              onClick={handleAvatarClick}
              className="relative cursor-pointer"
              style={{ position: "relative" }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,10,10,0.6)" }}>
                  <svg style={{ width: "40px", height: "40px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {isEditing && (
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", background: "var(--accent-blue)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bg)", fontSize: "12px", border: "2px solid var(--ink)" }}>
                  +
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className="flex-1">
              {isEditing ? (
                <>
                  <label style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>Display Name</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    placeholder="Your display name"
                    maxLength={40}
                    style={{
                      width: "100%",
                      border: "var(--border)",
                      background: "var(--bg)",
                      padding: "8px 12px",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700" }}>{profile.displayName || "Anonymous"}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>// local host</div>
                </>
              )}
            </div>
          </div>

          {/* View Mode - Show Details */}
          {!isEditing && (
            <div>
              {/* Role & Region */}
              <div className="grid grid-cols-2 gap-5" style={{ marginBottom: "24px" }}>
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</span>
                  <div style={{ fontFamily: "monospace", fontSize: "15px", marginTop: "8px", fontWeight: "500" }}>{profile.role}</div>
                </div>
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Region</span>
                  <div style={{ fontFamily: "monospace", fontSize: "15px", marginTop: "8px", fontWeight: "500" }}>{REGIONS.find(([code]) => code === profile.region)?.[1] || profile.region}</div>
                </div>
              </div>

              {/* Tech Stack */}
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tech Stack</span>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {profile.techStack.length > 0 ? (
                    profile.techStack.map((stack) => (
                      <span key={stack} style={{ fontFamily: "monospace", fontSize: "13px", padding: "6px 12px", background: "rgba(10,10,10,0.08)", border: "1px solid rgba(10,10,10,0.15)", borderRadius: "4px" }}>
                        {stack}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#888" }}>No tech stack added</span>
                  )}
                </div>
              </div>

              {/* Interested In */}
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interested In</span>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {profile.interestedIn.length > 0 ? (
                    profile.interestedIn.map((interest) => (
                      <span key={interest} style={{ fontFamily: "monospace", fontSize: "13px", padding: "6px 12px", background: "rgba(10,10,10,0.08)", border: "1px solid rgba(10,10,10,0.15)", borderRadius: "4px" }}>
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#888" }}>No interests added</span>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div>
                <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Languages</span>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {profile.languages.map((lang) => (
                    <span key={lang} style={{ fontFamily: "monospace", fontSize: "13px", padding: "6px 12px", background: "rgba(10,10,10,0.08)", border: "1px solid rgba(10,10,10,0.15)", borderRadius: "4px" }}>
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Edit Mode - Form Fields */}
          {isEditing && (
            <div>
              {/* Role & Region */}
              <div className="grid grid-cols-2 gap-5" style={{ marginBottom: "24px" }}>
                <div>
                  <label style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</label>
                  <select
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    style={{ marginTop: "8px", width: "100%", border: "var(--border)", background: "var(--bg)", padding: "10px 12px", fontFamily: "monospace", fontSize: "14px", borderRadius: "4px" }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Region</label>
                  <select
                    value={profile.region}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    style={{ marginTop: "8px", width: "100%", border: "var(--border)", background: "var(--bg)", padding: "10px 12px", fontFamily: "monospace", fontSize: "14px", borderRadius: "4px" }}
                  >
                    {REGIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </div>
              </div>

              {/* Tag Input Component for Edit Mode */}
              <div style={{ marginBottom: "24px" }}>
                <TagInput
                  label="Tech Stack"
                  values={profile.techStack}
                  onAdd={(v) => addTag("techStack", v)}
                  onRemove={(v) => removeTag("techStack", v)}
                  suggestions={STACK_SUGGESTIONS}
                  placeholder="typescript, react, postgres…"
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <TagInput
                  label="Interested In"
                  values={profile.interestedIn}
                  onAdd={(v) => addTag("interestedIn", v)}
                  onRemove={(v) => removeTag("interestedIn", v)}
                  suggestions={INTEREST_SUGGESTIONS}
                  placeholder="pair-programming, system-design…"
                />
              </div>
              <TagInput
                label="Languages"
                values={profile.languages}
                onAdd={(v) => addTag("languages", v)}
                onRemove={(v) => removeTag("languages", v)}
                suggestions={LANG_SUGGESTIONS}
                placeholder="en, hi…"
              />
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="flex gap-3" style={{ borderTop: "2px solid var(--ink)", paddingLeft: "40px", paddingRight: "40px", paddingTop: "20px", paddingBottom: "20px" }}>
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "var(--ink)",
                  padding: "12px 20px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "2px solid var(--ink)",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(10,10,10,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                [ EDIT PROFILE ]
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "var(--ink)",
                  padding: "12px 20px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "2px solid var(--ink)",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(10,10,10,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: "var(--accent-blue)",
                  color: "var(--bg)",
                  padding: "12px 20px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "2px solid var(--ink)",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                SAVE
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Tag Input Component for Edit Mode
function TagInput({ label, values, onAdd, onRemove, suggestions, placeholder }: {
  label: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) onAdd(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && values.length) {
      onRemove(values[values.length - 1]);
    }
  };

  const availableSuggestions = suggestions.filter((s) => !values.includes(s)).slice(0, 8);

  return (
    <div>
      <label style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          border: "var(--border)",
          background: "var(--bg)",
          padding: "10px 12px",
          borderRadius: "6px",
          minHeight: "44px",
        }}
      >
        {values.map((value) => (
          <span
            key={value}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "4px 10px",
              fontFamily: "monospace",
              fontSize: "13px",
              borderRadius: "4px",
            }}
          >
            {value}
            <button
              type="button"
              onClick={() => onRemove(value)}
              style={{ background: "none", border: "none", color: "var(--bg)", cursor: "pointer", fontSize: "16px", padding: 0, lineHeight: "1" }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={values.length ? "" : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (draft) { onAdd(draft); setDraft(""); } }}
          style={{
            flex: 1,
            minWidth: "8ch",
            background: "transparent",
            outline: "none",
            fontFamily: "monospace",
            fontSize: "14px",
            border: "none",
          }}
        />
      </div>
      {availableSuggestions.length > 0 && values.length < 20 && (
        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onAdd(suggestion)}
              style={{
                border: "1px solid rgba(10,10,10,0.2)",
                background: "transparent",
                color: "#666",
                padding: "4px 10px",
                fontFamily: "monospace",
                fontSize: "11px",
                cursor: "pointer",
                borderRadius: "4px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(10,10,10,0.05)"; e.currentTarget.style.borderColor = "rgba(10,10,10,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(10,10,10,0.2)"; }}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
