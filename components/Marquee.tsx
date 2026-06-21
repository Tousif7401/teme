"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  className?: string;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(({ className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden whitespace-nowrap bg-accent-red text-ink font-semibold border-b-2 border-ink py-2",
        className
      )}
    >
      <div className="flex gap-8 animate-scroll">
        <span>/// P2P DEV ROULETTE /// WEBRTC INITIATED /// ZERO BOTS /// STRICT OAUTH ///</span>
        <span>/// P2P DEV ROULETTE /// WEBRTC INITIATED /// ZERO BOTS /// STRICT OAUTH ///</span>
        <span>/// P2P DEV ROULETTE /// WEBRTC INITIATED /// ZERO BOTS /// STRICT OAUTH ///</span>
        <span>/// P2P DEV ROULETTE /// WEBRTC INITIATED /// ZERO BOTS /// STRICT OAUTH ///</span>
      </div>
    </div>
  );
});

Marquee.displayName = "Marquee";

export { Marquee };
