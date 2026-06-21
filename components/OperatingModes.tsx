"use client";

import React from "react";

export function OperatingModes() {
  return (
    <section className="modes-section">
      <div className="modes-header-container">
        <div className="modes-header">
          <h2>CHOOSE YOUR VECTOR</h2>
          <p>
            <span className="tech-only">
              Two strictly defined interfaces. No bloated features.
            </span>
            <span className="nontech-only">
              Camera on or camera off. You control the vibe.
            </span>
          </p>
        </div>
      </div>

      <div className="modes-grid">
        {/* MODE 1: VIDEO */}
        <div className="mode-card">
          <div className="mode-topbar">
            <span>● ● ●</span>
            <span>[ MODE 01: FACE TO FACE ]</span>
            <span className="tech-only">WEBRTC // ACTIVE</span>
            <span className="nontech-only">LIVE VIDEO</span>
          </div>
          <div className="mode-body video-split-horizontal">
            {/* Remote Peer Feed */}
            <div className="cam-feed-horizontal">
              <span className="cam-label tech-only">REMOTE_PEER_CAM</span>
              <span className="cam-label nontech-only">THE BUILDER</span>
              <span style={{ color: "var(--ink)", opacity: 0.8, marginTop: "8px", fontSize: "14px" }}>
                [ VIDEO SIGNAL ]
              </span>
            </div>

            {/* Local Feed */}
            <div className="cam-feed-horizontal local-feed">
              <span className="cam-label">LOCAL_HOST_CAM</span>
              <span style={{ opacity: 0.3, marginTop: "8px", fontSize: "14px" }}>[ CAMERA ACTIVE ]</span>
              <div className="cam-controls-horizontal">
                <button className="cam-btn-sm">MUTE</button>
                <button className="cam-btn-sm">CAM OFF</button>
                <button className="cam-btn-sm skip">SKIP (ESC)</button>
              </div>
            </div>
          </div>
        </div>

        {/* MODE 2: TERMINAL/CHAT */}
        <div className="mode-card">
          <div className="mode-topbar terminal-theme">
            <span>● ● ●</span>
            <span className="tech-only">[ MODE 02: TEXT ONLY CHAT ]</span>
            <span className="nontech-only">[ MODE 02: CHAT ONLY ]</span>
            <span>CONNECTED</span>
          </div>
          <div className="mode-body chat-only-layout">
            {/* Left: Peer Panel */}
            <div className="peer-panel-preview">
              {/* Avatar */}
              <div className="peer-avatar-preview">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Peer Name */}
              <div className="peer-name-preview">
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-green)", animation: "blink 1s infinite" }}></div>
                <span>peer_8x92a</span>
              </div>

              {/* Divider */}
              <div className="panel-divider"></div>

              {/* Stack Tags */}
              <div className="stack-tags-preview">
                <span style={{ fontSize: "9px", color: "#888" }}>STACK</span>
                <div className="tags-row">
                  <span className="tag">React</span>
                  <span className="tag">TS</span>
                  <span className="tag">Node</span>
                </div>
              </div>

              {/* View Profile Button */}
              <div className="view-profile-btn">[ VIEW FULL PROFILE ]</div>

              {/* Action Buttons */}
              <div className="panel-actions">
                <div className="action-btn-sm blue">[ UPGRADE TO VIDEO ]</div>
                <div className="action-btn-sm red">[ END SESSION ]</div>
              </div>

              {/* Your Profile */}
              <div className="your-profile-section">
                <span style={{ fontSize: "9px", color: "#888" }}>YOUR PROFILE</span>
                <div className="profile-mini">
                  <div className="avatar-small"></div>
                  <span>you_dev</span>
                </div>
              </div>
            </div>

            {/* Right: Chat Area */}
            <div className="chat-area-preview">
              {/* Peer Status Bar */}
              <div className="chat-status-bar">
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-green)", animation: "blink 1s infinite" }}></div>
                <span className="tech-only">peer_8x92a // connected via WebSocket</span>
                <span className="nontech-only">peer_8x92a // connected</span>
              </div>

              {/* Chat Messages */}
              <div className="chat-messages-preview">
                <div className="sys-line">[14:02:11] Peer connection established.</div>
                <div className="sys-line">[14:02:12] peer_8x92a joined.</div>
                <div className="msg-line">
                  <span className="msg-prefix">&gt; peer_8x92a: </span>
                  <span className="tech-only">Anyone here good with React?</span>
                  <span className="nontech-only">Hey! What brings you here?</span>
                </div>
                <div className="msg-line">
                  <span className="msg-prefix">&gt; you: </span>
                  <span className="tech-only">Yeah, what's the issue?</span>
                  <span className="nontech-only">Working on a side project.</span>
                </div>
              </div>

              {/* Chat Input */}
              <div className="chat-input-preview">
                <span style={{ color: "#888" }}>Type a message...</span>
                <div className="send-btn">SEND</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
