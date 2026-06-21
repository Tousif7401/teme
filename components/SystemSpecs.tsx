"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SystemSpecsProps {
  className?: string;
}

const SystemSpecs = React.forwardRef<HTMLElement, SystemSpecsProps>(({ className }, ref) => {
  return (
    <section
      ref={ref}
      className={cn("grid grid-cols-1 lg:grid-cols-[300px_1fr] border-b-2 border-ink", className)}
    >
      {/* Sidebar */}
      <div className="border-r-0 border-b-2 border-ink lg:border-b-0 lg:border-r-2 bg-accent-yellow text-ink px-6 py-8 lg:px-6 lg:py-8">
        <h2 className="font-display text-[48px] leading-none">
          SYS.<br />SPECS
        </h2>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="border-r-0 border-b-2 border-ink lg:border-b-0 lg:border-r-2 px-6 py-8 lg:px-6 lg:py-8">
          <span className="text-caption px-2 py-1 border border-ink font-semibold inline-block mb-4">
            ENV.01
          </span>
          <h3 className="font-display text-[24px] mb-3">Context Switching</h3>
          <p className="text-body text-ink">
            Start in text mode. If the vibe is right, upgrade to video instantly. Downgrade back to text if you need to focus. Total environmental control.
          </p>
        </div>
        <div className="border-r-0 border-b-2 border-ink lg:border-b-0 lg:border-r-2 px-6 py-8 lg:px-6 lg:py-8">
          <span className="text-caption px-2 py-1 border border-ink font-semibold inline-block mb-4">
            ENV.02
          </span>
          <h3 className="font-display text-[24px] mb-3">Stack Filtering</h3>
          <p className="text-body text-ink">
            Looking for a Python dev? Set <code className="bg-bg px-1 border border-ink">require(&apos;python&apos;)</code>. Don&apos;t waste time explaining frameworks to the wrong crowd.
          </p>
        </div>
        <div className="px-6 py-8 lg:px-6 lg:py-8">
          <span className="text-caption px-2 py-1 border border-ink font-semibold inline-block mb-4">
            ENV.03
          </span>
          <h3 className="font-display text-[24px] mb-3">Zero Clutter</h3>
          <p className="text-body text-ink">
            No profiles to curate. Authenticate to prove you aren&apos;t a bot, then drop straight into the peer pool.
          </p>
        </div>
      </div>
    </section>
  );
});

SystemSpecs.displayName = "SystemSpecs";

export { SystemSpecs };
