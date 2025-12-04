"use client";

export function DummyCollections() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3 overflow-hidden">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="group relative flex flex-col overflow-hidden rounded-md border bg-card p-3 transition-all hover:bg-muted/50">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-500 dark:border-orange-400 shrink-0">
                <svg className="h-3 w-3 text-orange-700 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xs font-medium line-clamp-1 text-foreground">Work</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">12 notes</span>
          </div>
        </div>
        <div className="group relative flex flex-col overflow-hidden rounded-md border bg-card p-3 transition-all hover:bg-muted/50">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-500 dark:border-orange-400 shrink-0">
                <svg className="h-3 w-3 text-orange-700 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xs font-medium line-clamp-1 text-foreground">Research</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">8 notes</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card p-2.5 transition-all hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-500 dark:border-orange-400 shrink-0">
              <span className="text-xs">📝</span>
            </div>
            <span className="text-xs font-medium text-foreground">Meeting</span>
          </div>
        </div>
        <div className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card p-2.5 transition-all hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-500 dark:border-orange-400 shrink-0">
              <span className="text-xs">💡</span>
            </div>
            <span className="text-xs font-medium text-foreground">Ideas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

