"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { UsageResponse } from "@/lib/api/types";

interface DashboardContextValue {
  user: User | null;
  usage: UsageResponse | null;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

interface DashboardProviderProps {
  user: User | null;
  usage: UsageResponse | null;
  isLoading: boolean;
  children: ReactNode;
}

export function DashboardProvider({
  user,
  usage,
  isLoading,
  children,
}: DashboardProviderProps) {
  return (
    <DashboardContext.Provider value={{ user, usage, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    return { user: null, usage: null, isLoading: false };
  }
  return context;
}
