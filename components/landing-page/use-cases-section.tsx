"use client";

import { Badge } from "./badge";
import { DecorativePattern } from "./decorative-pattern";

const useCases = [
  {
    title: "Builders",
    description:
      "Document your projects and ideas. Semantic search helps you find related concepts. Build a knowledge graph of your work.",
  },
  {
    title: "Entrepreneurs",
    description:
      "Organize business ideas, market research, and strategies. AI chat helps you find insights across all your notes.",
  },
  {
    title: "Writers",
    description:
      "Organize ideas, quotes, and references. AI chat helps you find what you wrote about any topic.",
  },
  {
    title: "Thinkers",
    description:
      "Capture thoughts as they come. Collections and templates help structure your thinking.",
  },
];

export function UseCasesSection() {
  return (
    <div
      id="features"
      className="w-full border-b border-border flex flex-col justify-center items-center"
    >
      <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 border-b border-border flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4">
          <Badge
            icon={
              <svg
                width="12"
                height="10"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="3"
                  width="4"
                  height="6"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
                <rect
                  x="7"
                  y="1"
                  width="4"
                  height="8"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
                <rect
                  x="2"
                  y="4"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="3.5"
                  y="4"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="2"
                  y="5.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="3.5"
                  y="5.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="8"
                  y="2"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="9.5"
                  y="2"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="8"
                  y="3.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="9.5"
                  y="3.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="8"
                  y="5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="9.5"
                  y="5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
              </svg>
            }
            text="Perfect for"
          />
          <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-lora font-semibold leading-tight md:leading-[60px] tracking-tight">
            Your thoughts, beautifully organized
          </div>
          <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Whether you're researching, writing, learning, or
            planning, Recoil helps you capture and connect your ideas.
          </div>
        </div>
      </div>

      <div className="self-stretch flex justify-center items-start">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <DecorativePattern length={200} />
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-border">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className={`p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-3 sm:gap-4 border-b ${
                i % 2 === 0 ? "border-r-0 md:border-r" : ""
              } border-border`}
            >
              <h3 className="text-foreground text-lg sm:text-xl font-lora font-semibold leading-tight">
                {useCase.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                {useCase.description}
              </p>
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

