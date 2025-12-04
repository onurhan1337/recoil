"use client";

interface FeatureCardProps {
  title: string;
  description: string;
  isActive: boolean;
  progress: number;
  onClick: () => void;
}

export function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: FeatureCardProps) {
  return (
    <div className="w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 relative border-b md:border-b-0 last:border-b-0 border-l-0 border-r-0 md:border border-[#E0DEDB]/80">
      <div className="self-stretch flex justify-center flex-col text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans text-[#49423D]/80">
        {title}
      </div>
      <div className="self-stretch text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans text-[#605A57]/70">
        {description}
      </div>
    </div>
  );
}

