"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoChatView } from "@/components";
import { useVideoChat } from "@/lib/useVideoChat";
import { useCredits, REWARDS } from "@/lib/useCredits";
import { backend } from "@/services/api";

export default function VideoChatPage() {
  const vc = useVideoChat();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

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
  }, [vc]);

  const onReport = async () => {
    vc.skip();
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
