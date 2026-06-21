"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { backend } from "@/services/api";
import { connectSocket, type MatchFound, type ChatIn } from "@/services/socket";
import { CallEngine } from "@/services/webrtc";

export type VCStatus = "idle" | "starting" | "searching" | "connecting" | "connected";
export interface VCMessage {
  id: number;
  type: "system" | "peer" | "you";
  text: string;
}

let mid = 1;

export function useVideoChat() {
  const [status, setStatus] = useState<VCStatus>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<VCMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("peer");
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const engineRef = useRef<CallEngine | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const myIdRef = useRef<string>("");

  const sys = (text: string) => setMessages((m) => [...m, { id: mid++, type: "system", text }]);

  const teardownCall = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    setRemoteStream(null);
  }, []);

  const beginMatch = useCallback(async (e: MatchFound) => {
    setStatus("connecting");
    setSessionId(e.roomId.slice(0, 8).toUpperCase());
    setPartnerName(e.partner.displayName || "peer");
    sys(`Matched with ${e.partner.displayName}. Establishing WebRTC…`);
    try {
      const { iceServers } = await backend.turnCredentials();
      const engine = new CallEngine();
      engineRef.current = engine;
      await engine.start({
        socket: socketRef.current!,
        iceServers,
        isInitiator: myIdRef.current < e.partner.userId,
        localStream: localRef.current!,
        onRemoteStream: setRemoteStream,
        onState: (st) => {
          if (st === "connected") {
            setStatus("connected");
            sys("Peer connection established via WebRTC.");
          }
        },
      });
    } catch (err) {
      sys("Could not establish the call. Try Skip.");
      console.error(err);
    }
  }, []);

  const wireSocket = useCallback(
    (socket: Socket) => {
      socket.on("match:waiting", () => {
        setStatus("searching");
      });
      socket.on("match:found", (e: MatchFound) => {
        setMessages([]);
        beginMatch(e);
      });
      socket.on("match:partner_left", () => {
        teardownCall();
        setSessionId("");
        sys("Peer left. Finding someone new…");
        setStatus("searching");
        socket.emit("match:find");
      });
      socket.on("chat:message", (e: ChatIn) => {
        setMessages((m) => [...m, { id: mid++, type: "peer", text: e.text }]);
      });
      socket.on("chat:blocked", () => sys("A message was blocked by moderation."));
      socket.on("error", (e: { message?: string }) => {
        if (e?.message) sys(`Error: ${e.message}`);
      });
    },
    [beginMatch, teardownCall],
  );

  // ── Actions ──
  const start = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("starting");
    setMessages([]);
    if (!backend.isLoggedIn()) {
      sys("Please sign in first.");
      setStatus("idle");
      return;
    }
    sys("Preparing your session…");
    try {
      myIdRef.current = await backend.ensureReady();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = stream;
      setLocalStream(stream);
      sys("Camera ready. Searching for a peer…");

      const socket = connectSocket();
      socketRef.current = socket;
      wireSocket(socket);
      socket.on("connect", () => {
        socket.emit("match:find");
        setStatus("searching");
      });
    } catch (err) {
      sys("Could not start (camera/mic permission or network). " + (err as Error).message);
      setStatus("idle");
    }
  }, [status, wireSocket]);

  const skip = useCallback(() => {
    teardownCall();
    setSessionId("");
    setMessages([]);
    setStatus("searching");
    socketRef.current?.emit("match:next");
  }, [teardownCall]);

  const stop = useCallback(() => {
    const socket = socketRef.current;
    if (status === "connected") socket?.emit("match:next");
    socket?.emit("match:cancel");
    teardownCall();
    socket?.disconnect();
    socketRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    setLocalStream(null);
    setSessionId("");
    setMessages([]);
    setStatus("idle");
  }, [status, teardownCall]);

  const sendMessage = useCallback((text: string) => {
    const t = text.trim();
    if (!t || !socketRef.current) return;
    socketRef.current.emit("chat:message", { text: t });
    setMessages((m) => [...m, { id: mid++, type: "you", text: t }]);
  }, []);

  const toggleMic = useCallback(() => {
    const next = !micMuted;
    setMicMuted(next);
    localRef.current?.getAudioTracks().forEach((tr) => (tr.enabled = !next));
  }, [micMuted]);

  const toggleCamera = useCallback(() => {
    const next = !cameraOff;
    setCameraOff(next);
    localRef.current?.getVideoTracks().forEach((tr) => (tr.enabled = !next));
  }, [cameraOff]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      socketRef.current?.disconnect();
      localRef.current?.getTracks().forEach((t) => t.stop());
      // Note: we keep tokens so a logged-in session persists across navigation.
    };
  }, []);

  return {
    status, localStream, remoteStream, messages, sessionId, partnerName, micMuted, cameraOff,
    start, stop, skip, sendMessage, toggleMic, toggleCamera,
  };
}
