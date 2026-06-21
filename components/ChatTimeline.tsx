"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  sender: "you" | "peer";
  content: string;
  timestamp: Date;
}

export interface ChatTimelineProps {
  messages: Message[];
  className?: string;
  currentUserName?: string;
  peerUserName?: string;
}

const ChatTimeline = React.forwardRef<HTMLDivElement, ChatTimelineProps>(
  ({ messages, className, currentUserName = "you", peerUserName = "peer" }, ref) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatTimestamp = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
      return date.toLocaleDateString();
    };

    return (
      <div
        ref={ref}
        className={cn("overflow-y-auto custom-scrollbar", className)}
      >
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-body text-driftwood">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showDate = index === 0 ||
                new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center">
                      <span className="text-caption text-fog px-2 py-1 bg-warm-sand rounded-cards">
                        {msg.timestamp.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex flex-col",
                      msg.sender === "you" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2",
                        msg.sender === "you"
                          ? "bg-midnight-ink text-parchment-white"
                          : "bg-warm-sand text-midnight-ink"
                      )}
                    >
                      <span className="text-[13px] leading-relaxed">{msg.content}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-fog">
                        {msg.sender === "you" ? currentUserName : peerUserName}
                      </span>
                      <span className="text-[10px] text-fog">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }
);

ChatTimeline.displayName = "ChatTimeline";

export { ChatTimeline };
