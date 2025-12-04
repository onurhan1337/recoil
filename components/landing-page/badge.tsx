"use client";

import type React from "react";

interface BadgeProps {
  icon: React.ReactNode;
  text: string;
}

export function Badge({ icon, text }: BadgeProps) {
  return (
    <div className="px-[14px] py-[6px] bg-card border border-border shadow-sm overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px]">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  );
}

