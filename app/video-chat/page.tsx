"use client";

import { VideoChatView } from "@/components";

export default function VideoChatPage() {
  const handleEndCall = () => {
    console.log("End call clicked");
    // Navigate back to landing or queue
  };

  const handleSkipPeer = () => {
    console.log("Skip peer clicked");
    // Find next peer
  };

  return (
    <VideoChatView
      onEndCall={handleEndCall}
      onSkipPeer={handleSkipPeer}
    />
  );
}
