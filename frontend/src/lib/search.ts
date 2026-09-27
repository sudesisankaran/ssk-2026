import Fuse from "fuse.js";
import { type ProblemStatement } from "@/lib/ps";

export function fuzzySearch(query: string, problemStatements: ProblemStatement[], limit = 50): ProblemStatement[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const fuse = new Fuse(problemStatements, {
    keys: [
      { name: "title", weight: 3 },
      { name: "ps_number", weight: 3 },
      { name: "org", weight: 2 },
      { name: "theme", weight: 2 },
      { name: "department", weight: 1 },
      { name: "description", weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    shouldSort: true,
  });
  return fuse.search(q, { limit }).map((r) => r.item);
}

// Removed global fuse instance

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function highlightMatch(text: string, query: string): string {
  const tokens = tokenize(query);
  if (!tokens.length) return text;
  const escaped = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    "<mark>$1</mark>",
  );
}
