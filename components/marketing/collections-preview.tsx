"use client";

import { Library, LayoutTemplate, Users, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CollectionsPreview() {
  const collections = [
    {
      name: "Work Projects",
      count: 24,
      color: "rgb(59, 130, 246)",
      description: "Active projects and tasks",
    },
    {
      name: "Research",
      count: 18,
      color: "rgb(168, 85, 247)",
      description: "Notes and findings",
    },
  ];

  const templates = [
    { name: "Meeting Notes", category: "meeting", icon: Users },
    { name: "Brainstorm", category: "idea", icon: Lightbulb },
    { name: "Daily Journal", category: "journal", icon: LayoutTemplate },
    { name: "Task List", category: "task", icon: LayoutTemplate },
  ];

  return (
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Collections & Templates</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Organize notes into collections. Create reusable templates for structured thinking.
        </p>
      </div>
      
      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          {collections.map((collection, i) => (
            <div
              key={i}
              className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card p-2.5 transition-all hover:bg-muted/50"
            >
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex items-start gap-2">
                  <div
                    className="p-1.5 rounded-md border shrink-0"
                    style={{
                      backgroundColor: `${collection.color}1A`,
                      borderColor: collection.color,
                    }}
                  >
                    <Library
                      className="h-3 w-3"
                      style={{
                        color: collection.color,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium line-clamp-1 text-foreground mb-0.5">
                      {collection.name}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mb-1">
                      {collection.count} {collection.count === 1 ? "note" : "notes"}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed font-lora">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border/50">
          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Templates
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((template, i) => {
              const Icon = template.icon;
              return (
                <div
                  key={i}
                  className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card p-2.5 transition-all hover:bg-muted/50"
                >
                  <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-500 dark:border-orange-400 shrink-0">
                        <Icon className="h-3 w-3 text-orange-700 dark:text-orange-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium line-clamp-1 text-foreground mb-0.5">
                          {template.name}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

