/**
 * Socket Service Layer
 * Handles all WebSocket connections and events
 * Abstracted from UI components
 */

import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

// Socket event types
export type SocketEventType =
  | "connect"
  | "disconnect"
  | "match:found"
  | "match:failed"
  | "match:timeout"
  | "peer:signal"
  | "peer:leave"
  | "error";

// Event payload interfaces
export interface MatchFoundPayload {
  roomId: string;
  peerId: string;
  peerData: {
    username: string;
    languages: string[];
    vibe: string[];
  };
}

export interface PeerSignalPayload {
  signal: RTCSessionDescriptionInit;
  peerId: string;
}

export interface PeerLeavePayload {
  peerId: string;
}

// Event handler type
type EventHandler<T = any> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<SocketEventType, Set<EventHandler>> = new Map();

  /**
   * Initialize socket connection with authentication token
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.warn("Socket already connected");
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup internal socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.emit("connect", { socketId: this.socket?.id });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.emit("disconnect", { reason });
    });

    this.socket.on("match:found", (data: MatchFoundPayload) => {
      this.emit("match:found", data);
    });

    this.socket.on("match:failed", (data: { reason: string }) => {
      this.emit("match:failed", data);
    });

    this.socket.on("match:timeout", () => {
      this.emit("match:timeout", {});
    });

    this.socket.on("peer:signal", (data: PeerSignalPayload) => {
      this.emit("peer:signal", data);
    });

    this.socket.on("peer:leave", (data: PeerLeavePayload) => {
      this.emit("peer:leave", data);
    });

    this.socket.on("error", (data: { message: string }) => {
      this.emit("error", data);
    });
  }

  /**
   * Register event handler
   */
  on<T = any>(event: SocketEventType, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unregister event handler
   */
  off<T = any>(event: SocketEventType, handler: EventHandler<T>): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Emit event to registered handlers
   */
  private emit<T = any>(event: SocketEventType, data: T): void {
    this.eventHandlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Join matchmaking queue
   */
  joinMatchmaking(preferences: { languages: string[]; vibe: string[] }): void {
    this.socket?.emit("match:join", preferences);
  }

  /**
   * Leave matchmaking queue
   */
  leaveMatchmaking(): void {
    this.socket?.emit("match:leave");
  }

  /**
   * Send WebRTC signaling data through socket
   */
  sendSignal(targetPeerId: string, signal: RTCSessionDescriptionInit): void {
    this.socket?.emit("peer:signal", { targetPeerId, signal });
  }

  /**
   * Notify that peer is leaving
   */
  notifyLeave(roomId: string): void {
    this.socket?.emit("peer:leave", { roomId });
  }
}

// Export singleton instance
export const socketService = new SocketService();
