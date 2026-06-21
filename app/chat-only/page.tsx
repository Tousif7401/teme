"use client";

import { ChatOnlyView } from "@/components";

export default function ChatOnlyPage() {
  const handleEndSession = () => {
    console.log("End session clicked");
    // Navigate back to landing or queue
  };

  const handleRequestVideo = () => {
    console.log("Request video clicked");
    // Upgrade to video session
  };

  return (
    <ChatOnlyView
      onEndSession={handleEndSession}
      onRequestVideo={handleRequestVideo}
    />
  );
}
