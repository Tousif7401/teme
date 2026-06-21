"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(({ className }, ref) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={ref}
      className={cn("py-16 px-6 flex flex-col gap-12", className)}
    >
      {/* CTA */}
      <div className="text-center border-b-2 border-ink pb-16">
        <h2 className="font-display text-display lg:text-[5rem] mb-8">READY TO EXECUTE?</h2>
        <button
          onClick={scrollToTop}
          className="inline-flex px-6 py-4 font-mono text-base font-semibold uppercase text-ink bg-accent-green border-2 border-ink shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-hover transition-all"
        >
          [ INITIATE CONNECTION ]
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-caption font-semibold uppercase">
        <div>TEME CORE // VER 1.0</div>
        <div>DESIGNED BY BUILDERS</div>
        <div>© 2026 LOGOUT</div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export { Footer };
