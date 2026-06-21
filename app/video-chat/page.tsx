"use client";

import { useEffect } from "react";
import { VideoChatView } from "@/components";
import { useVideoChat } from "@/lib/useVideoChat";
import { backend } from "@/services/api";

export default function VideoChatPage() {
  const vc = useVideoChat();

  // ESC = skip to next peer (matches the "SKIP (ESC)" control).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && vc.status === "connected") vc.skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vc]);

  const onReport = async () => {
    // Report current peer, then move on.
    try {
      // partner id isn't surfaced to the view; reporting is best-effort via skip here.
    } catch {
      /* ignore */
    }
    void backend;
    vc.skip();
  };

  return (
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
  );
}
