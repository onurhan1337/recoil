"use client";

import { ChatBox } from "@/components/chat-box";
import { useUser } from "@/lib/api/hooks";
import { getTimeBasedGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { text } = getTimeBasedGreeting(user || null);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <div className="mb-2">
          <h1 className="text-3xl font-lora font-semibold tracking-tight">
            {text}
          </h1>
        </div>
        <p className="text-muted-foreground tracking-wide font-lora text-sm">
          Ask questions and explore your thoughts using AI-powered search
        </p>
      </div>

      <div className="flex-1 rounded-lg border overflow-hidden">
        <ChatBox />
      </div>
    </div>
  );
}
