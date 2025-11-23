"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const KnowledgeGraph = dynamic(
  () => import("./knowledge-graph").then((mod) => ({ default: mod.KnowledgeGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);
