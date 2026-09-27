"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

interface NotesContextValue {
  getNote: (psNumber: string) => string;
  setNote: (psNumber: string, text: string) => void;
  clearNote: (psNumber: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);
const KEY = "ssk2026:notes";

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorage<Record<string, string>>(KEY, {});

  const getNote = useCallback(
    (psNumber: string) => notes[psNumber] ?? "",
    [notes],
  );
  const setNote = useCallback(
    (psNumber: string, text: string) => {
      setNotes((prev) => {
        const next = { ...prev };
        if (text.trim()) next[psNumber] = text;
        else delete next[psNumber];
        return next;
      });
    },
    [setNotes],
  );
  const clearNote = useCallback(
    (psNumber: string) => {
      setNotes((prev) => {
        const next = { ...prev };
        delete next[psNumber];
        return next;
      });
    },
    [setNotes],
  );

  const value = useMemo(
    () => ({ getNote, setNote, clearNote }),
    [getNote, setNote, clearNote],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
