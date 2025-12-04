"use client";

import { Badge } from "./badge";
import { AIChatPreview } from "@/components/marketing/ai-chat-preview";

export function AIChatPreviewSection() {
  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center py-12 sm:py-16 md:py-20">
      <div className="w-full max-w-6xl px-4 sm:px-6 md:px-8 flex flex-col gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge
            icon={
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z"
                  stroke="#37322F"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            }
            text="Main Feature"
          />
          <h2 className="text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-lora font-semibold leading-tight tracking-tight">
            AI Chat with Citations
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-normal leading-relaxed font-sans max-w-2xl">
            Ask questions about your notes and get instant answers
            with citations. AI understands your knowledge base and
            helps you find insights across all your notes.
          </p>
        </div>
        <AIChatPreview />
      </div>
    </div>
  );
}

