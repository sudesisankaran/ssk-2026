"use client";

import { useMemo, type ReactNode } from "react";

const BOLD = /\*\*(.+?)\*\*/g;
const SECTION_TITLE = /^[A-Z][A-Za-z ]{2,40}:$/;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  BOLD.lastIndex = 0;
  while ((match = BOLD.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <strong key={`${keyBase}-b${i++}`} className="font-semibold">
        {match[1]}
      </strong>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block = { type: "h" | "ul" | "p"; text?: string; items?: string[] };

export function Description({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const lines = text.split("\n");
    const out: Block[] = [];
    let currentBullets: string[] | null = null;

    const flush = () => {
      if (currentBullets) {
        out.push({ type: "ul", items: currentBullets });
        currentBullets = null;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flush();
        continue;
      }
      const bullet = trimmed.match(/^•\s*(.*)$/);
      if (bullet) {
        if (!currentBullets) currentBullets = [];
        currentBullets.push(bullet[1]);
      } else if (SECTION_TITLE.test(trimmed)) {
        flush();
        out.push({ type: "h", text: trimmed.replace(/:$/, "") });
      } else {
        flush();
        out.push({ type: "p", text: trimmed });
      }
    }
    flush();
    return out;
  }, [text]);

  return (
    <div className="space-y-4 text-copy-16 text-foreground/90">
      {blocks.map((block, i) => {
        if (block.type === "h") {
          return (
            <h3
              key={i}
              className="flex items-center gap-2 pt-2 text-heading-14 text-foreground"
            >
              <span className="h-4 w-1 rounded-full bg-foreground/20" />
              {block.text}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul
              key={i}
              className="ml-5 space-y-2 list-disc marker:text-gray-400"
            >
              {block.items!.map((item, j) => (
                <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block.text!, `${i}`)}</p>;
      })}
    </div>
  );
}
