"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function Header() {
  const { landingMode, setLandingMode } = useAppStore();
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  // Real online count from the backend, polled every 5s.
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_API_BASE || "https://13.206.6.189.nip.io").replace(/\/$/, "");
    let alive = true;
    const fetchCount = async () => {
      try {
        const res = await fetch(`${base}/api/v1/presence/online`);
        const data = await res.json();
        if (alive) setOnlineCount(data.online);
      } catch {
        /* keep last known value */
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const handleModeToggle = (mode: "tech" | "nontech") => {
    setLandingMode(mode);
  };

  return (
    <header>
      {/* Logo */}
      <div className="logo">TEME</div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`toggle-btn ${landingMode === "tech" ? "active" : ""}`}
          onClick={() => handleModeToggle("tech")}
        >
          [ SYS.DEV ]
        </button>
        <button
          className={`toggle-btn ${landingMode === "nontech" ? "active" : ""}`}
          onClick={() => handleModeToggle("nontech")}
        >
          [ VISITOR ]
        </button>
      </div>

      {/* Status Indicator */}
      <div className="nav-status">
        <div className="blinking-dot"></div>
        <span id="online-count">{(onlineCount ?? 0).toLocaleString()} ONLINE</span>
      </div>
    </header>
  );
}
