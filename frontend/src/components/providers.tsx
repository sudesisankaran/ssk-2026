"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotesProvider } from "@/hooks/use-notes";
import { RecentSearchesProvider } from "@/hooks/use-recent-searches";
import { ShortlistProvider } from "@/hooks/use-shortlist";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <ShortlistProvider>
          <NotesProvider>
            <RecentSearchesProvider>{children}</RecentSearchesProvider>
          </NotesProvider>
        </ShortlistProvider>
      </TooltipProvider>
      <Toaster position="bottom-center" richColors />
    </ThemeProvider>
  );
}
