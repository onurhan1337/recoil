"use client";

import { Coins } from "lucide-react";

interface CreditDisplayProps {
  credits: number;
}

export function CreditDisplay({ credits }: CreditDisplayProps) {
  const creditsColor =
    credits > 50 ? "text-green-500" :
    credits > 20 ? "text-yellow-500" :
    "text-red-500";

  return (
    <div className="flex items-center gap-2 text-sm">
      <Coins className={`h-4 w-4 ${creditsColor}`} />
      <span className={creditsColor}>
        {credits} credits
      </span>
    </div>
  );
}
