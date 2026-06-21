/**
 * WebRTC Service Layer
 * Handles P2P media and data channel connections
 * Abstracted from UI components
 */

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  enableAudio?: boolean;
  enableVideo?: boolean;
  enableDataChannel?: boolean;
}

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

type ConnectionState = RTCPeerConnectionState;

type DataChannelMessage =
  | { type: "chat"; content: string; timestamp: number }
  | { type: "code"; content: string; language?: string; timestamp: number }
  | { type: "typing"; isTyping: boolean };

type MessageHandler = (message: DataChannelMessage) => void;

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private connectionState: ConnectionState = "new";
  private messageHandlers: Set<MessageHandler> = new Set();

  private readonly defaultConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  /**
   * Initialize WebRTC with optional custom config
   */
  async initialize(config?: WebRTCConfig): Promise<void> {
    const rtcConfig: RTCConfiguration = {
      ...this.defaultConfig,
      iceServers: config?.iceServers || this.defaultConfig.iceServers,
    };

    this.peerConnection = new RTCPeerConnection(rtcConfig);
    this.setupPeerConnectionEvents();
    this.connectionState = "new";
  }

  /**
   * Get local media stream
   */
  async getLocalStream(constraints: MediaConstraints = { audio: true, video: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw new Error("Failed to access media devices");
    }
  }

  /**
   * Add local stream tracks to peer connection
   */
  addLocalTracks(): void {
    if (!this.peerConnection || !this.localStream) {
      throw new Error("Peer connection not initialized or no local stream");
    }

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });
  }

  /**
   * Create offer for peer connection
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    // Create data channel before offer for initiator
    this.createDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Create answer for peer connection
   */
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Set remote description
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    await this.peerConnection.setRemoteDescription(description);
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    await this.peerConnection.addIceCandidate(candidate);
  }

  /**
   * Setup peer connection event listeners
   */
  private setupPeerConnectionEvents(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate through socket service
        // This will be handled by the calling code
        console.log("ICE candidate generated:", event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState = this.peerConnection!.connectionState;
      console.log("Connection state changed:", this.connectionState);

      if (this.connectionState === "connected") {
        console.log("WebRTC connection established");
      } else if (this.connectionState === "failed" || this.connectionState === "disconnected") {
        console.warn("WebRTC connection failed/disconnected");
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      console.log("Data channel received");
      this.dataChannel = event.channel;
      this.setupDataChannelEvents();
    };
  }

  /**
   * Create data channel (for initiator)
   */
  private createDataChannel(): void {
    if (!this.peerConnection) return;

    this.dataChannel = this.peerConnection.createDataChannel("messages", {
      ordered: false,
      maxRetransmits: 0,
    });

    this.setupDataChannelEvents();
  }

  /**
   * Setup data channel event listeners
   */
  private setupDataChannelEvents(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log("Data channel opened");
    };

    this.dataChannel.onclose = () => {
      console.log("Data channel closed");
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message: DataChannelMessage = JSON.parse(event.data);
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Error parsing data channel message:", error);
      }
    };
  }

  /**
   * Send message through data channel
   */
  sendMessage(message: DataChannelMessage): void {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      console.warn("Data channel not open");
      return;
    }

    this.dataChannel.send(JSON.stringify(message));
  }

  /**
   * Register message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get local stream
   */
  getLocalStreamRef(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStreamRef(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Stop all tracks and cleanup
   */
  cleanup(): void {
    // Stop local tracks
    this.localStream?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Clear references
    this.localStream = null;
    this.remoteStream = null;
    this.connectionState = "new";
    this.messageHandlers.clear();
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
