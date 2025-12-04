"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { VectorEmbeddingsPreview } from "./marketing/vector-embeddings-preview";
import { AIChatContextPreview } from "./marketing/ai-chat-context-preview";
import { SemanticLinkingPreview } from "./marketing/semantic-linking-preview";

// Badge component for consistency
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-card border border-border shadow-sm overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px]">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center text-foreground">
        {icon}
      </div>
      <div className="text-center flex justify-center flex-col text-foreground text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  );
}

export default function DocumentationSection() {
  const [activeCard, setActiveCard] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const cards = [
    {
      title: "Vector Embeddings",
      description:
        "Find notes by meaning, not just keywords.\nSearch understands what you're looking for, even if you use different words.",
      image: "/modern-dashboard-interface-with-data-visualization.jpg",
    },
    {
      title: "AI Chat with Context",
      description:
        "Ask questions about your notes and get instant answers.\nResponses include citations, powered by your knowledge base.",
      image: "/analytics-dashboard.png",
    },
    {
      title: "Knowledge Graph",
      description:
        "Discover hidden connections between your notes.\nAI finds relationships automatically, or create your own links to build your knowledge network.",
      image: "/team-collaboration-interface-with-shared-workspace.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
      setAnimationKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [cards.length]);

  const handleCardClick = (index: number) => {
    setActiveCard(index);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="w-full border-b border-border flex flex-col justify-center items-center hidden md:flex">
      {/* Header Section */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-border flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4">
          <Badge
            icon={
              <div className="w-[10.50px] h-[10.50px] outline outline-[1.17px] outline-current outline-offset-[-0.58px] rounded-full"></div>
            }
            text="Platform Features"
          />
          <div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-lora font-semibold leading-tight md:leading-[60px] tracking-tight">
            Search by meaning,<br />not keywords
          </div>
          <div className="self-stretch text-center text-muted-foreground text-base font-normal leading-7 font-sans">
            Search by meaning, not just keywords. AI chat understands your notes
            and helps you discover insights.
            <br />
            Collections, templates, journal, and analytics complete your
            knowledge workflow.
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="self-stretch px-4 md:px-9 overflow-hidden flex justify-start items-center">
        <div className="flex-1 py-8 md:py-11 flex flex-col md:flex-row justify-start items-center gap-6 md:gap-12">
          {/* Left Column - Feature Cards */}
          <div className="w-full md:w-auto md:max-w-[400px] flex flex-col justify-center items-center gap-4 order-2 md:order-1">
            {cards.map((card, index) => {
              const isActive = index === activeCard;

              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`w-full overflow-hidden flex flex-col justify-start items-start transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-card border border-border"
                      : "border border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-full h-0.5 bg-muted overflow-hidden ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div
                      key={animationKey}
                      className="h-0.5 bg-primary animate-[progressBar_5s_linear_forwards] will-change-transform"
                    />
                  </div>
                  <div className="px-6 py-5 w-full flex flex-col gap-2">
                    <div className="self-stretch flex justify-center flex-col text-foreground text-sm font-semibold leading-6 font-sans">
                      {card.title}
                    </div>
                    <div className="self-stretch text-muted-foreground text-[13px] font-normal leading-[22px] font-sans whitespace-pre-line">
                      {card.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Technical Diagrams */}
          <div className="w-full md:w-auto rounded-lg flex flex-col justify-center items-center gap-2 order-1 md:order-2 md:px-0 px-[00]">
            <div className="w-full md:w-[580px] h-[250px] md:h-[420px] overflow-hidden rounded-lg">
              <div className="w-full h-full relative">
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeCard === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <VectorEmbeddingsPreview />
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeCard === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <AIChatContextPreview />
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeCard === 2 ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <SemanticLinkingPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progressBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
