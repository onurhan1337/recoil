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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewNoteDialog } from "@/components/new-note-dialog";
import { CreditDisplay } from "@/components/credit-display";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { NotificationsDropdown } from "@/components/notifications";
import { Badge } from "@/components/ui/badge";
import { useUser, useUsage } from "@/lib/api/hooks";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Notes", href: "/notes", icon: BookOpen },
  { name: "Collections", href: "/collections", icon: Library },
  { name: "Templates", href: "/templates", icon: Layers },
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
      <NewNoteDialog
        open={isNewNoteDialogOpen}
        onOpenChange={setIsNewNoteDialogOpen}
      />

      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r">
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sm"
          >
            <Brain className="h-5 w-5" />
            Recoil
          </Link>
          <NotificationsDropdown />
        </div>

        <div className="p-3 border-b">
          <button
            onClick={() => setIsNewNoteDialogOpen(true)}
            className="group w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-[linear-gradient(to_right,rgb(41_37_36),rgb(68_64_60),rgb(41_37_36))] hover:bg-[linear-gradient(to_right,rgb(28_25_23),rgb(41_37_36),rgb(28_25_23))] text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
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
                    "flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-muted font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t p-3 space-y-3">
          <div className="rounded-md bg-muted/50 p-3">
            <CreditDisplay
              credits={usage?.credits ?? 0}
              plan={usage?.plan ?? "free"}
              monthlyLimit={usage?.monthly_credits_limit ?? 500}
              showUpgrade={true}
            />
          </div>
          <div className="pt-2">
            <FeedbackDialog />
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
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
        <div className="mx-auto max-w-4xl h-full p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
