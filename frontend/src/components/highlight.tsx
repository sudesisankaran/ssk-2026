"use client";

export function Highlight({ text }: { text: string }) {
  const parts = text.split("|mark|");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-sm bg-primary/15 px-0.5 text-inherit dark:bg-primary/30"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function markQuery(text: string, query: string): string {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!tokens.length) return text;
  return text.replace(new RegExp(`(${tokens.join("|")})`, "gi"), "|mark|$1|mark|");
}
