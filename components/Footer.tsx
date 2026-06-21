"use client";

import React from "react";

export function Footer() {
  const handleClick = () => {
    window.location.href = "/login";
  };

  return (
    <footer>
      <div className="footer-cta">
        <h2>
          <span className="tech-only">READY TO EXECUTE?</span>
          <span className="nontech-only">READY TO VIBE?</span>
        </h2>
        <button className="btn primary" onClick={handleClick}>
          <span className="tech-only">[ INITIATE CONNECTION ]</span>
          <span className="nontech-only">[ START MATCHING ]</span>
        </button>
      </div>
      <div className="footer-meta">
        <div>TEME CORE // VER 1.0</div>
        <div>DESIGNED BY BUILDERS</div>
        <div>© 2026 LOGOUT</div>
      </div>
    </footer>
  );
}
