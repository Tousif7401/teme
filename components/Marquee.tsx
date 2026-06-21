"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";

export function Marquee() {
  const { landingMode } = useAppStore();

  const marqueeTech =
    "/// P2P DEV ROULETTE /// WEBRTC INITIATED /// ZERO BOTS /// STRICT OAUTH ///";
  const marqueeNontech =
    "/// FIND A CO-FOUNDER /// PITCH YOUR IDEA /// ZERO CODING REQUIRED /// JUST VIBES ///";

  const content =
    landingMode === "tech"
      ? `${marqueeTech}${marqueeTech}${marqueeTech}${marqueeTech}`
      : `${marqueeNontech}${marqueeNontech}${marqueeNontech}${marqueeNontech}`;

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        <span className="tech-only">{content}</span>
        <span className="nontech-only">{content}</span>
      </div>
    </div>
  );
}
