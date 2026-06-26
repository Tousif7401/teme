"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { PulseTicker } from "@/components/PulseTicker";
import { useAppStore } from "@/store/useAppStore";
import { track } from "@/lib/analytics";

// Available programming languages
const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Rust", "Go", "Java",
  "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Scala",
  "Haskell", "Elixir", "Clojure", "F#", "Racket", "OCaml"
];

// Collaboration vibes
const VIBES = [
  { id: "mentorship", label: "Mentorship", description: "Learn from experienced developers" },
  { id: "pair", label: "Pair Programming", description: "Collaborate on code together" },
  { id: "review", label: "Code Review", description: "Get feedback on your code" },
  { id: "casual", label: "Casual Chat", description: "Network and discuss tech" },
];

export function LaunchpadView() {
  const { setLanguages, setVibe, setCurrentView } = useAppStore();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [isCheckingMedia, setIsCheckingMedia] = useState(false);
  const [mediaPermission, setMediaPermission] = useState<"unknown" | "granted" | "denied">("unknown");

  // Track page view
  useEffect(() => {
    track.pageView('launchpad', { view: 'launchpad' });
  }, []);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : prev.length < 5 ? [...prev, lang] : prev
    );
  };

  const checkMediaPermissions = async () => {
    setIsCheckingMedia(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMediaPermission("granted");
      track.featureUsed('media_check_granted');
    } catch (error) {
      setMediaPermission("denied");
      track.featureUsed('media_check_denied');
    }
    setIsCheckingMedia(false);
  };

  const handleContinue = () => {
    if (selectedLanguages.length > 0 && selectedVibe) {
      setLanguages(selectedLanguages);
      setVibe([selectedVibe]);
      // Track preference configuration
      track.event('preferences_configured', {
        languageCount: selectedLanguages.length,
        languages: selectedLanguages,
        vibe: selectedVibe,
      });
      setCurrentView("queue");
    }
  };

  const canContinue = selectedLanguages.length > 0 && selectedVibe && mediaPermission === "granted";

  return (
    <div className="min-h-screen bg-parchment-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-parchment-white border-b border-ash-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-9 items-center justify-between">
            <span className="font-waldenburgfh font-bold text-[14px] text-midnight-ink" style={{ letterSpacing: "0.05em" }}>
              || TEME
            </span>
            <PulseTicker count={1420} label="Engineers Active" variant="compact" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-waldenburg font-light text-heading-lg text-midnight-ink mb-4" style={{ letterSpacing: "-0.72px", lineHeight: "1.13" }}>
              Configure Your Experience
            </h1>
            <p className="text-body text-driftwood">
              Set up your preferences and hardware before joining the queue.
            </p>
          </div>

          {/* Hardware Check */}
          <Card variant="warm" padding="lg" className="mb-6">
            <CardHeader>
              <CardTitle className="text-subheading">Hardware Check</CardTitle>
              <CardDescription>
                Verify your camera and microphone are working before matching.
              </CardDescription>
            </CardHeader>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${mediaPermission === "granted" ? "bg-green-500" : mediaPermission === "denied" ? "bg-red-500" : "bg-driftwood"}`} />
                <span className="text-[14px] text-driftwood">
                  {mediaPermission === "granted" ? "Camera & microphone ready" :
                   mediaPermission === "denied" ? "Permission denied" :
                   "Not checked yet"}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={checkMediaPermissions}
                disabled={isCheckingMedia}
              >
                {isCheckingMedia ? "Checking..." : "Check Hardware"}
              </Button>
            </div>
          </Card>

          {/* Language Selection */}
          <Card variant="warm" padding="lg" className="mb-6">
            <CardHeader>
              <CardTitle className="text-subheading">Select Your Languages</CardTitle>
              <CardDescription>
                Choose up to 5 languages you're comfortable working with.
              </CardDescription>
            </CardHeader>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    disabled={!selectedLanguages.includes(lang) && selectedLanguages.length >= 5}
                    className={`px-3 py-1.5 rounded-tags text-[14px] font-medium transition-all ${
                      selectedLanguages.includes(lang)
                        ? "bg-midnight-ink text-parchment-white"
                        : "bg-white border border-ash-border text-driftwood hover:bg-warm-sand"
                    } ${
                      !selectedLanguages.includes(lang) && selectedLanguages.length >= 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <p className="text-caption text-fog mt-2">
                {selectedLanguages.length}/5 selected
              </p>
            </div>
          </Card>

          {/* Vibe Selection */}
          <Card variant="warm" padding="lg" className="mb-8">
            <CardHeader>
              <CardTitle className="text-subheading">What brings you here?</CardTitle>
              <CardDescription>
                Select how you'd like to collaborate with peers.
              </CardDescription>
            </CardHeader>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VIBES.map(vibe => (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`text-left p-4 rounded-cards border transition-all ${
                    selectedVibe === vibe.id
                      ? "bg-midnight-ink border-midnight-ink text-parchment-white"
                      : "bg-white border-ash-border text-driftwood hover:bg-warm-sand"
                  }`}
                >
                  <div className="text-subheading font-medium mb-1">{vibe.label}</div>
                  <div className="text-[13px] opacity-80">{vibe.description}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              disabled={!canContinue}
              className="min-w-[200px]"
            >
              Join Queue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
