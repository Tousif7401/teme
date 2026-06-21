"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "./Card";
import { cn } from "@/lib/utils";

export interface PipelineSectionProps {
  className?: string;
}

const steps = [
  {
    number: "01",
    title: "Cryptographic Identity Verification",
    description: "Sign in with GitHub or Google OAuth. We verify your identity at the source — no email/password combos, no fake accounts.",
    icon: "🔐",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    number: "02",
    title: "Stack & Intent Targeting",
    description: "Select your languages (React, Rust, Python, etc.) and collaboration vibe. We match you with compatible peers in seconds.",
    icon: "⚡",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    number: "03",
    title: "P2P Tunnel Initiation",
    description: "Once matched, WebRTC establishes a direct browser-to-browser connection. Your data never touches our servers — it's peer-to-peer encrypted.",
    icon: "🔗",
    gradient: "from-orange-500/10 to-red-500/10",
  },
];

const PipelineSection = React.forwardRef<HTMLElement, PipelineSectionProps>(
  ({ className }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "px-4 sm:px-6 lg:px-8 py-16 sm:py-24",
          className
        )}
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-sand border border-ash-border mb-4 animate-fade-up">
              <span className="text-caption text-driftwood font-geist tracking-wide uppercase">
                How It Works
              </span>
            </div>
            <h2 className="font-waldenburg font-light text-heading-lg text-midnight-ink mb-4 tracking-tight animate-fade-up animate-delay-100">
              Three steps to verified<br />peer-to-peer collaboration
            </h2>
            <p className="text-body text-driftwood max-w-xl mx-auto animate-fade-up animate-delay-200">
              No intermediaries, no server bottlenecks. Just direct connections between verified developers.
            </p>
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "group relative animate-fade-up",
                  `animate-delay-${(index + 1) * 100}`
                )}
              >
                {/* Hover glow effect */}
                <div className={cn(
                  "absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-lg",
                  index === 0 && "from-void-violet to-cyan-500",
                  index === 1 && "from-purple-500 to-pink-500",
                  index === 2 && "from-ember-orange to-red-500"
                )} />

                {/* Card */}
                <Card
                  variant="warm"
                  padding="lg"
                  className="relative h-full transition-all duration-300 group-hover:scale-[1.02]"
                >
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    `bg-gradient-to-br ${step.gradient}`
                  )} />

                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-subheading font-geist text-driftwood font-medium">
                          {step.number}
                        </span>
                        <span className="text-3xl transition-transform group-hover:scale-110" aria-hidden="true">
                          {step.icon}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-subheading font-medium mb-3">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-[14px] leading-relaxed text-driftwood">
                      {step.description}
                    </CardDescription>
                  </CardHeader>

                  {/* Corner accent */}
                  <div className={cn(
                    "absolute top-0 right-0 w-20 h-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                    "bg-gradient-to-bl from-midnight-ink/5 to-transparent"
                  )} />
                </Card>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center animate-fade-up animate-delay-400">
            <p className="text-caption text-fog font-geist mb-4">
              END-TO-END ENCRYPTED • ZERO-KNOWLEDGE • OPEN SOURCE
            </p>
          </div>
        </div>
      </section>
    );
  }
);

PipelineSection.displayName = "PipelineSection";

export { PipelineSection };
