"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  BookOpen,
  Plus,
  Settings,
  Brain,
  BarChart3,
  Layers,
  Library,
  Network,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewNoteDialog } from "@/components/new-note-dialog";
import { CreditDisplay } from "@/components/credit-display";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { NotificationsDropdown } from "@/components/notifications";
import { Badge } from "@/components/ui/badge";
import { useUser, useUsage } from "@/lib/api/hooks";
import { DashboardProvider } from "@/lib/contexts/dashboard-context";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Notes", href: "/notes", icon: BookOpen },
  { name: "Journal", href: "/journal", icon: BookMarked },
  { name: "Collections", href: "/collections", icon: Library },
  { name: "Templates", href: "/templates", icon: Layers },
  { name: "Mind Map", href: "/canvas", icon: Network, badge: "PRO" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, badge: "PRO" },
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
  const { data: usage, isLoading: usageLoading } = useUsage({
    userId: user?.id,
  });

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
    <DashboardProvider
      user={user ?? null}
      usage={usage ?? null}
      isLoading={isLoading}
    >
      <div className="flex h-screen bg-background">
        <NewNoteDialog
          open={isNewNoteDialogOpen}
          onOpenChange={setIsNewNoteDialogOpen}
        />

        <aside className="flex w-64 flex-col border-r bg-background">
          <div className="flex h-14 items-center justify-between px-3 border-b">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.svg"
                alt="Recoil"
                className="h-10 w-10 object-cover"
              />
              <span className="text-xl font-lora">Recoil</span>
            </Link>
            <NotificationsDropdown />
          </div>

          <div className="p-3 border-b">
            <button
              onClick={() => setIsNewNoteDialogOpen(true)}
              style={{
                background: `linear-gradient(to right, 
                  rgb(40, 20, 25), 
                  rgb(50, 25, 30), 
                  rgb(60, 30, 35), 
                  rgb(70, 35, 40), 
                  rgb(60, 30, 35), 
                  rgb(50, 25, 30), 
                  rgb(40, 20, 25)
                )`,
              }}
              className="metallic-noise-button group w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full text-white border border-[rgba(255,255,255,0.15)] shadow-[0_2px_4px_0_rgba(0,0,0,0.5),0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.3)_inset,0_0_20px_rgba(150,50,50,0.25)] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.6),0_1px_0_0_rgba(255,255,255,0.15)_inset,0_-1px_0_0_rgba(0,0,0,0.4)_inset,0_0_30px_rgba(180,60,60,0.35)] transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer relative overflow-hidden"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, 
                  rgb(45, 25, 30), 
                  rgb(55, 30, 35), 
                  rgb(65, 35, 40), 
                  rgb(75, 40, 45), 
                  rgb(65, 35, 40), 
                  rgb(55, 30, 35), 
                  rgb(45, 25, 30)
                )`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, 
                  rgb(40, 20, 25), 
                  rgb(50, 25, 30), 
                  rgb(60, 30, 35), 
                  rgb(70, 35, 40), 
                  rgb(60, 30, 35), 
                  rgb(50, 25, 30), 
                  rgb(40, 20, 25)
                )`;
              }}
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90 relative z-10" />
              <span className="relative z-10">New Note</span>
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
                      "flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200",
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-foreground" : ""
                        )}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 font-semibold"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-border/50 p-3 space-y-2.5">
            <div className="rounded-md bg-muted/50 p-3 border border-border/30">
              <CreditDisplay
                credits={usage?.credits ?? 0}
                plan={usage?.plan ?? "free"}
                monthlyLimit={usage?.monthly_credits_limit ?? 500}
                showUpgrade={true}
              />
            </div>
            <div>
              <FeedbackDialog />
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-md hover:bg-muted/30"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main
          className="flex-1 overflow-auto bg-background"
          style={{
            backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
            backgroundSize: "24px 24px",
          }}
        >
          {pathname === "/canvas" ? (
            children
          ) : (
            <div className="mx-auto max-w-4xl h-full p-8 lg:p-12">
              {children}
            </div>
          )}
        </main>
      </div>
    </DashboardProvider>
  );
}
