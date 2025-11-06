"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthButton } from "@/components/auth-button";
import { CreditDisplay } from "@/components/credit-display";
import { MessageList } from "@/components/message-list";
import { NoteInput } from "@/components/note-input";
import { SearchInput } from "@/components/search-input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };

    const getCredits = async () => {
      const response = await fetch("/api/usage");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    };

    getUser();
    getCredits();
  }, [supabase.auth]);

  const handleNoteCreated = () => {
    setCredits((prev) => Math.max(0, prev - 1));
  };

  const handleSearchSubmit = async (query: string) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCredits((prev) => Math.max(0, prev - 1));

    try {
      const response = await fetch("/api/notes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.results || "No results found",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Recoil</h1>
              <Separator orientation="vertical" className="h-6" />
              <p className="text-sm text-muted-foreground">
                Personal Memory App
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CreditDisplay credits={credits} />
              {userEmail && <AuthButton email={userEmail} />}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Create Note</h2>
            <NoteInput onNoteCreated={handleNoteCreated} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Search Notes</h2>
            <SearchInput onSearch={handleSearchSubmit} isLoading={isLoading} />
          </Card>

          {messages.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Search Results</h2>
              <MessageList messages={messages} />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
