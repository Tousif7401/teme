import { create } from "zustand";

// View states for the single-view state machine
export type ViewState = "landing" | "launchpad" | "queue" | "chatroom";

// WebSocket connection status
export type ConnectionStatus = "disconnected" | "connecting" | "connected";

// Landing page mode (tech vs non-tech)
export type LandingMode = "tech" | "nontech";

// User interface state
interface UIState {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  landingMode: LandingMode;
  setLandingMode: (mode: LandingMode) => void;
}

// Authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    avatar?: string;
    provider: "github" | "google";
  } | null;
  setAuthenticated: (user: AuthState["user"]) => void;
  logout: () => void;
}

// WebSocket state
interface SocketState {
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

// WebRTC media state
interface MediaState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
}

// User tags and preferences
interface UserPreferences {
  languages: string[];
  vibe: string[];
  setLanguages: (languages: string[]) => void;
  setVibe: (vibe: string[]) => void;
}

// Combined store interface
interface AppStore extends UIState, AuthState, SocketState, MediaState, UserPreferences {}

export const useAppStore = create<AppStore>((set) => ({
  // UI State
  currentView: "landing",
  setCurrentView: (view) => set({ currentView: view }),
  landingMode: "tech",
  setLandingMode: (mode) => set({ landingMode: mode }),

  // Auth State
  isAuthenticated: false,
  user: null,
  setAuthenticated: (user) => set({ isAuthenticated: !!user, user }),
  logout: () => set({ isAuthenticated: false, user: null }),

  // Socket State
  connectionStatus: "disconnected",
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Media State
  localStream: null,
  remoteStream: null,
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  // User Preferences
  languages: [],
  vibe: [],
  setLanguages: (languages) => set({ languages }),
  setVibe: (vibe) => set({ vibe }),
}));
