"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { track } from "@/lib/analytics";
import {
  VideoCanvas,
  MediaControls,
  ChatTimeline,
  CodeScratch,
  PeerInfoCard,
} from "@/components";

type Message = {
  id: string;
  sender: "you" | "peer";
  content: string;
  timestamp: Date;
};

type CodeBlock = {
  id: string;
  content: string;
  language: string;
  sender: "you" | "peer";
  timestamp: Date;
};

export function ChatRoomView() {
  const { user, setCurrentView, localStream, remoteStream } = useAppStore();
  const [sessionStartTime] = useState(Date.now());

  // Track session start when component mounts
  useEffect(() => {
    track.sessionStart();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "peer",
      content: "Hey! Ready to pair program?",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([
    {
      id: "1",
      content: `async function processData(data) {\n  const result = await validateSchema(data);\n  return transform(result);\n}`,
      language: "javascript",
      sender: "peer",
      timestamp: new Date(Date.now() - 30000),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("javascript");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isPeerConnected, setIsPeerConnected] = useState(true);

  // Simulate peer response
  useEffect(() => {
    const interval = setInterval(() => {
      const responses = [
        "That looks good to me!",
        "Have you considered using a more functional approach?",
        "Nice work on the error handling.",
        "Let me test this locally.",
        "👍 Sounds good!",
      ];
      // Random chance to send a message
      if (Math.random() > 0.9 && isPeerConnected) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "peer",
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
          },
        ]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPeerConnected]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "you",
        content: inputMessage,
        timestamp: new Date(),
      },
    ]);
    track.messageSent();
    setInputMessage("");
  };

  const handleSendCode = () => {
    if (!codeInput.trim()) return;

    setCodeBlocks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: codeInput,
        language: currentLanguage,
        sender: "you",
        timestamp: new Date(),
      },
    ]);
    setCodeInput("");
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(prev => {
      const newState = !prev;
      // In production: toggle audio track on localStream
      localStream?.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });
      track.videoToggle(newState ? 'mic_on' : 'mic_off');
      return newState;
    });
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(prev => {
      const newState = !prev;
      // In production: toggle video track on localStream
      localStream?.getVideoTracks().forEach(track => {
        track.enabled = newState;
      });
      track.videoToggle(newState ? 'camera_on' : 'camera_off');
      return newState;
    });
  };

  const handleLeaveRoom = () => {
    // Track session duration
    const duration = Date.now() - sessionStartTime;
    track.sessionEnded(duration);

    // In production: cleanup WebRTC, socket, etc.
    setCurrentView("landing");
  };

  // Mock peer info
  const peerInfo = {
    username: "peer_dev",
    languages: ["TypeScript", "Rust", "Go"],
    vibe: "pair",
    region: "US-East",
  };

  return (
    <div className="h-screen bg-parchment-white flex flex-col">
      {/* Room Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-ash-border bg-white">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isPeerConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-caption text-driftwood font-geist">
            {isPeerConnected ? "Connected" : "Disconnected"}
          </span>
          <span className="text-caption text-fog">|</span>
          <span className="text-caption text-driftwood font-geist">
            Session: {Date.now().toString(36).toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleLeaveRoom}
          className="text-caption text-driftwood hover:text-midnight-ink underline"
        >
          Leave Room
        </button>
      </header>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Panel 1: Video */}
        <div className="border-b lg:border-b-0 lg:border-r border-ash-border flex flex-col bg-midnight-ink">
          <div className="px-4 py-2 border-b border-driftwood/20">
            <span className="text-subheading font-medium text-driftwood">Video</span>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Remote Video */}
            <div className="flex-1 min-h-[200px]">
              <VideoCanvas
                stream={remoteStream}
                type="remote"
                label={peerInfo.username}
                className="h-full"
              />
            </div>

            {/* Local Video */}
            <div className="aspect-video">
              <VideoCanvas
                stream={localStream}
                type="local"
                label="you"
                mirrored
                className="h-full"
              />
            </div>

            {/* Peer Info */}
            <PeerInfoCard
              peer={peerInfo}
              isConnected={isPeerConnected}
              variant="compact"
            />
          </div>

          {/* Media Controls */}
          <div className="p-4 border-t border-driftwood/20">
            <MediaControls
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              onToggleAudio={handleToggleAudio}
              onToggleVideo={handleToggleVideo}
              onLeave={handleLeaveRoom}
              variant="floating"
            />
          </div>
        </div>

        {/* Panel 2: Chat */}
        <div className="border-b lg:border-b-0 lg:border-r border-ash-border flex flex-col bg-white">
          <ChatTimeline
            messages={messages}
            currentUserName={user?.username || "you"}
            peerUserName={peerInfo.username}
            className="flex-1"
          />
          <div className="p-4 border-t border-ash-border bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-inputs border border-ash-border text-[13px] focus:outline-none focus:ring-2 focus:ring-midnight-ink"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-4 py-2 bg-midnight-ink text-parchment-white rounded-buttons text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-driftwood"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Panel 3: Code */}
        <CodeScratch
          codeBlocks={codeBlocks}
          currentCode={codeInput}
          onCodeChange={setCodeInput}
          onSendCode={handleSendCode}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          className="bg-white"
        />
      </div>
    </div>
  );
}
