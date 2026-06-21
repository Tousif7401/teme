"use client";

import React from "react";

export function Manifesto() {
  return (
    <section className="manifesto">
      <h2>
        <span className="tech-only">NETWORKING IS BROKEN.</span>
        <span className="tech-only">LINKEDIN IS CRINGE.</span>
        <span className="nontech-only">TECH NETWORKING IS TOO EXCLUSIVE.</span>
        <span className="nontech-only">WE FIXED IT.</span>
      </h2>
      <p>
        <span className="tech-only">
          We built TEME because tech meetups are awkward and Discord servers are
          too noisy. You just need a place to drop in, pair program with a
          stranger, and log out. No performative posting, no follow counts.
        </span>
        <span className="nontech-only">
          You don&apos;t need a CS degree to talk to people building the future.
          Stop sending cold DMs on Twitter. Just drop in, match with a random
          developer, and see what happens. No jargon, just ideas.
        </span>
      </p>
    </section>
  );
}
