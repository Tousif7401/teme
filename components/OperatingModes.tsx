"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface OperatingModesProps {
  className?: string;
}

const OperatingModes = React.forwardRef<HTMLElement, OperatingModesProps>(({ className }, ref) => {
  return (
    <section
      ref={ref}
      className={cn(
        "py-20 px-6 border-b-2 border-ink bg-dots-pattern bg-dots-dots",
        className
      )}
    >
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block bg-bg border-2 border-ink shadow-brutal px-12 py-6">
          <h2 className="font-display text-heading-xl mb-2">CHOOSE YOUR VECTOR</h2>
          <p className="font-mono font-semibold">Two strictly defined interfaces. No bloated features.</p>
        </div>
      </div>

      {/* Modes Grid */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Mode 1: Video/Audio Visual */}
        <div className="bg-bg border-2 border-ink shadow-brutal-lg flex flex-col">
          <div className="border-b-2 border-ink px-4 py-3 flex justify-between items-center font-semibold text-caption bg-accent-blue text-bg">
            <span>● ● ●</span>
            <span>[ MODE 01: AUDIO / VISUAL ]</span>
            <span>WEBRTC // ACTIVE</span>
          </div>
          <div className="flex-1 flex flex-col h-[450px]">
            <div className="flex-1 grid grid-rows-2">
              {/* Remote Feed */}
              <div className="border-b-2 border-ink flex items-center justify-center font-display text-[24px] relative bg-[repeating-linear-gradient(-45deg,#e5e5e5,#e5e5e5_10px,#f0f0ee_10px,#f0f0ee_20px)]">
                <span className="absolute top-3 left-3 bg-ink text-bg border-2 border-ink px-2 py-1 text-caption font-bold">
                  REMOTE_PEER_CAM
                </span>
                <span className="text-ink opacity-80">[ VIDEO SIGNAL ]</span>
              </div>
              {/* Local Feed */}
              <div className="flex items-center justify-center font-display text-[24px] relative bg-bg">
                <span className="absolute top-3 left-3 bg-ink text-bg border-2 border-ink px-2 py-1 text-caption font-bold">
                  LOCAL_HOST_CAM
                </span>
                <span className="opacity-20">[ CAMERA ACTIVE ]</span>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button className="bg-bg border-2 border-ink px-3 py-1.5 text-caption font-bold hover:bg-ink hover:text-bg transition-colors">
                    MUTE_MIC
                  </button>
                  <button className="bg-accent-red text-ink border-2 border-ink px-3 py-1.5 text-caption font-bold hover:bg-ink hover:text-bg transition-colors">
                    SKIP PEER (ESC)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode 2: Terminal + Chat */}
        <div className="bg-bg border-2 border-ink shadow-brutal-lg flex flex-col">
          <div className="border-b-2 border-ink px-4 py-3 flex justify-between items-center font-semibold text-caption bg-ink text-bg">
            <span>● ● ●</span>
            <span>[ MODE 02: TERMINAL + CHAT ]</span>
            <span>WSS // CONNECTED</span>
          </div>
          <div className="flex-1 flex flex-col h-[450px] bg-ink text-bg p-6 text-[13px] font-mono">
            {/* Terminal Chat */}
            <div className="flex-1 border-b border-dashed border-[#444] mb-5 pb-5 flex flex-col justify-end gap-3">
              <div className="text-[#888]">[14:02:11] SYSTEM: Peer connection established.</div>
              <div>
                <span className="text-accent-green">{'> '}peer_8x92a:</span> Anyone here good with React concurrency?
              </div>
              <div>
                <span className="text-accent-blue">{'> '}you:</span> Yeah, what&apos;s the issue?
              </div>
              <div>
                <span className="text-accent-green">{'> '}peer_8x92a:</span> Check the scratchpad below.
              </div>
            </div>

            {/* Terminal Scratchpad */}
            <div className="bg-[#111] p-4 border border-[#333] mb-4">
              <div className="text-[#888] mb-2">// SHARED SCRATCHPAD (LIVE SYNC)</div>
              <div className="font-mono leading-relaxed">
                <span className="text-[#F43F5E]">function</span> <span className="text-[#38BDF8]">useFetch</span>() {`{`}
                <br />
                &nbsp;&nbsp;<span className="text-[#F43F5E]">const</span> [data, setData] = useState(<span className="text-[#38BDF8]">null</span>);
                <br />
                &nbsp;&nbsp;<span className="text-[#888]">// infinite loop happening here?</span>
                <br />
                &nbsp;&nbsp;useEffect(() {'=> '}fetch(url), [url, data]);
                <br />
                {`}`}
              </div>
            </div>

            {/* Terminal Input */}
            <div className="flex gap-2 font-bold">
              <span className="text-accent-green animate-blink">_</span>
              <span className="opacity-50">type message...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

OperatingModes.displayName = "OperatingModes";

export { OperatingModes };
