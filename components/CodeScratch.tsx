"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CodeBlock {
  id: string;
  content: string;
  language: string;
  sender: "you" | "peer";
  timestamp: Date;
}

export interface CodeScratchProps {
  codeBlocks: CodeBlock[];
  currentCode: string;
  onCodeChange: (code: string) => void;
  onSendCode: () => void;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  className?: string;
  readOnly?: boolean;
}

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
];

const CodeScratch = React.forwardRef<HTMLTextAreaElement, CodeScratchProps>(
  (
    {
      codeBlocks,
      currentCode,
      onCodeChange,
      onSendCode,
      currentLanguage = "javascript",
      onLanguageChange,
      className,
      readOnly = false,
    },
    ref
  ) => {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Close language dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (languageRef.current && !languageRef.current.contains(target)) {
          setIsLanguageOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getCurrentLanguage = () => {
      return LANGUAGES.find(l => l.id === currentLanguage)?.label || currentLanguage;
    };

    // Simple syntax highlighting placeholder (in production, use Monaco/CodeMirror)
    const highlightSyntax = (code: string) => {
      // This is a placeholder - in production, integrate Monaco Editor or CodeMirror
      return code;
    };

    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header */}
        <div className="px-4 py-2 border-b border-ash-border bg-white flex items-center justify-between">
          <span className="text-subheading font-medium text-midnight-ink">Code</span>

          {!readOnly && onLanguageChange && (
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-cards bg-warm-sand hover:bg-driftwood/20 transition-colors"
              >
                <span className="text-caption text-driftwood font-geist">{getCurrentLanguage()}</span>
                <svg className="w-3 h-3 text-driftwood" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-ash-border rounded-cards shadow-subtle-6 z-10 min-w-[150px]">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        onLanguageChange(lang.id);
                        setIsLanguageOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-caption hover:bg-warm-sand transition-colors",
                        currentLanguage === lang.id && "bg-warm-sand font-medium"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Blocks Display */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="flex flex-col gap-4">
            {codeBlocks.map(block => (
              <div
                key={block.id}
                className={cn(
                  "rounded-lg p-3 border",
                  block.sender === "you"
                    ? "bg-midnight-ink/5 border-midnight-ink/10"
                    : "bg-warm-sand/50 border-ash-border"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption text-driftwood font-geist">
                    {block.sender === "you" ? "you" : "peer_dev"} • {formatTime(block.timestamp)}
                  </span>
                  <span className="text-caption text-fog font-geist">{block.language}</span>
                </div>
                <pre className="font-geist text-[11px] text-midnight-ink whitespace-pre-wrap overflow-x-auto">
                  {block.content}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Code Input */}
        {!readOnly && (
          <div className="p-4 border-t border-ash-border bg-white">
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Paste or type code to share..."
                className="w-full px-3 py-2 rounded-inputs border border-ash-border text-[13px] font-geist focus:outline-none focus:ring-2 focus:ring-midnight-ink resize-none bg-warm-sand/30"
                rows={4}
                spellCheck={false}
              />
              <div className="flex justify-between items-center">
                <span className="text-caption text-fog">
                  {currentCode.split("\n").length} lines • {currentCode.length} chars
                </span>
                <button
                  onClick={onSendCode}
                  disabled={!currentCode.trim()}
                  className="px-4 py-2 bg-midnight-ink text-parchment-white rounded-buttons text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-driftwood"
                >
                  Share Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CodeScratch.displayName = "CodeScratch";

export { CodeScratch };
