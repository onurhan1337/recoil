"use client";

import { FeatureCard } from "./feature-card";
import { DecorativePattern } from "./decorative-pattern";

export function FeatureCardsSection() {
  return (
    <div className="self-stretch border-t border-b border-[#E0DEDB] flex justify-center items-start">
      <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
        <DecorativePattern length={50} />
      </div>

      <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
        <FeatureCard
          title="Semantic Search"
          description="Find notes by meaning. Not keywords."
          isActive={false}
          progress={0}
          onClick={() => {}}
        />
        <FeatureCard
          title="AI Chat"
          description="Ask questions. Get answers from your notes."
          isActive={false}
          progress={0}
          onClick={() => {}}
        />
        <FeatureCard
          title="Knowledge Graph"
          description="See connections. AI finds them. You create them."
          isActive={false}
          progress={0}
          onClick={() => {}}
        />
      </div>

      <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
        <DecorativePattern length={50} />
      </div>
    </div>
  );
}
