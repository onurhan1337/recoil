"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is Recoil?",
    answer:
      "A personal knowledge management app. Capture notes. Find them by meaning, not keywords. Ask questions. Get answers from your notes.",
  },
  {
    question: "How does semantic search work?",
    answer:
      "It understands meaning. Search for ideas, not just words. Find connections you didn't know existed.",
  },
  {
    question: "What can I do with the free plan?",
    answer:
      "500 credits per month. Unlimited notes. Semantic search. AI chat with citations. Collections. Markdown support. Everything you need to start.",
  },
  {
    question: "What's included in Pro?",
    answer:
      "10,000 credits per month. Free embeddings. Unlimited templates. Email reminders. Analytics. Canvas mind map. Note linking. Everything.",
  },
  {
    question: "How do credits work?",
    answer:
      "Free: 2 credits per note, 5 per chat, 1 per embedding. Pro: 1 credit per note, 3 per chat, embeddings free. Simple.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your notes are yours. Encrypted. Secure. We never share your data.",
  },
]

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full flex justify-center items-start">
      <div className="flex-1 px-4 md:px-12 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12">
        {/* Left Column - Header */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5">
          <div className="w-full flex flex-col justify-center text-foreground font-lora font-semibold leading-tight md:leading-[44px] text-4xl tracking-tight">
            Questions
          </div>
          <div className="w-full text-muted-foreground text-base font-normal leading-7 font-sans">
            Simple answers to common questions.
          </div>
        </div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)

              return (
                <div key={index} className="w-full border-b border-border overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left hover:bg-muted/30 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-foreground text-base font-medium leading-6 font-sans">
                      {item.question}
                    </div>
                    <div className="flex justify-center items-center">
                      <ChevronDownIcon
                        className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-[18px] text-muted-foreground text-sm font-normal leading-6 font-sans">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
