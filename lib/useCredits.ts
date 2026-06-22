"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Lightweight, frontend-only rewards system: earn "TEME credits" for using the app.
// Stored per-browser in localStorage (MVP — can move to the backend later).

const KEY = "teme_credits_v1";

export interface CreditsState {
  balance: number;
  totalEarned: number;
  matches: number;
  minutes: number;
  streak: number; // consecutive days active
  lastDay: string; // YYYY-MM-DD
}

export interface Milestone {
  at: number;
  label: string;
  perk: string;
}

export const MILESTONES: Milestone[] = [
  { at: 100, label: "Verified Dev", perk: "Verified badge on your profile" },
  { at: 300, label: "Fast Lane", perk: "Priority matching in the queue" },
  { at: 750, label: "Spotlight", perk: "Profile boost — matched more often" },
  { at: 1500, label: "TEME Pro", perk: "All perks + early features" },
];

// Earn rates.
export const REWARDS = {
  MATCH: 10, // per successful match
  MINUTE: 2, // per minute connected
  DAILY: 50, // daily check-in bonus
};

const empty = (): CreditsState => ({
  balance: 0,
  totalEarned: 0,
  matches: 0,
  minutes: 0,
  streak: 0,
  lastDay: "",
});

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): CreditsState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(s: CreditsState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function useCredits() {
  const [state, setState] = useState<CreditsState>(empty);
  const [flash, setFlash] = useState<{ amount: number; reason: string; id: number } | null>(null);
  const flashId = useRef(0);

  // Hydrate + daily check-in bonus / streak.
  useEffect(() => {
    const s = load();
    const day = today();
    if (s.lastDay !== day) {
      // Streak: +1 if yesterday, else reset to 1.
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      s.streak = s.lastDay === yesterday ? s.streak + 1 : 1;
      s.lastDay = day;
      s.balance += REWARDS.DAILY;
      s.totalEarned += REWARDS.DAILY;
      save(s);
      flashId.current += 1;
      setFlash({ amount: REWARDS.DAILY, reason: "Daily check-in", id: flashId.current });
    }
    setState(s);
  }, []);

  const earn = useCallback((amount: number, reason: string, kind?: "match" | "minute") => {
    setState((prev) => {
      const next: CreditsState = {
        ...prev,
        balance: prev.balance + amount,
        totalEarned: prev.totalEarned + amount,
        matches: prev.matches + (kind === "match" ? 1 : 0),
        minutes: prev.minutes + (kind === "minute" ? 1 : 0),
      };
      save(next);
      return next;
    });
    flashId.current += 1;
    setFlash({ amount, reason, id: flashId.current });
  }, []);

  const clearFlash = useCallback(() => setFlash(null), []);

  const next = MILESTONES.find((m) => m.at > state.balance) ?? null;
  const prevAt = [...MILESTONES].reverse().find((m) => m.at <= state.balance)?.at ?? 0;
  const progress = next ? (state.balance - prevAt) / (next.at - prevAt) : 1;
  const unlocked = MILESTONES.filter((m) => m.at <= state.balance);

  return { ...state, earn, flash, clearFlash, next, progress, unlocked };
}
