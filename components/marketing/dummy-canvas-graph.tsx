"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";

export function DummyCanvasGraph() {
  return (
    <div className="w-full h-full relative bg-background overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "scale(0.7)" }}>
        <div className="relative w-full h-full">
          <div className="absolute top-4 left-4 relative bg-white dark:bg-zinc-900/95 border-2 border-stone-200 dark:border-zinc-800 rounded-xl px-[18px] py-3.5 min-w-[200px] max-w-[280px]">
            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-stone-600/30 rounded-r-sm"></div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug font-lora">AI Concepts</h3>
              <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                <MarkdownRenderer content="Machine learning and neural networks..." compact />
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-medium">work</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-12 left-32 relative bg-white dark:bg-zinc-900/95 border-2 border-stone-200 dark:border-zinc-800 rounded-xl px-[18px] py-3.5 min-w-[200px] max-w-[280px]">
            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-stone-600/30 rounded-r-sm"></div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug font-lora">Neural Networks</h3>
              <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                <MarkdownRenderer content="Deep learning architectures..." compact />
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-medium">research</span>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-8 relative bg-white dark:bg-zinc-900/95 border-2 border-stone-200 dark:border-zinc-800 rounded-xl px-[18px] py-3.5 min-w-[200px] max-w-[280px]">
            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-stone-600/30 rounded-r-sm"></div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug font-lora">Data Processing</h3>
              <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                <MarkdownRenderer content="Vector embeddings..." compact />
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-medium">work</span>
              </div>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: "400px", height: "300px" }}>
            <line x1="100" y1="30" x2="140" y2="50" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
            <line x1="180" y1="50" x2="100" y2="70" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
          </svg>

          <div className="absolute bottom-4 right-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g className="text-foreground">
                  <line x1="100" y1="30" x2="50" y2="80" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
                  <line x1="100" y1="30" x2="150" y2="80" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
                  <line x1="50" y1="80" x2="100" y2="130" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
                  <line x1="150" y1="80" x2="100" y2="130" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
                  <line x1="100" y1="130" x2="100" y2="170" stroke="currentColor" className="text-border/40" strokeWidth="1.5" />
                  <circle cx="100" cy="30" r="8" fill="currentColor" className="text-primary/60" />
                  <circle cx="50" cy="80" r="6" fill="currentColor" className="text-primary/60" />
                  <circle cx="150" cy="80" r="6" fill="currentColor" className="text-primary/60" />
                  <circle cx="100" cy="130" r="6" fill="currentColor" className="text-primary/60" />
                  <circle cx="100" cy="170" r="8" fill="currentColor" className="text-primary/60" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

