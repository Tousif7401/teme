"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  command: string;
  output: string;
}

const faqItems: FAQItem[] = [
  {
    command: 'teme query --topic "Is it just creeps like Omegle?"',
    output: "Negative. Access requires strict GitHub or Google OAuth. Age of account and repo history are checked. Bots and bad actors are instantly IP-banned.",
  },
  {
    command: 'teme query --topic "Do I have to use my camera?"',
    output: "No. As shown in the operating modes above, you can initialize the connection strictly in Terminal/Text mode. Video is entirely opt-in.",
  },
  {
    command: 'teme query --topic "Is this free?"',
    output: "Core routing is free. Servers cost money, so a 'Pro' tier for advanced stack filtering and priority routing may compile later.",
  },
];

export interface FAQProps {
  className?: string;
}

const FAQ = React.forwardRef<HTMLElement, FAQProps>(({ className }, ref) => {
  return (
    <section
      ref={ref}
      className={cn("py-20 px-6 bg-bg", className)}
    >
      <div className="max-w-[800px] mx-auto">
        <h2 className="font-display text-[48px] text-center mb-8">MANUAL / FAQ</h2>

        <div className="flex flex-col gap-6">
          {faqItems.map((item, index) => (
            <div key={index} className="border-2 border-ink bg-ink text-bg shadow-brutal">
              <div className="border-b border-[#333] px-4 py-4 text-accent-green font-semibold">
                <span className="text-accent-red">{'>'} </span>
                {item.command}
              </div>
              <div className="px-4 py-4 text-[#CCC] text-[15px]">{item.output}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FAQ.displayName = "FAQ";

export { FAQ };
