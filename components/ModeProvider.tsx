"use client";

import React, { useEffect } from "react";
import { useAppStore, type LandingMode } from "@/store/useAppStore";

export function ModeProvider() {
  const { landingMode } = useAppStore();

  useEffect(() => {
    // Set data-mode attribute on body element
    document.body.setAttribute("data-mode", landingMode);
  }, [landingMode]);

  return null;
}
