"use client";

import { ChatBox } from "@/components/chat-box";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { getTimeOfDay } from "@/lib/utils";
import { Coffee, Sun, Moon } from "lucide-react";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState<string>("");
  const [icon, setIcon] = useState<React.ReactNode>(
    <Coffee className="h-7 w-7" />
  );
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "there";

        const time = getTimeOfDay();

        let timeGreeting = "Good morning";
        let timeIcon = <Coffee className="h-7 w-7" />;

        if (time === "afternoon") {
          timeGreeting = "Good afternoon";
          timeIcon = <Sun className="h-7 w-7" />;
        } else if (time === "evening") {
          timeGreeting = "Good evening";
          timeIcon = <Moon className="h-7 w-7" />;
        }

        setIcon(timeIcon);
        setGreeting(`${timeGreeting}, ${name}!`);
      }
    };

    getUserData();
  }, [supabase.auth]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h1 className="font-lora text-3xl font-semibold tracking-tight">
            {greeting || "Chat with your notes"}
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
