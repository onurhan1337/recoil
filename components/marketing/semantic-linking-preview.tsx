"use client";

import { useState, useEffect } from "react";
import { Network, Sparkles, Link2 } from "lucide-react";

export function SemanticLinkingPreview() {
  const [showNodes, setShowNodes] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowNodes(true), 300);
    
    const interval = setInterval(() => {
      const links = ["semantic-1", "manual-1", "semantic-2", "manual-2", null];
      const currentIndex = links.indexOf(highlighted);
      const nextIndex = (currentIndex + 1) % links.length;
      setHighlighted(links[nextIndex]);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [highlighted]);

  const nodes = [
    {
      id: "1",
      title: "AI Concepts",
      x: 20,
      y: 25,
      category: "work",
    },
    {
      id: "2",
      title: "Neural Networks",
      x: 70,
      y: 25,
      category: "research",
    },
    {
      id: "3",
      title: "Vector Embeddings",
      x: 20,
      y: 70,
      category: "work",
    },
    {
      id: "4",
      title: "Semantic Search",
      x: 70,
      y: 70,
      category: "research",
    },
  ];

  const connections = [
    {
      from: "1",
      to: "2",
      type: "manual",
      id: "manual-1",
    },
    {
      from: "1",
      to: "3",
      type: "semantic",
      id: "semantic-1",
    },
    {
      from: "2",
      to: "4",
      type: "semantic",
      id: "semantic-2",
    },
    {
      from: "3",
      to: "4",
      type: "manual",
      id: "manual-2",
    },
  ];

  return (
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Network className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Knowledge Graph</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Discover hidden connections between your notes. AI finds relationships automatically, or create your own links.
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
        
        {/* Legend - subtle and integrated */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-3 text-[9px] bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/50 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-foreground/40 border-dashed border-t-2 border-foreground/40" />
            <span className="text-muted-foreground">AI discovered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-foreground" />
            <span className="text-muted-foreground">Your links</span>
          </div>
        </div>
        
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const isHighlighted = highlighted === conn.id;
            const isSemantic = conn.type === "semantic";

            return (
              <line
                key={conn.id}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={
                  isHighlighted
                    ? "rgba(55, 50, 47, 0.6)"
                    : isSemantic
                    ? "rgba(55, 50, 47, 0.15)"
                    : "rgba(55, 50, 47, 0.2)"
                }
                strokeWidth={isHighlighted ? 2.5 : isSemantic ? 1 : 1.5}
                strokeDasharray={isSemantic ? "3 3" : "0"}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Note nodes */}
        {showNodes && (
          <div className="absolute inset-0 p-4" style={{ zIndex: 2 }}>
            {nodes.map((node, index) => {
              const connectedLinks = connections.filter(
                (c) => c.from === node.id || c.to === node.id
              );
              const hasHighlightedLink = connectedLinks.some(
                (c) => c.id === highlighted
              );

              return (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 animate-scale-in ${
                    hasHighlightedLink ? "scale-110 z-10" : "scale-100"
                  }`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className={`bg-white border rounded-lg px-3 py-2.5 shadow-sm transition-all duration-500 ${
                    hasHighlightedLink 
                      ? "border-stone-300 shadow-md border-2" 
                      : "border-stone-200"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Network className={`h-3 w-3 transition-colors ${
                        hasHighlightedLink ? "text-foreground" : "text-muted-foreground"
                      }`} />
                      <h3 className="text-xs font-semibold text-zinc-900 leading-tight font-lora">
                        {node.title}
                      </h3>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                      {node.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
