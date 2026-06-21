"use client";

import React, { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export interface InterfaceTeaserProps {
  className?: string;
}

const InterfaceTeaser = React.forwardRef<HTMLElement, InterfaceTeaserProps>(
  ({ className }, ref) => {
    const { setCurrentView } = useAppStore();
    const [activeTab, setActiveTab] = useState<"chat" | "code">("chat");

    const handleGetStarted = () => {
      setCurrentView("launchpad");
    };

    return (
      <section
        ref={ref}
        className={cn(
          "px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-warm-sand/30",
          className
        )}
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-ink text-parchment-white mb-4 animate-fade-up">
              <span className="text-caption font-geist tracking-wide uppercase">
                Live Preview
              </span>
            </div>
            <h2 className="font-waldenburg font-light text-heading-lg text-midnight-ink mb-4 tracking-tight animate-fade-up animate-delay-100">
              See TEME in Action
            </h2>
            <p className="text-body text-driftwood max-w-xl mx-auto animate-fade-up animate-delay-200">
              A clean, focused workspace for real-time collaboration. Video, voice, and code — side by side.
            </p>
          </div>

          {/* Interface Preview */}
          <div className="relative animate-scale-in animate-delay-300">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-void-violet/20 via-ember-orange/20 to-void-violet/20 rounded-3xl blur-3xl" />

            <Card variant="elevated" padding="none" className="relative overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-gradient-to-b from-gray-100 to-white px-4 py-3 border-b border-ash-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer" />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="max-w-md mx-auto bg-white rounded-lg px-3 py-1.5 flex items-center gap-2 border border-ash-border/50 shadow-sm">
                      <svg className="w-3 h-3 text-driftwood" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-caption text-driftwood font-geist flex-1">
                        teme.app/session/a7x9k2
                      </span>
                      <svg className="w-3 h-3 text-driftwood" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Interface */}
              <div className="bg-midnight-ink">
                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
                  {/* Video Panel */}
                  <div className="lg:col-span-1 p-4 border-b lg:border-b-0 lg:border-r border-driftwood/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-subheading font-medium text-driftwood">Video</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-caption text-fog">2 connected</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Remote Video */}
                      <div className="aspect-video bg-gradient-to-br from-driftwood/30 to-driftwood/20 rounded-lg overflow-hidden relative group cursor-pointer hover:from-driftwood/40 hover:to-driftwood/30 transition-all">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-driftwood/40 mx-auto mb-2 flex items-center justify-center ring-2 ring-driftwood/20">
                              <span className="text-2xl">👤</span>
                            </div>
                            <span className="text-caption text-driftwood">peer_dev</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-midnight-ink/70 backdrop-blur-sm rounded text-caption text-parchment-white font-geist">
                          TypeScript • React • 2y exp
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 rounded-full bg-midnight-ink/50 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-3 h-3 text-parchment-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Local Video */}
                      <div className="aspect-video bg-gradient-to-br from-driftwood/20 to-driftwood/15 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-driftwood/30 mx-auto mb-1 flex items-center justify-center">
                              <span className="text-lg">📷</span>
                            </div>
                            <span className="text-[10px] text-driftwood">You</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <button className="w-6 h-6 rounded-full bg-midnight-ink/50 backdrop-blur-sm flex items-center justify-center hover:bg-midnight-ink/70 transition-colors">
                            <svg className="w-3 h-3 text-parchment-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100-2h1v-1.07z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat/Code Panel */}
                  <div className="lg:col-span-2 flex flex-col">
                    {/* Tab switcher */}
                    <div className="flex border-b border-driftwood/20">
                      <button
                        onClick={() => setActiveTab("chat")}
                        className={cn(
                          "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
                          activeTab === "chat"
                            ? "text-parchment-white bg-driftwood/20"
                            : "text-driftwood hover:bg-driftwood/10"
                        )}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => setActiveTab("code")}
                        className={cn(
                          "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
                          activeTab === "code"
                            ? "text-parchment-white bg-driftwood/20"
                            : "text-driftwood hover:bg-driftwood/10"
                        )}
                      >
                        Code
                      </button>
                    </div>

                    {activeTab === "chat" ? (
                      /* Chat Panel */
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                          {/* Messages */}
                          <div className="flex-1 space-y-3">
                            <div className="bg-driftwood/10 rounded-lg p-3 self-start max-w-[80%]">
                              <span className="text-[10px] text-fog block mb-1">peer_dev • 2:34 PM</span>
                              <p className="text-[13px] text-driftwood">Found the bug! It was in the useEffect cleanup function.</p>
                            </div>
                            <div className="bg-midnight-ink/20 rounded-lg p-3 self-end max-w-[80%] ml-auto">
                              <span className="text-[10px] text-fog block mb-1 text-right">you • 2:35 PM</span>
                              <p className="text-[13px] text-parchment-white">Nice catch! Want to pair on the fix?</p>
                            </div>
                            <div className="bg-driftwood/10 rounded-lg p-3 self-start max-w-[80%]">
                              <span className="text-[10px] text-fog block mb-1">peer_dev • 2:35 PM</span>
                              <p className="text-[13px] text-driftwood">👍 Let me share my screen</p>
                            </div>
                          </div>

                          {/* Input */}
                          <div className="pt-3 border-t border-driftwood/20">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 bg-driftwood/10 border border-driftwood/20 rounded-lg text-[13px] text-parchment-white placeholder:text-fog focus:outline-none focus:border-driftwood/40 transition-colors"
                              />
                              <button className="px-4 py-2 bg-midnight-ink text-parchment-white rounded-lg text-[13px] font-medium hover:bg-driftwood transition-colors">
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Code Panel */
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex-1 bg-driftwood/10 rounded-lg p-4 font-geist text-[11px] overflow-auto">
                          <div className="space-y-1">
                            <div className="flex gap-2">
                              <span className="text-fog select-none">1</span>
                              <span><span className="text-void-violet">async</span> <span className="text-ember-orange">function</span> <span className="text-blue-400">fixRaceCondition</span>() {`{`}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">2</span>
                              <span className="text-driftwood">  <span className="text-void-violet">const</span> cleanupRef = useRef(<span className="text-void-violet">null</span>);</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">3</span>
                              <span className="text-driftwood">  </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">4</span>
                              <span className="text-purple-400">useEffect</span><span className="text-driftwood">(callback, deps)</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">5</span>
                              <span className="text-driftwood">    <span className="text-void-violet">return</span> cleanup</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">6</span>
                              <span className="text-driftwood">      cleanupRef.current?.();</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">7</span>
                              <span className="text-driftwood">    {'})'};</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">8</span>
                              <span className="text-driftwood">  {'}'}, [deps]);</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-fog select-none">9</span>
                              <span className="text-driftwood">{'}'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-driftwood/20">
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-fog font-geist">TypeScript • 9 lines</span>
                            <button className="text-caption text-driftwood hover:text-parchment-white transition-colors">
                              Copy code
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center animate-fade-up animate-delay-400">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              className="group"
            >
              Start Pair Programming
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      </section>
    );
  }
);

InterfaceTeaser.displayName = "InterfaceTeaser";

export { InterfaceTeaser };
