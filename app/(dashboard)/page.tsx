"use client";

import { ChatBox } from "@/components/chat-box";
import { useUser } from "@/lib/api/hooks";
import { getTimeBasedGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { text, Icon } = getTimeBasedGreeting(user || null);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-7 w-7" />
          <h1 className="font-lora text-3xl font-semibold tracking-tight">
            {text}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Ask questions and explore your thoughts using AI-powered search
        </p>
      </div>

      <div className="flex-1 rounded-lg border overflow-hidden">
        <ChatBox />
      </div>
    </div>
  );
}
