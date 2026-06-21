"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { backend } from "@/services/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    // Tokens arrive in the URL fragment (#accessToken=...&refreshToken=...).
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access = params.get("accessToken");
    const refresh = params.get("refreshToken");

    if (!access || !refresh) {
      setMsg("Sign-in failed. Redirecting…");
      setTimeout(() => router.replace("/login"), 1500);
      return;
    }

    backend.setLoginTokens(access, refresh);
    // Strip the tokens from the URL so they don't linger in history.
    window.history.replaceState(null, "", window.location.pathname);

    backend
      .ensureReady()
      .then(() => router.replace("/video-chat"))
      .catch(() => {
        setMsg("Could not finish setup. Redirecting…");
        setTimeout(() => router.replace("/video-chat"), 1500);
      });
  }, [router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <span
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "3px solid var(--ink)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{msg}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
