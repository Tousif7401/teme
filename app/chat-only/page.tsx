"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatOnlyView } from "@/components";
import { backend } from "@/services/api";

export default function ChatOnlyPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!backend.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    backend.hasProfile().then((has) => (has ? setAuthed(true) : router.replace("/preferences")));
  }, [router]);

  const handleEndSession = () => {
    console.log("End session clicked");
    // Navigate back to landing or queue
  };

  const handleRequestVideo = () => {
    console.log("Request video clicked");
    // Upgrade to video session
  };

  if (!authed) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--ink)" }}>
        <span style={{ fontFamily: "monospace", fontSize: "13px" }}>Checking session…</span>
      </div>
    );
  }

  return (
    <ChatOnlyView
      onEndSession={handleEndSession}
      onRequestVideo={handleRequestVideo}
    />
  );
}
