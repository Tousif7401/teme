"use client";

import { useCredits, MILESTONES, REWARDS } from "@/lib/useCredits";

export default function RewardsPage() {
  const c = useCredits();
  const pct = Math.round(c.progress * 100);

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="blinking-dot" style={{ width: 12, height: 12, borderWidth: 2 }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.05em" }}>TEME</span>
          </div>
          <a href="/video-chat" className="btn" style={{ background: "var(--bg)", color: "var(--ink)", border: "var(--border)", padding: "8px 14px", fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
            ← Back to chat
          </a>
        </div>

        {/* Balance card */}
        <div style={{ background: "var(--ink)", color: "var(--bg)", border: "var(--border)", boxShadow: "var(--shadow-brutal)", padding: 28, marginBottom: 20 }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your TEME Credits</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 800, lineHeight: 1, color: "var(--accent-yellow)", marginTop: 4 }}>
            💎 {c.balance.toLocaleString()}
          </div>
          <div className="flex gap-4 mt-4" style={{ fontFamily: "monospace", fontSize: 13 }}>
            <span>🔥 {c.streak}-day streak</span>
            <span>🤝 {c.matches} matches</span>
            <span>⏱️ {c.minutes} min talked</span>
          </div>
        </div>

        {/* Progress to next milestone */}
        {c.next ? (
          <div style={{ background: "var(--bg)", border: "var(--border)", boxShadow: "var(--shadow-brutal)", padding: 20, marginBottom: 20 }}>
            <div className="flex justify-between" style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
              <span>Next: {c.next.label}</span>
              <span>{c.balance} / {c.next.at}</span>
            </div>
            <div style={{ marginTop: 8, height: 14, background: "rgba(10,10,10,0.08)", border: "var(--border)" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent-green)", transition: "width .3s" }} />
            </div>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#666", marginTop: 8 }}>
              Unlock <b>{c.next.perk}</b> — {c.next.at - c.balance} credits to go.
            </p>
          </div>
        ) : (
          <div style={{ background: "var(--accent-green)", border: "var(--border)", boxShadow: "var(--shadow-brutal)", padding: 20, marginBottom: 20, fontFamily: "monospace", fontWeight: 800 }}>
            🏆 You’ve unlocked everything. Legend.
          </div>
        )}

        {/* How to earn */}
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Earn more credits</h2>
        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr", marginBottom: 24 }}>
          {[
            [`+${REWARDS.MATCH}`, "Every match", "Connect with a new developer"],
            [`+${REWARDS.MINUTE}/min`, "Talk time", "While you’re in a live call"],
            [`+${REWARDS.DAILY}`, "Daily check-in", "Just open TEME each day (keep your streak!)"],
          ].map(([amt, title, desc]) => (
            <div key={title} className="flex items-center gap-3" style={{ background: "var(--bg)", border: "var(--border)", padding: "12px 14px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--accent-green)", minWidth: 70 }}>{amt}</span>
              <span>
                <b style={{ fontFamily: "monospace" }}>{title}</b>
                <span style={{ display: "block", fontSize: 12, color: "#666" }}>{desc}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Rewards</h2>
        <div className="grid gap-2" style={{ marginBottom: 28 }}>
          {MILESTONES.map((m) => {
            const got = c.balance >= m.at;
            return (
              <div key={m.at} className="flex items-center justify-between" style={{ background: got ? "var(--accent-yellow)" : "var(--bg)", border: "var(--border)", padding: "12px 14px", opacity: got ? 1 : 0.85 }}>
                <span>
                  <b style={{ fontFamily: "monospace" }}>{got ? "✅ " : "🔒 "}{m.label}</b>
                  <span style={{ display: "block", fontSize: 12, color: "#555" }}>{m.perk}</span>
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>{m.at}💎</span>
              </div>
            );
          })}
        </div>

        <a href="/video-chat" className="btn" style={{ display: "block", textAlign: "center", background: "var(--ink)", color: "var(--bg)", padding: 16, fontFamily: "monospace", fontWeight: 800, fontSize: 15 }}>
          Start matching & earn →
        </a>
      </div>
    </div>
  );
}
