"use client";

import { useRouter } from "next/navigation";
import { backend } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  const loginWithGoogle = () => {
    // Full-page redirect to the backend, which bounces to Google and back.
    window.location.href = backend.googleLoginUrl();
  };

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          margin: "0 16px",
          background: "var(--bg)",
          border: "var(--border)",
          boxShadow: "var(--shadow-brutal)",
          padding: "40px",
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="blinking-dot" style={{ width: "12px", height: "12px", borderWidth: "2px" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.05em" }}>TEME</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
          Enter the network
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>
          Sign in to match with other developers over text, audio &amp; video.
        </p>

        <button
          onClick={loginWithGoogle}
          className="btn"
          style={{
            width: "100%",
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "14px",
            fontFamily: "monospace",
            fontSize: "15px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div style={{ flex: 1, height: "2px", background: "var(--ink)", opacity: 0.15 }} />
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888" }}>OR</span>
          <div style={{ flex: 1, height: "2px", background: "var(--ink)", opacity: 0.15 }} />
        </div>

        <button
          onClick={() => router.push("/video-chat")}
          className="btn"
          style={{ width: "100%", background: "var(--bg)", color: "var(--ink)", border: "var(--border)", padding: "12px", fontFamily: "monospace", fontSize: "14px", fontWeight: 700 }}
        >
          Continue as guest →
        </button>

        <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", marginTop: "20px", textAlign: "center" }}>
          18+ only · By continuing you agree to the Terms
        </p>
      </div>
    </div>
  );
}
