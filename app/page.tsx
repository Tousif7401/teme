"use client";

import { useAppStore } from "@/store/useAppStore";
import { LandingView, LaunchpadView, QueueView, ChatRoomView } from "@/views";

export default function HomePage() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case "launchpad":
      return <LaunchpadView />;
    case "queue":
      return <QueueView />;
    case "chatroom":
      return <ChatRoomView />;
    default:
      return <LandingView />;
  }
}
