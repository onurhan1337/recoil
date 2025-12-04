"use client";

export function CanvasGraphPreview() {
  return (
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Canvas Mind Map</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Infinite canvas to spatially organize your thoughts. Visual connections revealing relationships between ideas.
        </p>
      </div>
      
      <div className="flex-1 relative bg-white overflow-hidden">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(55, 50, 47, 0.08) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Simple connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {/* Manual link (solid) */}
          <line
            x1="20%"
            y1="30%"
            x2="60%"
            y2="32%"
            stroke="rgba(55, 50, 47, 0.2)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Semantic link (dashed) */}
          <line
            x1="20%"
            y1="30%"
            x2="20%"
            y2="65%"
            stroke="rgba(55, 50, 47, 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
          <line
            x1="60%"
            y1="32%"
            x2="60%"
            y2="68%"
            stroke="rgba(55, 50, 47, 0.2)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="20%"
            y1="65%"
            x2="60%"
            y2="68%"
            stroke="rgba(55, 50, 47, 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
        </svg>

        {/* Note nodes - simplified */}
        <div className="absolute inset-0 p-4" style={{ zIndex: 2 }}>
          <div className="absolute left-[8%] top-[20%] w-[36%] max-w-[160px]">
            <div className="bg-white border border-stone-200 rounded-lg px-3 py-2.5 shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-900 mb-1 leading-tight font-lora">
                AI Concepts
              </h3>
              <p className="text-[10px] text-zinc-600 leading-relaxed line-clamp-2 mb-1.5">
                Machine learning and neural networks form the foundation of modern AI systems.
              </p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                work
              </span>
            </div>
          </div>

          <div className="absolute left-[56%] top-[22%] w-[36%] max-w-[160px]">
            <div className="bg-white border border-stone-200 rounded-lg px-3 py-2.5 shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-900 mb-1 leading-tight font-lora">
                Neural Networks
              </h3>
              <p className="text-[10px] text-zinc-600 leading-relaxed line-clamp-2 mb-1.5">
                Deep learning architectures that process information through interconnected layers.
              </p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                research
              </span>
            </div>
          </div>

          <div className="absolute left-[8%] top-[55%] w-[36%] max-w-[160px]">
            <div className="bg-white border border-stone-200 rounded-lg px-3 py-2.5 shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-900 mb-1 leading-tight font-lora">
                Vector Embeddings
              </h3>
              <p className="text-[10px] text-zinc-600 leading-relaxed line-clamp-2 mb-1.5">
                Transform text into numerical representations that capture semantic meaning.
              </p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                work
              </span>
            </div>
          </div>

          <div className="absolute left-[56%] top-[58%] w-[36%] max-w-[160px]">
            <div className="bg-white border border-stone-200 rounded-lg px-3 py-2.5 shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-900 mb-1 leading-tight font-lora">
                Semantic Search
              </h3>
              <p className="text-[10px] text-zinc-600 leading-relaxed line-clamp-2 mb-1.5">
                Find information by meaning using cosine similarity on vector embeddings.
              </p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                research
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

