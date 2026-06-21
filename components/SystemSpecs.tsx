"use client";

import React from "react";

export function SystemSpecs() {
  return (
    <section className="specs-section">
      <div className="specs-sidebar">
        <h2 style={{ paddingTop: "52px" }}>
          <span className="tech-only">SYS.</span>
          <span className="tech-only">SPECS</span>
          <span className="nontech-only">THE</span>
          <span className="nontech-only">VIBE</span>
        </h2>
      </div>
      <div className="specs-grid">
        <div className="spec-item">
          <span className="spec-label tech-only" >ENV.01</span>
          <span className="spec-label nontech-only" >RULE.01</span>
          <h3 className="tech-only">Context Switching</h3>
          <h3 className="nontech-only">Zero Intimidation</h3>
          <p className="tech-only">
            Start in text mode. Upgrade to video instantly. Downgrade back to
            text if you need to focus. Total environmental control.
          </p>
          <p className="nontech-only">
            Start entirely in text chat. If you vibe with the developer, turn
            your camera on. If not, just hit skip and match with someone else.
          </p>
        </div>
        <div className="spec-item">
          <span className="spec-label tech-only" >ENV.02</span>
          <span className="spec-label nontech-only" >RULE.02</span>
          <h3 className="tech-only">Stack Filtering</h3>
          <h3 className="nontech-only">Filter by Interest</h3>
          <p className="tech-only">
            Looking for a Python dev? Set{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "0 4px",
                border: "1px solid var(--ink)",
              }}
            >
              require(&apos;python&apos;)
            </code>
            . Don&apos;t waste time explaining frameworks to the wrong crowd.
          </p>
          <p className="nontech-only">
            Want to talk about AI, Web3, or Gaming? Set your filters so you only
            match with developers building in that specific space.
          </p>
        </div>
        <div className="spec-item">
          <span className="spec-label tech-only" >ENV.03</span>
          <span className="spec-label nontech-only" >RULE.03</span>
          <h3 className="tech-only">Zero Clutter</h3>
          <h3 className="nontech-only">No Fake Profiles</h3>
          <p className="tech-only">
            No profiles to curate. Authenticate to prove you aren&apos;t a bot,
            then drop straight into the peer pool.
          </p>
          <p className="nontech-only">
            No bloated LinkedIn resumes or fake influencer bios. Everyone
            verifies via Google or Github. Real people, real conversations.
          </p>
        </div>
      </div>
    </section>
  );
}
