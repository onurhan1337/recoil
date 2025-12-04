"use client";

import { Badge } from "./badge";
import { DecorativePattern } from "./decorative-pattern";
import { SearchPreview } from "@/components/marketing/search-preview";
import { CanvasGraphPreview } from "@/components/marketing/canvas-graph-preview";
import { CollectionsPreview } from "@/components/marketing/collections-preview";
import { JournalPreview } from "@/components/marketing/journal-preview";

const features = [
  {
    title: "Semantic Search",
    description:
      "Find notes by meaning, not just keywords. Search understands what you're looking for, even if you use different words.",
    visual: "search",
  },
  {
    title: "Canvas Mind Map",
    description:
      "Infinite canvas to spatially organize your thoughts. Visual connections revealing relationships between ideas. Pro feature.",
    visual: "canvas-graph",
  },
  {
    title: "Collections & Templates",
    description:
      "Organize notes into collections. Create reusable templates for structured thinking. Unlimited templates on Pro.",
    visual: "collections",
  },
  {
    title: "Journal",
    description:
      "Daily journal entries with analytics. Track your thoughts over time. Promote entries to notes when ready.",
    visual: "journal",
  },
];

export function BentoGridSection() {
  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
          <Badge
            icon={
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="4"
                  height="4"
                  stroke="#37322F"
                  strokeWidth="1"
                  fill="none"
                />
                <rect
                  x="7"
                  y="1"
                  width="4"
                  height="4"
                  stroke="#37322F"
                  strokeWidth="1"
                  fill="none"
                />
                <rect
                  x="1"
                  y="7"
                  width="4"
                  height="4"
                  stroke="#37322F"
                  strokeWidth="1"
                  fill="none"
                />
                <rect
                  x="7"
                  y="7"
                  width="4"
                  height="4"
                  stroke="#37322F"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            }
            text="Features"
          />
          <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-lora font-semibold leading-tight md:leading-[60px] tracking-tight">
            Everything you need for knowledge management
          </div>
          <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Organize with collections and templates. Track thoughts in
            your journal. Visualize connections on an infinite canvas.
            Everything you need to build your knowledge base.
          </div>
        </div>
      </div>

      <div className="self-stretch flex justify-center items-start">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <DecorativePattern length={200} />
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-border">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 border-b ${
                i % 2 === 0 ? "border-r-0 md:border-r" : ""
              } border-border`}
            >
              <div className="w-full h-[450px]">
                {feature.visual === "search" && <SearchPreview />}
                {feature.visual === "canvas-graph" && (
                  <CanvasGraphPreview />
                )}
                {feature.visual === "collections" && (
                  <CollectionsPreview />
                )}
                {feature.visual === "journal" && <JournalPreview />}
              </div>
            </div>
          ))}
        </div>

        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <DecorativePattern length={200} />
        </div>
      </div>
    </div>
  );
}

