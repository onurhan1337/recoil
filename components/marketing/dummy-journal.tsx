"use client";

export function DummyJournal() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-2.5 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-foreground font-lora">Today</div>
        <div className="text-[10px] text-muted-foreground">Jan 15</div>
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        <div className="group relative rounded-lg border border-border/35 bg-card p-4 space-y-3 transition-all duration-200 hover:border-border/50">
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap font-lora text-foreground/90 tracking-wide line-clamp-2">
            Today I learned about vector embeddings and how they enable semantic search...
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/10">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="tracking-wide">Morning</span>
            </div>
          </div>
        </div>
        <div className="group relative rounded-lg border border-border/35 bg-card p-4 space-y-3 transition-all duration-200 hover:border-border/50">
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap font-lora text-foreground/90 tracking-wide line-clamp-2">
            Reflecting on the project progress and next steps...
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/10">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="tracking-wide">Evening</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

