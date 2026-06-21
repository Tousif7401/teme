"use client";

import React from "react";
import {
  Header,
  Marquee,
  Hero,
  Manifesto,
  OperatingModes,
  SystemSpecs,
  FAQ,
  Footer,
} from "@/components";

export function LandingView() {
  return (
    <div className="master-frame">
      <Header />
      <Marquee />
      <Hero />
      <Manifesto />
      <OperatingModes />
      <SystemSpecs />
      <FAQ />
      <Footer />
    </div>
  );
}
