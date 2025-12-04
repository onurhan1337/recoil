"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-4 sm:px-6 md:px-8 lg:px-0 w-full">
      <div className="w-full max-w-3xl flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6">
        <h1 className="w-full max-w-2xl text-center text-foreground text-xl sm:text-2xl md:text-3xl lg:text-4xl font-lora font-semibold leading-[1.2] tracking-tight px-4 mx-auto">
          <span className="block">Personal knowledge management</span>
          <span className="block mt-0.5">with AI-powered semantic search</span>
        </h1>
        <p className="w-full max-w-xl text-center text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed font-sans font-normal px-4">
          Capture notes, find connections by meaning, and chat with AI that
          understands your knowledge base.
        </p>
      </div>

      <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
        <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
          <Link
            href="/signup"
            className="premium-cta-button group h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] border border-white/8 shadow-[0_2px_8px_rgba(0,0,0,0.2),0_1px_0_0_rgba(255,255,255,0.06)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset] hover:border-white/12 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.3)_inset,0_0_24px_rgba(255,255,255,0.08)] hover:bg-linear-to-r hover:from-[rgb(45,40,35)] hover:via-[rgb(55,50,47)] hover:to-[rgb(45,40,35)] active:scale-[0.98] overflow-hidden rounded-full flex justify-center items-center transition-all duration-300 ease-out"
          >
            <div
              className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: "150px 150px",
              }}
            />
            <div className="absolute inset-0 bg-linear-to-b from-white/12 via-transparent to-black/30 rounded-full pointer-events-none" />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-white/0 via-white/10 to-white/0 blur-2xl scale-150 pointer-events-none" />
            <div className="flex flex-col justify-center text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans relative z-10">
              Start for free
            </div>
          </Link>
        </div>
      </div>

      <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
        <img
          src="/mask-group-pattern.svg"
          alt=""
          className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
          style={{
            filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
          }}
        />
      </div>
    </div>
  );
}
