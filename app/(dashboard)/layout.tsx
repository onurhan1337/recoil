"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Home, BookOpen, Plus, Settings, Brain, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { NewNoteDialog } from "@/components/new-note-dialog";
import { useUser, useUsage } from "@/lib/api/hooks";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Notes", href: "/notes", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const { data: user, isLoading: userLoading } = useUser();
  const { data: usage, isLoading: usageLoading } = useUsage();

  const isLoading = userLoading || usageLoading;

  if (!userLoading && !user) {
    router.push("/login");
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <NewNoteDialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen} />

      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r">
        <div className="flex h-14 items-center px-4 border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <Brain className="h-5 w-5" />
            Recoil
          </Link>
        </div>

        {/* New Note Button */}
        <div className="p-3 border-b">
          <button
            onClick={() => setIsNewNoteDialogOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-muted font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t p-3 space-y-3">
          <div className="rounded-md bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Credits</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold tabular-nums">{usage?.credits ?? 0}</span>
              <span className="text-xs text-muted-foreground">/ {config.credits.initial}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-4xl h-full p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
