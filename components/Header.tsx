"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function Header() {
  const { landingMode, setLandingMode } = useAppStore();
  const [onlineCount, setOnlineCount] = useState(1042);

  // Simulate online counter fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(900, Math.min(1200, prev + diff));
      });
    }, 3000);

    return () => clearInterval(interval);
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
        <span id="online-count">{onlineCount.toLocaleString()} ONLINE</span>
      </div>
    </header>
  );
}
