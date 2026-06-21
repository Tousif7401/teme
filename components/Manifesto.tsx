"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ManifestoProps {
  className?: string;
}

const Manifesto = React.forwardRef<HTMLElement, ManifestoProps>(({ className }, ref) => {
  return (
    <section
      ref={ref}
      className={cn(
        "bg-ink text-bg py-20 px-6 text-center border-b-2 border-ink",
        className
      )}
    >
      <h2 className="font-display text-heading-lg text-accent-yellow mb-6">
        NETWORKING IS BROKEN.<br />LINKEDIN IS CRINGE.
      </h2>
      <p className="text-body max-w-[800px] mx-auto font-medium">
        We built TEME because tech meetups are awkward and Discord servers are too noisy. You just need a place to drop in, pair program with a stranger, and log out. No performative posting, no follow counts.
      </p>
    </section>
  );
});

Manifesto.displayName = "Manifesto";

export { Manifesto };
