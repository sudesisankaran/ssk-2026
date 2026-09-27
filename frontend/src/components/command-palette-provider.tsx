"use client";

import { useEffect, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/command-palette";
import { SiteHeader } from "@/components/site-header";
import type { ProblemStatement, Stats } from "@/lib/ps";

export function CommandPaletteProvider({ children, problemStatements, stats }: { children: ReactNode, problemStatements: ProblemStatement[], stats: Stats }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <SiteHeader onOpenCommand={() => setOpen(true)} />
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} problemStatements={problemStatements} stats={stats} />
    </>
  );
}
