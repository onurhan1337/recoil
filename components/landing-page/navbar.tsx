"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { smoothScrollTo } from "./utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      smoothScrollTo(section);
    }, 150);
  };

  return (
    <div
      className={`w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0 transition-all duration-300 ${
        scrolled ? "backdrop-blur-md bg-[#F0EFEA]/80" : ""
      }`}
    >
      <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

      <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F0EFEA] backdrop-blur-sm border border-[rgba(55,50,47,0.08)] shadow-sm overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="Recoil"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 object-contain"
            />
          </Link>
          <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 hidden sm:flex items-center flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
            <Link
              href="#features"
              className="flex justify-start items-center group"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("features");
              }}
            >
              <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] group-hover:text-[rgba(49,45,43,1)] text-xs md:text-[13px] font-medium leading-[14px] font-sans transition-colors duration-200">
                Features
              </div>
            </Link>
            <Link
              href="#pricing"
              className="flex justify-start items-center group"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("pricing");
              }}
            >
              <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] group-hover:text-[rgba(49,45,43,1)] text-xs md:text-[13px] font-medium leading-[14px] font-sans transition-colors duration-200">
                Pricing
              </div>
            </Link>
            <Link
              href="#faq"
              className="flex justify-start items-center group"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("faq");
              }}
            >
              <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] group-hover:text-[rgba(49,45,43,1)] text-xs md:text-[13px] font-medium leading-[14px] font-sans transition-colors duration-200">
                FAQ
              </div>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden px-3 py-1.5 bg-white hover:bg-muted/50 border border-[rgba(55,50,47,0.12)] hover:border-[rgba(55,50,47,0.18)] shadow-sm hover:shadow-md rounded-full flex items-center justify-center transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-[#37322F]" />
          </button>
          <Link
            href="/login"
            className="hidden sm:flex px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 bg-white hover:bg-muted/50 border border-[rgba(55,50,47,0.12)] hover:border-[rgba(55,50,47,0.18)] shadow-sm hover:shadow-md rounded-full justify-center items-center transition-all duration-200"
          >
            <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
              Log in
            </div>
          </Link>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-[280px] sm:w-[320px] bg-[#F0EFEA] border-l border-[rgba(55,50,47,0.12)] p-0 [&>button]:hidden"
        >
          <div className="h-full flex flex-col">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-[rgba(55,50,47,0.06)]">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-[#37322F] font-lora font-semibold text-lg">
                  Menu
                </SheetTitle>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[rgba(55,50,47,0.08)] active:bg-[rgba(55,50,47,0.12)] transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-[#37322F]" />
                </button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleNavClick("features")}
                  className="px-4 py-3 rounded-xl hover:bg-[rgba(55,50,47,0.08)] active:bg-[rgba(55,50,47,0.12)] transition-colors duration-200 text-left"
                >
                  <div className="text-[rgba(49,45,43,0.80)] text-sm font-medium leading-5 font-sans">
                    Features
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("pricing")}
                  className="px-4 py-3 rounded-xl hover:bg-[rgba(55,50,47,0.08)] active:bg-[rgba(55,50,47,0.12)] transition-colors duration-200 text-left"
                >
                  <div className="text-[rgba(49,45,43,0.80)] text-sm font-medium leading-5 font-sans">
                    Pricing
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("faq")}
                  className="px-4 py-3 rounded-xl hover:bg-[rgba(55,50,47,0.08)] active:bg-[rgba(55,50,47,0.12)] transition-colors duration-200 text-left"
                >
                  <div className="text-[rgba(49,45,43,0.80)] text-sm font-medium leading-5 font-sans">
                    FAQ
                  </div>
                </button>
              </div>
            </div>
            <div className="px-6 pb-6 pt-4 border-t border-[rgba(55,50,47,0.06)]">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-3 bg-white hover:bg-muted/50 border border-[rgba(55,50,47,0.12)] hover:border-[rgba(55,50,47,0.18)] shadow-sm hover:shadow-md rounded-full flex justify-center items-center transition-all duration-200"
              >
                <div className="text-[#37322F] text-sm font-medium leading-5 font-sans">
                  Log in
                </div>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
