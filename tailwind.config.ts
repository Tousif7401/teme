import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brutalist color palette - stark, uncompromising
        bg: "#F0F0EE", // Newsprint off-white
        ink: "#0A0A0A", // Deep black
        "accent-red": "#FF3366", // Aggressive action color
        "accent-green": "#00E676", // Live status color (tech mode)
        "accent-blue": "#2962FF", // Secondary action
        "accent-yellow": "#FFEA00", // Warning/Highlight
        "accent-purple": "#B026FF", // Non-tech mode accent
      },
      fontFamily: {
        // Bold, impactful typography
        display: ["Bricolage Grotesque", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["7rem", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        display: ["clamp(3.5rem, 7vw, 7rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "heading-xl": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "heading-lg": ["clamp(2rem, 5vw, 4.5rem)", { lineHeight: "1" }],
        heading: ["clamp(1.5rem, 3vw, 2.5rem)", { lineHeight: "1.1" }],
        body: ["18px", { lineHeight: "1.4" }],
        caption: ["12px", { lineHeight: "1.4" }],
        mono: ["14px", { lineHeight: "1.4" }],
      },
      spacing: {
        18: "18px",
      },
      borderRadius: {
        none: "0",
      },
      boxShadow: {
        // Hard, brutalist shadows
        brutal: "6px 6px 0px 0px #0A0A0A",
        "brutal-sm": "4px 4px 0px 0px #0A0A0A",
        "brutal-hover": "2px 2px 0px 0px #0A0A0A",
        "brutal-lg": "12px 12px 0px 0px #0A0A0A",
      },
      borderWidth: {
        brutal: "2px",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(#0A0A0A 1px, transparent 1px), linear-gradient(90deg, #0A0A0A 1px, transparent 1px)",
        "dots-pattern": "radial-gradient(#0A0A0A 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
        dots: "24px 24px",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scan: {
          "0%": { top: "0" },
          "100%": { top: "100%" },
        },
      },
      animation: {
        blink: "blink 1.5s infinite",
        scroll: "scroll 20s linear infinite",
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
