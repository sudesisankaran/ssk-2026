import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface ProblemStatement {
  sno: number;
  ps_number: string;
  title: string;
  org: string;
  department: string;
  category: "Software" | "Hardware";
  theme: string;
  deadline: string;
  deadline_date: string | null;
  ideas: string;
  dataset_link: string;
  contact: string;
  youtube: string;
  description: string;
  scraped_at: string;
}

let cachedProblemStatements: ProblemStatement[] | null = null;
export async function getProblemStatements(): Promise<ProblemStatement[]> {
  if (cachedProblemStatements) return cachedProblemStatements;
  const snap = await getDocs(collection(db, "problem_statements"));
  cachedProblemStatements = snap.docs.map(d => d.data() as ProblemStatement);
  return cachedProblemStatements;
}

export interface Stats {
  total: number;
  software: number;
  hardware: number;
  themes: { name: string; count: number }[];
  orgs: { name: string; count: number }[];
  hasDataset: number;
}

export async function getStats(): Promise<Stats> {
  const ps = await getProblemStatements();
  return {
    total: ps.length,
    software: ps.filter((p) => p.category === "Software").length,
    hardware: ps.filter((p) => p.category === "Hardware").length,
    themes: countBy(ps, "theme").sort((a, b) => b.count - a.count),
    orgs: countBy(ps, "org").sort((a, b) => b.count - a.count),
    hasDataset: ps.filter((p) => (p.dataset_link || "").trim().length > 0).length,
  };
}

function countBy<T>(items: T[], key: keyof T): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const value = String(item[key]);
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count }));
}

export function deadlineDate(ps: ProblemStatement): Date | null {
  if (!ps.deadline_date) return null;
  const d = new Date(ps.deadline_date + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  const ms = date.getTime() - new Date(from).setHours(0, 0, 0, 0);
  return Math.ceil(ms / 86_400_000);
}

export function descriptionExcerpt(ps: ProblemStatement, length = 220): string {
  const text = ps.description.replace(/\s+/g, " ").trim();
  return text.length > length ? text.slice(0, length).trimEnd() + "…" : text;
}

export function psMarkdown(ps: ProblemStatement): string {
  return [
    `# ${ps.ps_number} - ${ps.title}`,
    ``,
    `- **PS Number:** ${ps.ps_number}`,
    `- **Organization:** ${ps.org}`,
    `- **Category:** ${ps.category}`,
    `- **Theme:** ${ps.theme}`,
    `- **Deadline:** ${ps.deadline}`,
    ``,
    `## Description`,
    ``,
    ps.description,
    ``,
    `---`,
    `Source: https://ssk.gov.in/ssk2026PS · CC-BY-4.0 · ${ps.scraped_at}`,
  ].join("\n");
}

const SECTION_TITLE = /^[A-Z][A-Za-z ]{2,40}:$/;

export function splitSections(ps: ProblemStatement): {
  heading: string;
  content: string;
}[] {
  const sections: { heading: string; content: string[] }[] = [];
  let current: { heading: string; content: string[] } | null = null;
  for (const line of ps.description.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (SECTION_TITLE.test(trimmed)) {
      current = { heading: trimmed.replace(/:$/, ""), content: [] };
      sections.push(current);
    } else if (current) {
      current.content.push(trimmed);
    } else {
      sections.push({ heading: "Overview", content: [trimmed] });
    }
  }
  return sections.map((s) => ({
    heading: s.heading,
    content: s.content.join("\n"),
  }));
}

export function psChatPrompt(ps: ProblemStatement): string {
  const lines = [
    `I'm preparing for ssk Innovathon 2026. Here is a problem statement I'm evaluating:`,
    ``,
    `## ${ps.ps_number} - ${ps.title}`,
    ``,
    `- **Organization:** ${ps.org}`,
    `- **Department:** ${ps.department || "N/A"}`,
    `- **Category:** ${ps.category}`,
    `- **Theme:** ${ps.theme}`,
    `- **Deadline for idea submission:** ${ps.deadline}`,
  ];
  for (const section of splitSections(ps)) {
    lines.push("", `### ${section.heading}`, "", section.content);
  }
  lines.push(
    "",
    "Help me: 1) summarize the core problem, 2) list the key requirements, 3) propose a concrete solution architecture, and 4) outline what I should build for the prototype.",
  );
  return lines.join("\n");
}
