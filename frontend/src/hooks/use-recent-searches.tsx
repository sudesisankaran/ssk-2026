"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

interface RecentContextValue {
  recent: string[];
  addRecent: (query: string) => void;
  clear: () => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);
const KEY = "ssk2026:recent-searches";
const MAX = 6;

export function RecentSearchesProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useLocalStorage<string[]>(KEY, []);

  const addRecent = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      setRecent((prev) => [
        q,
        ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase()),
      ].slice(0, MAX));
    },
    [setRecent],
  );

  const clear = useCallback(() => setRecent([]), [setRecent]);

  const value = useMemo(
    () => ({ recent, addRecent, clear }),
    [recent, addRecent, clear],
  );

  return (
    <RecentContext.Provider value={value}>{children}</RecentContext.Provider>
  );
}

export function useRecentSearches() {
  const ctx = useContext(RecentContext);
  if (!ctx) {
    throw new Error("useRecentSearches must be used within RecentSearchesProvider");
  }
  return ctx;
}
