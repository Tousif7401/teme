# Engineering Specification: TEME Frontend

This file acts as the primary engineering rulebook for building the frontend codebase of TEME (the tech-focused real-time communication network). It defines the application architectures, tech stack choices, user lifecycle steps, state management primitives, and UI execution rules.

## 1. Core Architectural Pillars
*   **Single-View State Machine Architecture:** Do not use heavy page routing for the application lifecycle (Launchpad, Queue, Room). The persistent WebSocket and WebRTC media streams will break on hard route changes. Use a client-side state machine (managed via Zustand) to swap interface panels dynamically inside a single core viewport wrapper.
*   **Service Layer Isolation:** All network operations, WebSockets (`socket.io-client`), and WebRTC pipelines (`RTCPeerConnection`) must live inside a clean `/services` architecture. Never leak direct socket triggers or ICE candidate event handlers into UI component rendering logic.
*   **Zero Anonymous Gatekeeping:** The application forces strict authentication. Users cannot enter any matching pools without a validated session JSON Web Token (JWT) issued via verified GitHub or Google OAuth.

---

## 2. Frontend Tech Stack Specification
The frontend must be compiled using this exact package matrix. Do not swap or add alternative core libraries without manual override approval.

*   **Core Framework:** Next.js (App Router) + TypeScript. TypeScript interfaces must be explicitly declared for all incoming and outgoing WebSocket payloads.
*   **UI Foundation:** Tailwind CSS + Shadcn UI. Use Shadcn components strictly as structural primitives. Do not pull down pre-built bloated layout marketplace packages.
*   **Global Client State:** Zustand. All active media stream references (`MediaStream`), socket connection primitives, user tags, and UI state switches must live in an atomic Zustand store to ensure high-frequency updates do not trigger unnecessary DOM re-renders.
*   **Real-Time Messaging Network:** `socket.io-client`. Handles all persistent connections to the signaling server, match status indicators, and matchmaking lifecycle hooks.
*   **Real-Time Streaming Protocol:** Native Browser WebRTC API (`RTCPeerConnection` and `RTCDataChannel`). Text payloads and code inputs must bypass the central socket server and travel directly over an encrypted data channel once a peer handshake completes.
*   **Interactive Code Workspace:** CodeMirror or Monaco Editor (Core Client Wrapper). Used to render the right-hand panel workspace with built-in language syntax highlighting and markdown serialization.

---

## 3. Anti-AI Slop Guidelines (Strict UI Presence Enforcement)
The interface must present a high-fidelity, premium, opinionated developer-tool presence. Any code generation or asset compilation must completely bypass generic LLM template conventions.

*   **Banned Visual Fingerprints:**
    *   **NO Generic Ambient Gradients:** Absolutely no floating blurred purple/pink/blue gradient glowing orbs in backgrounds. 
    *   **NO Default Glassmorphic Boilerplates:** Avoid the generic semi-transparent frosted-glass overlay style that mimics standard chat template playgrounds.
    *   **NO Cliched Bento Grids:** Do not arrange platform highlights or metrics inside generic grid blocks topped with neon icons.
    *   **NO Soft Shadow Excess:** Avoid heavy, diffuse box-shadows designed to mask poor layout alignment.
*   **Expected Presence:**
    *   **Utilitarian / Hyper-Refined Minimalism:** Use crisp borders, deliberate high-contrast text lines conforming strictly to WCAG AA accessibility rules, and layouts that prioritize raw text and code readouts.
    *   **Monospace Characterization:** Lean on subtle monospace detailing for structural items (badges, states, connection tickers).
    *   **Deterministic Staggered Reveals:** Use subtle CSS-only keyframe delays for layout entries instead of loose, spring-heavy floating macro-animations.

---

## 4. Main Landing Page Sections & Structure

The landing page must behave like a precision funnel designed to drive the single `[ Take me to TEME ]` conversion.

### Section 1: The Sticky Header (Navbar)
*   **Brand Placement:** Left-aligned platform mark in clean monospace typography.
*   **Network Pulse Ticker:** A persistent live counter displaying user volume (e.g., `● 1,420 Engineers Active`). The pulsing dot indicator must cycle smoothly using a clean CSS keyframe scale pulse.
*   **Repository Access:** Right-aligned icon redirecting to the project's open-source repository.

### Section 2: The Hero Space (Above the Fold)
*   **The Proposition:** A prominent, high-contrast headline calling out the targeted developer audience, accompanied by a clear subheadline emphasizing the complete exclusion of bots and trolls through mandatory verification.
*   **The Focal Call to Action:** A single, high-impact primary trigger element stating `[ Take me to TEME ]`. 

### Section 3: The Interaction Transition (The Auth Sheet)
*   Clicking `[ Take me to TEME ]` must never execute an immediate hard page reload. 
*   It must trigger a high-fidelity layout transition. The layout either introduces an explicit, focused authentication layout sheet overlaying the fold, or initializes an in-character terminal component expanding vertically to print system initialization lines before revealing the secure identity choices:
    *   `[ Continue with GitHub ]`
    *   `[ Continue with Google ]`

### Section 4: The Network Profile Pipeline
*   A descriptive 3-column responsive flex framework mapping the exact user steps:
    1.  *Cryptographic Identity Verification* (OAuth layer checks via GitHub/Google).
    2.  *Stack & Intent Targeting* (Language and vibe filtering inputs).
    3.  *P2P Tunnel Initiation* (WebRTC browser-to-browser media connection).

### Section 5: The Interface Teaser
*   A detailed, static UI layout module replicating the interior chat environment to provide visual validation of the platform's utility before the user connects their third-party credentials.

---

## 5. System Directory Tree

Maintain a decoupled structure so integration with the backend signaling server involves updating the translation services folder exclusively.

```text
src/
├── components/          # Fragmented Layout Modules
│   ├── VideoCanvas.tsx  # Local/Remote raw HTML video elements
│   ├── CodeScratch.tsx  # Textarea wrapper / Monaco / CodeMirror editor instance
│   └── ChatTimeline.tsx # Reactive scroll container tracking message logs
├── views/               # Context View Switches
│   ├── LandingView.tsx  # Static funnel view
│   ├── LaunchpadView.tsx# Hardware config & Tag selector state
│   ├── QueueView.tsx    # Terminal-themed socket queue loader
│   └── ChatRoomView.tsx # Connected 3-panel environment
├── services/            # Edge Core Pipelines (Abstracted from UI)
│   ├── api.ts           # REST Fetch operations (Mocked for parallel compilation)
│   ├── socket.ts        # WebSocket connection events configuration
│   └── webrtc.ts        # Peer Connection instance state management
└── store/
    └── useAppStore.ts   # Zustand unified atomic client application state