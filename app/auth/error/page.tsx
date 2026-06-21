"use client";

import { useRouter } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800 }}>Sign-in failed</h1>
      <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#666" }}>Google sign-in didn’t complete.</p>
      <button
        onClick={() => router.replace("/login")}
        className="btn"
        style={{ background: "var(--ink)", color: "var(--bg)", padding: "10px 20px", fontFamily: "monospace", fontWeight: 700 }}
      >
        Try again
      </button>
    </div>
  );
}
