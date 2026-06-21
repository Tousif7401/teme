"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  className?: string;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(({ className }, ref) => {
  const [onlineCount, setOnlineCount] = useState(1042);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor(Math.random() * 5) - 2;
      setOnlineCount((prev) => Math.max(900, Math.min(1200, prev + diff)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between border-brutal border-b-2 border-ink bg-bg px-6 py-4",
        className
      )}
    >
      {/* Brand Mark */}
      <a href="/" className="font-display text-[32px] font-extrabold tracking-tighter">
        TEME
      </a>

      {/* Network Pulse Ticker */}
      <div className="flex items-center gap-3 text-mono text-[14px] font-semibold">
        <div className="relative h-3 w-3">
          <span className="absolute inset-0 rounded-full bg-accent-green border-2 border-ink animate-blink" />
        </div>
        <span>{onlineCount.toLocaleString()} SYS.ONLINE</span>
      </div>

      {/* Repository Link */}
      <a
        href="https://github.com/teme/teme"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub Repository"
        className="text-ink hover:opacity-60 transition-opacity"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      </a>
    </header>
  );
});

Header.displayName = "Header";

export { Header };
