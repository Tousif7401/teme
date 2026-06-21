/**
 * WebRTC call engine — sets up the peer connection, exchanges SDP/ICE over the socket,
 * and surfaces local + remote streams. Media is peer-to-peer (TURN only as fallback).
 */
import type { Socket } from "socket.io-client";

interface StartOpts {
  socket: Socket;
  iceServers: RTCIceServer[];
  isInitiator: boolean;
  localStream: MediaStream;
  onRemoteStream: (s: MediaStream) => void;
  onState: (s: RTCPeerConnectionState) => void;
}

export class CallEngine {
  private pc?: RTCPeerConnection;
  private pendingIce: RTCIceCandidateInit[] = [];
  private remoteSet = false;
  private socket?: Socket;

  async start(o: StartOpts): Promise<void> {
    this.socket = o.socket;
    this.pc = new RTCPeerConnection({ iceServers: o.iceServers });
    o.localStream.getTracks().forEach((t) => this.pc!.addTrack(t, o.localStream));

    const remote = new MediaStream();
    this.pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => remote.addTrack(t));
      o.onRemoteStream(remote);
    };
    this.pc.onicecandidate = (e) => {
      if (e.candidate) o.socket.emit("webrtc:ice-candidate", e.candidate.toJSON());
    };
    this.pc.onconnectionstatechange = () => {
      const st = this.pc!.connectionState;
      o.onState(st);
      if (st === "connected") this.reportPath();
    };

    o.socket.on("webrtc:offer", (p: { sdp: string }) => this.onOffer(p));
    o.socket.on("webrtc:answer", (p: { sdp: string }) => this.onAnswer(p));
    o.socket.on("webrtc:ice-candidate", (p: RTCIceCandidateInit) => this.onIce(p));

    if (o.isInitiator) {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      o.socket.emit("webrtc:offer", { type: "offer", sdp: offer.sdp });
    }
  }

  private async onOffer(p: { sdp: string }) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription({ type: "offer", sdp: p.sdp });
    this.remoteSet = true;
    await this.flushIce();
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.socket!.emit("webrtc:answer", { type: "answer", sdp: answer.sdp });
  }
  private async onAnswer(p: { sdp: string }) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription({ type: "answer", sdp: p.sdp });
    this.remoteSet = true;
    await this.flushIce();
  }
  private async onIce(c: RTCIceCandidateInit) {
    if (!this.pc) return;
    if (!this.remoteSet) {
      this.pendingIce.push(c);
      return;
    }
    try {
      await this.pc.addIceCandidate(c);
    } catch {
      /* ignore */
    }
  }
  private async flushIce() {
    for (const c of this.pendingIce) {
      try {
        await this.pc!.addIceCandidate(c);
      } catch {
        /* ignore */
      }
    }
    this.pendingIce = [];
  }
  private async reportPath() {
    try {
      const stats = await this.pc!.getStats();
      let relay = false;
      stats.forEach((r: any) => {
        if (r.type === "candidate-pair" && r.state === "succeeded" && r.localCandidateId) {
          stats.forEach((c: any) => {
            if (c.id === r.localCandidateId && c.candidateType === "relay") relay = true;
          });
        }
      });
      this.socket!.emit("webrtc:connected", { relay });
    } catch {
      /* best effort */
    }
  }

  stop() {
    this.socket?.off("webrtc:offer");
    this.socket?.off("webrtc:answer");
    this.socket?.off("webrtc:ice-candidate");
    this.pc?.close();
    this.pc = undefined;
    this.pendingIce = [];
    this.remoteSet = false;
  }
}
