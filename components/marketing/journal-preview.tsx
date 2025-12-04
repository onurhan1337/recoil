"use client";

export function JournalPreview() {
  return (
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Journal</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Daily journal entries with analytics. Track your thoughts over time.
        </p>
      </div>
      
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between pb-1.5">
          <div className="text-xs font-semibold text-foreground font-lora">Today</div>
          <div className="text-[10px] text-muted-foreground">Jan 15</div>
        </div>
        <div className="space-y-2">
          <div className="group relative rounded-lg border border-border/40 bg-card/80 p-3 space-y-2 transition-all duration-200 hover:border-border/60 hover:bg-card hover:shadow-sm">
            <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-lora text-foreground/90 tracking-wide line-clamp-3">
              Today I learned about vector embeddings and how they enable semantic search. The concept of transforming text into numerical representations that capture meaning is fascinating...
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="tracking-wide font-medium">Morning</span>
              </div>
            </div>
          </div>
          <div className="group relative rounded-lg border border-border/40 bg-card/80 p-3 space-y-2 transition-all duration-200 hover:border-border/60 hover:bg-card hover:shadow-sm">
            <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-lora text-foreground/90 tracking-wide line-clamp-3">
              Reflecting on the project progress and next steps. The team is making great progress on the knowledge graph visualization...
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="tracking-wide font-medium">Evening</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

