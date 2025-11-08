"use client";

import { Sparkles, TrendingUp, Link2, Brain, Lightbulb } from "lucide-react";

interface ProTip {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const PRO_TIPS: ProTip[] = [
  {
    icon: Brain,
    title: "Deep Analysis",
    description:
      "Ask me to analyze patterns, trends, or connections across your notes",
  },
  {
    icon: TrendingUp,
    title: "Thinking Patterns",
    description:
      "Discover your thinking patterns and how your ideas evolve over time",
  },
  {
    icon: Link2,
    title: "Find Connections",
    description:
      "I can identify relationships and connections between different notes",
  },
  {
    icon: Lightbulb,
    title: "Personalized Insights",
    description: "Get personalized insights tailored to your note-taking style",
  },
];

interface ProTipsProps {
  isPro: boolean;
}

export function ProTips({ isPro }: ProTipsProps) {
  if (!isPro) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-foreground" />
        <h3 className="text-sm font-medium font-lora">Pro Tips</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRO_TIPS.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium font-lora">{tip.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
