"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

interface TerminalLine {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "error";
}

const TERMINAL_MESSAGES = [
  { text: "> Initializing TEME client...", type: "info" as const },
  { text: "> Loading service modules...", type: "info" as const },
  { text: "> Service layer: OK", type: "success" as const },
  { text: "> WebSocket handshake: OK", type: "success" as const },
  { text: "> Establishing secure tunnel...", type: "info" as const },
  { text: "> Authentication verified", type: "success" as const },
  { text: "> Joining matchmaking queue...", type: "info" as const },
  { text: "> Waiting for peer match...", type: "warning" as const },
];

export function QueueView() {
  const { languages, vibe, setCurrentView } = useAppStore();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [status, setStatus] = useState<"connecting" | "waiting" | "found" | "failed">("connecting");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Simulate terminal messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLineIndex < TERMINAL_MESSAGES.length) {
        setLines(prev => [
          ...prev,
          { id: Date.now(), ...TERMINAL_MESSAGES[currentLineIndex] }
        ]);
        setCurrentLineIndex(prev => prev + 1);

        // Update status based on messages
        if (currentLineIndex === 5) {
          setStatus("waiting");
        }
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [currentLineIndex]);

  // Simulate queue updates
  useEffect(() => {
    if (status !== "waiting") return;

    const queueInterval = setInterval(() => {
      setQueuePosition(prev => {
        if (prev === null) return 42;
        if (prev <= 1) {
          setStatus("found");
          return 1;
        }
        return prev - Math.floor(Math.random() * 3) - 1;
      });
    }, 2000);

    // Set initial position
    setTimeout(() => setQueuePosition(42), 1000);
    setTimeout(() => setEstimatedTime(120), 1500);

    // Simulate match found
    const matchTimeout = setTimeout(() => {
      setStatus("found");
      setLines(prev => [
        ...prev,
        { id: Date.now(), text: "> Peer match found! Redirecting...", type: "success" }
      ]);
      setTimeout(() => setCurrentView("chatroom"), 1500);
    }, 15000);

    return () => {
      clearInterval(queueInterval);
      clearTimeout(matchTimeout);
    };
  }, [status, setCurrentView]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "success": return "text-green-600";
      case "warning": return "text-amber-600";
      case "error": return "text-red-600";
      default: return "text-driftwood";
    }
  };

  return (
    <div className="min-h-screen bg-parchment-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Terminal */}
        <div className="bg-midnight-ink rounded-cardlarge overflow-hidden shadow-subtle-6">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-driftwood/20">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-4 text-caption text-driftwood font-geist">
              teme-terminal — queue
            </span>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="p-4 font-geist text-[13px] h-80 overflow-y-auto custom-scrollbar"
          >
            {lines.map(line => (
              <div key={line.id} className={`mb-1 ${getColor(line.type)}`}>
                {line.text}
              </div>
            ))}
            {status === "waiting" && (
              <div className="text-amber-600 animate-pulse">
                _ Searching for peers...
              </div>
            )}
            {status === "found" && (
              <div className="text-green-400">
                ✓ Match found! Establishing connection...
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-2 border-t border-driftwood/20 flex items-center justify-between text-caption text-fog font-geist">
            <span>langs: {languages.join(", ")}</span>
            <span>vibe: {vibe[0]}</span>
          </div>
        </div>

        {/* Queue Status */}
        <div className="mt-6 text-center">
          {status === "waiting" && queuePosition !== null && (
            <>
              <div className="text-body text-driftwood mb-2">
                Queue position: <span className="font-mono font-medium text-midnight-ink">#{queuePosition}</span>
              </div>
              {estimatedTime !== null && (
                <div className="text-caption text-fog">
                  Estimated wait: ~{formatTime(estimatedTime)}
                </div>
              )}
              <div className="text-caption text-fog mt-1">
                Time elapsed: {formatTime(elapsed)}
              </div>
            </>
          )}
          {status === "found" && (
            <div className="text-body text-driftwood">
              Peer found! Connecting...
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView("landing")}
            className="text-caption text-driftwood hover:text-midnight-ink underline"
          >
            Cancel and return home
          </button>
        </div>
      </div>
    </div>
  );
}
