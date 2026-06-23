"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoChatView } from "@/components";
import { useVideoChat } from "@/lib/useVideoChat";
import { useCredits, REWARDS } from "@/lib/useCredits";
import { backend } from "@/services/api";

// Report Categories for Video Chat
const REPORT_CATEGORIES = [
  { id: "inappropriate_content", label: "Inappropriate Video Content", severity: "HIGH" as const },
  { id: "verbal_abuse", label: "Verbal Abuse / Threats", severity: "HIGH" as const },
  { id: "hate_speech", label: "Hate Speech / Slurs", severity: "HIGH" as const },
  { id: "recording", label: "Recording Without Consent", severity: "MEDIUM" as const },
  { id: "harassment", label: "Harassment / Uncomfortable Behavior", severity: "MEDIUM" as const },
  { id: "minor", label: "Minor Detected", severity: "EMERGENCY" as const },
  { id: "other", label: "Other Issue", severity: "LOW" as const },
];

export default function VideoChatPage() {
  const vc = useVideoChat();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rewards: earn credits for matching and talk time.
  const credits = useCredits();
  const earn = credits.earn; // stable (useCallback)
  const prevStatus = useRef(vc.status);

  // Logged-in users only, and only once preferences are set.
  useEffect(() => {
    if (!backend.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    backend.hasProfile().then((has) => (has ? setAuthed(true) : router.replace("/preferences")));
  }, [router]);

  // +credits the moment a call connects.
  useEffect(() => {
    if (vc.status === "connected" && prevStatus.current !== "connected") {
      earn(REWARDS.MATCH, "New match", "match");
    }
    prevStatus.current = vc.status;
  }, [vc.status, earn]);

  // +credits per minute while connected.
  useEffect(() => {
    if (vc.status !== "connected") return;
    const t = setInterval(() => earn(REWARDS.MINUTE, "Talk time", "minute"), 60_000);
    return () => clearInterval(t);
  }, [vc.status, earn]);

  // ESC = skip to next peer (matches the "SKIP (ESC)" control).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && vc.status === "connected") vc.skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleReportSubmit = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);

    try {
      // TODO: Send report to backend
      // await backend.reportPeer({
      //   sessionId: vc.sessionId,
      //   partnerName: vc.partnerName,
      //   category: selectedCategory,
      //   timestamp: new Date().toISOString(),
      // });

      console.log("Report submitted:", {
        sessionId: vc.sessionId,
        partnerName: vc.partnerName,
        category: selectedCategory,
      });

      // Skip the peer after reporting
      vc.skip();

      setShowReportModal(false);
      setShowReportConfirm(true);
      setSelectedCategory(null);

      // Hide confirmation after 3 seconds
      setTimeout(() => setShowReportConfirm(false), 3000);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReport = () => {
    setShowReportModal(false);
    setSelectedCategory(null);
  };

  const onReport = async () => {
    setShowReportModal(true);
  };

  if (!authed) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--ink)" }}>
        <span style={{ fontFamily: "monospace", fontSize: "13px" }}>Checking session…</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <VideoChatView
        status={vc.status}
        sessionId={vc.sessionId}
        partnerName={vc.partnerName}
        localStream={vc.localStream}
        remoteStream={vc.remoteStream}
        messages={vc.messages}
        micMuted={vc.micMuted}
        cameraOff={vc.cameraOff}
        onStart={vc.start}
        onStop={vc.stop}
        onSkip={vc.skip}
        onToggleMic={vc.toggleMic}
        onToggleCamera={vc.toggleCamera}
        onSend={vc.sendMessage}
        onUpdateMessage={vc.updateMessage}
        onReport={onReport}
      />

      {/* Credits pill (links to the rewards page) */}
      <a
        href="/rewards"
        title="Your TEME credits"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--ink)",
          color: "var(--accent-yellow)",
          border: "var(--border)",
          boxShadow: "var(--shadow-brutal-hover)",
          padding: "8px 12px",
          fontFamily: "monospace",
          fontWeight: 800,
          fontSize: 13,
          textDecoration: "none",
        }}
      >
        💎 {credits.balance.toLocaleString()} cr
      </a>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
          onClick={handleCancelReport}
        >
          <div
            className="w-full max-w-md"
            style={{ background: "var(--bg)", border: "var(--border)", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ marginBottom: "20px", borderBottom: "var(--border)", paddingBottom: "16px" }}>
              <h3 style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                REPORT PEER
              </h3>
              <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#888", margin: "4px 0 0" }}>
                Select a reason for reporting {vc.partnerName || "this peer"}
              </p>
            </div>

            {/* Report Categories */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {REPORT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
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
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: category.severity === "EMERGENCY" ? "var(--accent-red)" :
                               category.severity === "HIGH" ? "#FF0000" :
                               category.severity === "MEDIUM" ? "#FFA500" : "#888",
                  }} />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleCancelReport}
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
                onClick={handleReportSubmit}
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
                {isSubmitting ? "SUBMITTING..." : "REPORT & SKIP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Confirmation Toast */}
      {showReportConfirm && (
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
          ✓ Peer reported & skipped
          <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
        </div>
      )}

      {/* "+N credits" flash */}
      {credits.flash && <FlashToast key={credits.flash.id} amount={credits.flash.amount} reason={credits.flash.reason} onDone={credits.clearFlash} />}
    </div>
  );
}

function FlashToast({ amount, reason, onDone }: { amount: number; reason: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 60,
        right: 16,
        zIndex: 50,
        background: "var(--accent-green)",
        color: "var(--ink)",
        border: "var(--border)",
        boxShadow: "var(--shadow-brutal-hover)",
        padding: "8px 12px",
        fontFamily: "monospace",
        fontWeight: 800,
        fontSize: 13,
        animation: "creditpop 0.25s ease-out",
      }}
    >
      +{amount} credits · {reason}
      <style>{`@keyframes creditpop { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );
}
