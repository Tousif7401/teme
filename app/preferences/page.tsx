"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { backend, type Profile } from "@/services/api";

const REGIONS = [
  ["in", "India"], ["eu", "Europe"], ["na", "North America"], ["sa", "South America"],
  ["me", "Middle East"], ["af", "Africa"], ["as", "Asia (other)"], ["oc", "Oceania"],
];
const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile", "design", "student", "other"];

// Dev-focused quick-pick suggestions.
const STACK_SUGGESTIONS = ["typescript", "javascript", "python", "react", "next.js", "node", "go", "rust", "java", "c++", "postgres", "mongodb", "docker", "kubernetes", "aws", "graphql"];
const INTEREST_SUGGESTIONS = ["pair-programming", "code-review", "system-design", "open-source", "hackathons", "startups", "mentoring", "debugging", "ai/ml", "web3", "freelance", "casual"];
const LANG_SUGGESTIONS = ["en", "hi", "es", "fr", "de", "pt", "zh", "ja", "ar"];

function TagField({ label, value, onChange, placeholder, suggestions = [] }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder: string; suggestions?: string[] }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const t = raw.trim().toLowerCase();
    if (t && !value.includes(t) && value.length < 20) onChange([...value, t]);
    setDraft("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
    else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
  };
  const open = suggestions.filter((s) => !value.includes(s)).slice(0, 10);
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", border: "var(--border)", background: "var(--bg)", padding: "8px 10px" }}>
        {value.map((t) => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--ink)", color: "var(--bg)", padding: "2px 8px", fontFamily: "monospace", fontSize: 12 }}>
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} style={{ color: "var(--bg)" }}>×</button>
          </span>
        ))}
        <input value={draft} placeholder={value.length ? "" : placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey} onBlur={() => add(draft)}
          style={{ flex: 1, minWidth: "8ch", background: "transparent", outline: "none", fontFamily: "monospace", fontSize: 14 }} />
      </div>
      {open.length > 0 && value.length < 20 && (
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {open.map((s) => (
            <button key={s} type="button" onClick={() => add(s)}
              style={{ border: "1px solid rgba(10,10,10,0.25)", background: "transparent", color: "#555", padding: "2px 8px", fontFamily: "monospace", fontSize: 11, cursor: "pointer" }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

export default function PreferencesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [p, setP] = useState<Profile>({ displayName: "", techStack: [], role: "fullstack", interestedIn: [], region: "in", languages: ["en"] });

  useEffect(() => {
    if (!backend.isLoggedIn()) { router.replace("/login"); return; }
    backend.getProfile().then((existing) => setP(existing)).catch(() => undefined).finally(() => setReady(true));
  }, [router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (p.displayName.trim().length < 2) { setError("Display name must be at least 2 characters."); return; }
    setBusy(true);
    try {
      await backend.saveProfile({ ...p, displayName: p.displayName.trim() });
      router.replace("/video-chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><span style={{ fontFamily: "monospace", fontSize: 13 }}>Loading…</span></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <div style={{ width: "100%", maxWidth: 520, margin: "0 16px", background: "var(--bg)", border: "var(--border)", boxShadow: "var(--shadow-brutal)", padding: 32 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          <div className="blinking-dot" style={{ width: 12, height: 12, borderWidth: 2 }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.05em" }}>TEME</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Your preferences</h1>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>This is how we match you with the right people.</p>

        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <label style={{ display: "block" }}>
            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Display name</span>
            <input value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} maxLength={40} placeholder="How others see you"
              style={{ marginTop: 6, width: "100%", border: "var(--border)", background: "var(--bg)", padding: "10px 12px", fontFamily: "monospace", fontSize: 14, outline: "none" }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={{ display: "block" }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Role</span>
              <select value={p.role} onChange={(e) => setP({ ...p, role: e.target.value })}
                style={{ marginTop: 6, width: "100%", border: "var(--border)", background: "var(--bg)", padding: "10px 12px", fontFamily: "monospace", fontSize: 14 }}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label style={{ display: "block" }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Region</span>
              <select value={p.region} onChange={(e) => setP({ ...p, region: e.target.value })}
                style={{ marginTop: 6, width: "100%", border: "var(--border)", background: "var(--bg)", padding: "10px 12px", fontFamily: "monospace", fontSize: 14 }}>
                {REGIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </label>
          </div>

          <TagField label="Tech stack" value={p.techStack} onChange={(v) => setP({ ...p, techStack: v })} placeholder="typescript, react, postgres…" suggestions={STACK_SUGGESTIONS} />
          <TagField label="Interested in" value={p.interestedIn} onChange={(v) => setP({ ...p, interestedIn: v })} placeholder="pair-programming, system-design…" suggestions={INTEREST_SUGGESTIONS} />
          <TagField label="Languages" value={p.languages} onChange={(v) => setP({ ...p, languages: v })} placeholder="en, hi…" suggestions={LANG_SUGGESTIONS} />

          {error && <p style={{ color: "var(--accent-red)", fontSize: 13, fontFamily: "monospace" }}>{error}</p>}

          <button type="submit" disabled={busy} className="btn" style={{ background: "var(--ink)", color: "var(--bg)", padding: 14, fontFamily: "monospace", fontSize: 15, fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Saving…" : "Save & start matching →"}
          </button>
        </form>
      </div>
    </div>
  );
}
