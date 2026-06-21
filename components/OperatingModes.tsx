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
          <div className="mode-body video-split">
            <div className="cam-feed">
              <span className="cam-label tech-only">REMOTE_PEER_CAM</span>
              <span className="cam-label nontech-only">THE BUILDER</span>
              <span style={{ color: "var(--ink)", opacity: 0.8 }}>
                [ VIDEO SIGNAL ]
              </span>
            </div>
            <div className="cam-feed" style={{ background: "var(--bg)" }}>
              <span className="cam-label">YOU</span>
              <span style={{ opacity: 0.2 }}>[ CAMERA ACTIVE ]</span>
              <div className="cam-controls">
                <button className="cam-btn">MUTE_MIC</button>
                <button className="cam-btn skip">SKIP PEER (ESC)</button>
              </div>
            </div>
          </div>
        </div>

        {/* MODE 2: TERMINAL/CHAT */}
        <div className="mode-card">
          <div className="mode-topbar terminal-theme">
            <span>● ● ●</span>
            <span className="tech-only">[ MODE 02: TERMINAL + CHAT ]</span>
            <span className="nontech-only">[ MODE 02: CHAT + WHITEBOARD ]</span>
            <span>CONNECTED</span>
          </div>
          <div className="mode-body terminal-split">
            {/* Chat Section */}
            <div className="terminal-chat">
              <div className="sys-msg">[14:02] SYSTEM: Match established.</div>

              <div className="tech-only">
                <div>
                  <span className="peer-msg">{"> "}dev_8x:</span> Anyone here
                  good with React?
                </div>
                <div>
                  <span className="host-msg">{"> "}you:</span> Yeah, what&apos;s
                  the issue?
                </div>
              </div>

              <div className="nontech-only">
                <div>
                  <span className="host-msg">{"> "}you:</span> I have this app
                  idea but zero coding skills.
                </div>
                <div>
                  <span className="peer-msg">{"> "}dev_8x:</span> Let&apos;s map
                  it out. Do you have a wireframe?
                </div>
              </div>
            </div>

            {/* Code/Whiteboard Split */}
            <div className="terminal-scratchpad tech-only">
              <div className="terminal-code">
                <span style={{ color: "#F43F5E" }}>function</span>{" "}
                <span style={{ color: "#38BDF8" }}>useFetch</span>() {`{`}
                <br />
                &nbsp;&nbsp;
                <span style={{ color: "#F43F5E" }}>
                  const
                </span> [data, setData] = useState(<span style={{ color: "#38BDF8" }}>null</span>);
                <br />
                &nbsp;&nbsp;<span style={{ color: "#F43F5E" }}>return</span> data;
                <br />
                {`}`}
              </div>
            </div>

            <div className="whiteboard-view nontech-only">
              <div className="sticky-note">
                <strong>App Idea:</strong>
                <br />
                Tinder for finding Devs
              </div>
            </div>

            {/* Terminal Input */}
            <div className="terminal-input">
              <span
                style={{
                  color: "var(--accent-green)",
                  animation: "blink 1s infinite",
                }}
              >
                _
              </span>{" "}
              type message...
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
