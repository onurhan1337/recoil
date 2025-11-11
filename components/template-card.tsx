"use client";

import { motion } from "framer-motion";
import {
  LayoutTemplate,
  BookOpen,
  Users,
  Lightbulb,
  CheckSquare,
  Code,
  Heart,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
}

interface TemplateCardProps {
  template: Template;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  index: number;
}

const CATEGORY_ICON_MAP: Array<{
  keywords: string[];
  icon: typeof LayoutTemplate;
}> = [
  { keywords: ["meeting"], icon: Users },
  { keywords: ["idea", "brainstorm"], icon: Lightbulb },
  { keywords: ["task", "todo"], icon: CheckSquare },
  { keywords: ["research", "study"], icon: BookOpen },
  { keywords: ["code", "dev"], icon: Code },
  { keywords: ["journal", "personal"], icon: Heart },
];

const getTemplateIcon = (category?: string | null) => {
  if (!category) return LayoutTemplate;

  const categoryLower = category.toLowerCase();
  const match = CATEGORY_ICON_MAP.find(({ keywords }) =>
    keywords.some((keyword) => categoryLower.includes(keyword))
  );

  return match?.icon ?? LayoutTemplate;
};

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  isDeleting,
  index,
}: TemplateCardProps) {
  const Icon = getTemplateIcon(template.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        delay: index * 0.02,
      }}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card p-4 transition-all hover:bg-muted/50 text-left"
    >
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-500 dark:border-orange-400 shrink-0">
            <Icon className="h-4 w-4 text-orange-700 dark:text-orange-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-1 text-foreground mb-1">
              {template.name}
            </h3>
            {template.category && (
              <Badge variant="secondary" className="text-xs mb-1.5">
                {template.category}
              </Badge>
            )}
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-lora">
                {template.description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-auto pt-2 border-t flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(template.id)}
            className="flex-1"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(template.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
