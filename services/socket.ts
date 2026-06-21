/**
 * Socket Service Layer — wired to the DevMatch realtime gateway.
 * Exposes a small typed wrapper used by the video-chat container.
 */
import { io, Socket } from "socket.io-client";
import { tokens } from "./api";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE || "https://13.206.6.189.nip.io").replace(/\/$/, "");

export interface MatchFound {
  roomId: string;
  partner: { userId: string; displayName: string; role: string; techStack: string[] };
}
export interface ChatIn {
  from: string;
  text: string;
  at: number;
}

export function connectSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token: tokens.access ?? "" },
    reconnection: true,
    reconnectionAttempts: 5,
  });
}
