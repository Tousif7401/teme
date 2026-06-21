"use client";

import React, { useState } from "react";

const faqItems = [
  {
    commandTech: 'teme query --topic "Is it just creeps like Omegle?"',
    commandNontech: "Q: Is this safe? Or is it like Omegle?",
    output:
      "Negative. Access requires strict Google or GitHub verification. Bots and bad actors are instantly IP-banned. The community polices itself.",
  },
  {
    commandTech: 'teme query --topic "Do I have to use my camera?"',
    commandNontech: "Q: Do I have to show my face?",
    output:
      "No. You can initialize the connection strictly in Text/Chat mode. Video is entirely opt-in.",
  },
  {
    commandTech: 'teme query --topic "Is this free?"',
    commandNontech: "Q: Does this cost money?",
    output:
      "Core routing is 100% free. Servers cost money, so a 'Pro' tier for advanced filtering might launch later.",
  },
];

export function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-header">MANUAL / FAQ</h2>

        {faqItems.map((item, index) => (
          <div key={index} className="faq-item">
            <div
              className="faq-cmd"
              onClick={() => toggleExpand(index)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <span className="tech-only">{item.commandTech}</span>
              <span className="nontech-only">{item.commandNontech}</span>
              <span style={{ marginLeft: "auto", fontSize: "18px" }}>
                {expandedIndex === index ? "−" : "+"}
              </span>
            </div>
            {expandedIndex === index && (
              <div className="faq-output">{item.output}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
