"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PulseTickerProps {
  count: number | string;
  label?: string;
  className?: string;
  variant?: "default" | "compact";
}

const PulseTicker = React.forwardRef<HTMLSpanElement, PulseTickerProps>(
  ({ count, label = "Engineers Active", className, variant = "default" }, ref) => {
    const formatCount = (value: number | string): string => {
      if (typeof value === "string") return value;
      return value.toLocaleString();
    };

    const displayCount = formatCount(count);

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2",
          variant === "compact" ? "text-caption" : "text-[14px]",
          "text-driftwood font-inter",
          className
        )}
      >
        <span
          className="relative flex h-2 w-2"
          aria-hidden="true"
        >
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-midnight-ink opacity-75"
          />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-midnight-ink" />
        </span>
        <span className="font-medium text-midnight-ink">
          {displayCount}
        </span>
        {label && (
          <span>{label}</span>
        )}
      </span>
    );
  }
);

PulseTicker.displayName = "PulseTicker";

export { PulseTicker };
