"use client";

export default function CTASection() {
  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      {/* Content */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-12 border-t border-b border-border flex justify-center items-center gap-6 relative z-10">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full relative">
            {Array.from({ length: 300 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                style={{
                  top: `${i * 16 - 120}px`,
                  left: "-100%",
                  width: "300%",
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-lora font-semibold leading-tight md:leading-[56px] tracking-tight">
              Start with<br />500 free credits
            </div>
            <div className="self-stretch text-center text-muted-foreground text-base leading-7 font-sans font-medium">
              Start building your knowledge base today. Search by meaning, chat with AI,
              and discover connections between your ideas.
              <br />
              Upgrade to Pro for 10,000 credits and unlimited embeddings.
            </div>
          </div>
          <div className="w-full max-w-[497px] flex flex-col justify-center items-center gap-12">
            <div className="flex justify-start items-center gap-4">
              <a
                href="/signup"
                className="h-10 px-12 py-[6px] relative bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors overflow-hidden rounded-full flex justify-center items-center"
              >
                <div className="flex flex-col justify-center text-[13px] font-medium leading-5 font-sans">
                  Start for free
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
