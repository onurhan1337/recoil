"use client";

import { useState } from "react";

export default function PricingSection() {
  const pricing = {
    free: {
      credits: 500,
      noteCost: 2,
      chatCost: 5,
      embeddingCost: 1,
    },
    pro: {
      credits: 10000,
      noteCost: 1,
      chatCost: 3,
      embeddingCost: 0,
    },
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      {/* Header Section */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-border flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4">
          {/* Pricing Badge */}
          <div className="px-[14px] py-[6px] bg-card border border-border shadow-sm overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px]">
            <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center text-foreground">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center flex justify-center flex-col text-foreground text-xs font-medium leading-3 font-sans">
              Plans & Pricing
            </div>
          </div>

          {/* Title */}
          <div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-lora font-semibold leading-tight md:leading-[60px] tracking-tight">
            Simple pricing
          </div>

          {/* Description */}
          <div className="self-stretch text-center text-muted-foreground text-base font-normal leading-7 font-sans">
            Start free with 500 credits/month. Upgrade to Pro for 10,000
            credits/month.
            <br />
            All plans include semantic search, AI chat, collections, and
            markdown support.
          </div>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="w-full border-b border-t border-border">
        <div className="w-full flex justify-center items-start max-w-[1060px] mx-auto">
          {/* Left Decorative Pattern */}
          <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                ></div>
              ))}
            </div>
          </div>

          {/* Pricing Cards Container */}
          <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-0 py-12 md:py-0">
            {/* Starter Plan */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 border-l-0 md:border-l border-r md:border-r-0 border-t border-b border-border overflow-hidden flex flex-col justify-between items-start bg-card">
              <div className="self-stretch flex flex-col justify-start items-start gap-12">
                {/* Plan Header */}
                <div className="self-stretch flex flex-col justify-start items-center gap-9">
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-foreground text-lg font-medium leading-7 font-sans">
                      Free
                    </div>
                    <div className="w-full max-w-[242px] text-muted-foreground text-sm font-normal leading-5 font-sans">
                      Perfect for trying semantic search and AI chat. All core
                      features included.
                    </div>
                  </div>

                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="flex flex-col justify-start items-start gap-1">
                      <div className="flex items-baseline gap-2">
                        <div className="relative h-[60px] flex items-center text-foreground text-5xl font-lora font-medium leading-[60px]">
                          $0
                        </div>
                      </div>
                      <div className="text-muted-foreground text-sm font-medium font-sans">
                        {pricing.free.credits.toLocaleString("en-US")} credits per month
                      </div>
                    </div>
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Semantic search",
                  "AI chat with citations",
                  "Unlimited notes",
                  "Collections",
                  "Markdown support",
                  "Knowledge graph view",
                  "Journal",
                  "Note: 2 credits, Chat: 5 credits, Embedding: 1 credit/chunk",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="self-stretch flex justify-start items-center gap-[13px]"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center text-muted-foreground">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-muted-foreground text-[12.5px] font-normal leading-5 font-sans">
                      {feature}
                    </div>
                  </div>
                ))}
                </div>
              </div>

              <a
                href="/signup"
                className="self-stretch mt-6 px-4 py-[10px] relative bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors overflow-hidden rounded-[99px] flex justify-center items-center"
              >
                <div className="max-w-[108px] flex justify-center flex-col text-[13px] font-medium leading-5 font-sans">
                  Start for free
                </div>
              </a>
            </div>

            {/* Professional Plan (Featured) */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 border-l md:border-l-0 border-r-0 md:border-r border-t border-b border-border overflow-hidden flex flex-col justify-between items-start bg-primary text-primary-foreground">
              <div className="self-stretch flex flex-col justify-start items-start gap-12">
                {/* Plan Header */}
                <div className="self-stretch flex flex-col justify-start items-center gap-9">
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-primary-foreground text-lg font-medium leading-7 font-sans">
                      Pro
                    </div>
                    <div className="w-full max-w-[242px] text-primary-foreground/80 text-sm font-normal leading-5 font-sans">
                      Everything in Free, plus unlimited templates, reminders,
                      analytics, canvas, and note linking.
                    </div>
                  </div>

                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="flex flex-col justify-start items-start gap-1">
                      <div className="flex items-baseline gap-2">
                        <div className="relative h-[60px] flex items-center text-primary-foreground text-5xl font-lora font-medium leading-[60px]">
                          $4.99
                        </div>
                      </div>
                      <div className="text-primary-foreground/70 text-sm font-medium font-sans">
                        {pricing.pro.credits.toLocaleString("en-US")} credits per month
                      </div>
                    </div>
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Everything in Free",
                  "Unlimited templates",
                  "Email reminders",
                  "Analytics dashboard",
                  "Note linking (semantic & manual)",
                  "Canvas / Mind Map",
                  "Embeddings free",
                  "Note: 1 credit, Chat: 3 credits",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="self-stretch flex justify-start items-center gap-[13px]"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center text-primary-foreground">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-primary-foreground text-[12.5px] font-normal leading-5 font-sans">
                      {feature}
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="/signup"
                className="self-stretch mt-6 px-4 py-[10px] relative bg-card text-foreground shadow-sm hover:bg-card/90 transition-colors overflow-hidden rounded-[99px] flex justify-center items-center"
              >
                <div className="max-w-[108px] flex justify-center flex-col text-[13px] font-medium leading-5 font-sans">
                  Get started
                </div>
              </a>
            </div>
          </div>

          {/* Right Decorative Pattern */}
          <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Separator */}
      <div className="w-full border-b border-border"></div>
    </div>
  );
}
