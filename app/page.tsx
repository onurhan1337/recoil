"use client";

import DocumentationSection from "@/components/documentation-section";
import FAQSection from "@/components/faq-section";
import PricingSection from "@/components/pricing-section";
import CTASection from "@/components/cta-section";
import FooterSection from "@/components/footer-section";
import {
  Navbar,
  HeroSection,
  InteractiveChatDemo,
  FeatureCardsSection,
  UseCasesSection,
  AIChatPreviewSection,
  BentoGridSection,
} from "@/components/landing-page";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen relative bg-[#F0EFEA] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          <div className="w-px h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="w-px h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <Navbar />

            <HeroSection />

            <InteractiveChatDemo />

            <FeatureCardsSection />

            <UseCasesSection />

            <AIChatPreviewSection />

            <BentoGridSection />

            <DocumentationSection />

            <div id="pricing" className="w-full">
              <PricingSection />
            </div>

            <div id="faq">
              <FAQSection />
            </div>

            <CTASection />

            <FooterSection />
          </div>
        </div>
      </div>
    </div>
  );
}
