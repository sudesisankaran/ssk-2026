import os
import re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. ps.ts
ps_ts_content = """import { collection, getDocs } from "firebase/firestore";
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
  const text = ps.description.replace(/\\s+/g, " ").trim();
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
  ].join("\\n");
}

const SECTION_TITLE = /^[A-Z][A-Za-z ]{2,40}:$/;

export function splitSections(ps: ProblemStatement): {
  heading: string;
  content: string;
}[] {
  const sections: { heading: string; content: string[] }[] = [];
  let current: { heading: string; content: string[] } | null = null;
  for (const line of ps.description.split("\\n")) {
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
    content: s.content.join("\\n"),
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
  return lines.join("\\n");
}
"""

with open('src/lib/ps.ts', 'w', encoding='utf-8') as f:
    f.write(ps_ts_content)

# 2. page.tsx
update_file('src/app/page.tsx', [
    ('import { stats } from "@/lib/ps";', 'import { getStats, getProblemStatements } from "@/lib/ps";'),
    ('export default function HomePage() {', 'export default async function HomePage() {\n  const stats = await getStats();\n  const problemStatements = await getProblemStatements();'),
    ('<Explorer />', '<Explorer problemStatements={problemStatements} stats={stats} />'),
    ('<StatsSection />', '<StatsSection stats={stats} />'),
    ('`All ${stats.total}', '`All ${stats?.total}'),
])

# 3. stats-section.tsx
update_file('src/components/stats-section.tsx', [
    ('import { stats } from "@/lib/ps";', 'import { Stats } from "@/lib/ps";'),
    ('export async function StatsSection() {', 'export async function StatsSection({ stats }: { stats: Stats }) {')
])

# 4. explorer.tsx
update_file('src/components/explorer.tsx', [
    ('import { stats, problemStatements } from "@/lib/ps";', 'import { Stats, ProblemStatement } from "@/lib/ps";'),
    ('export function Explorer() {', 'export function Explorer({ problemStatements, stats }: { problemStatements: ProblemStatement[], stats: Stats }) {'),
    ('} = useExplorer(searchParams.toString());', '} = useExplorer(searchParams.toString(), problemStatements, stats);'),
    ('function CategoryTabs({\n  value,\n  onChange,\n}: {\n  value: FilterState["categories"];\n  onChange: (v: FilterState["categories"]) => void;\n}) {', 'function CategoryTabs({\n  value,\n  onChange,\n  stats\n}: {\n  value: FilterState["categories"];\n  onChange: (v: FilterState["categories"]) => void;\n  stats: Stats\n}) {'),
    ('function FilterControls({\n  filters,\n  activeCount,\n  setFilter,\n  toggleTheme,\n  onReset,\n}: {\n  filters: FilterState;\n  activeCount: number;\n  setFilter: (k: keyof FilterState, v: FilterState[keyof FilterState]) => void;\n  toggleTheme: (t: string) => void;\n  onReset: () => void;\n}) {', 'function FilterControls({\n  filters,\n  activeCount,\n  setFilter,\n  toggleTheme,\n  onReset,\n  stats\n}: {\n  filters: FilterState;\n  activeCount: number;\n  setFilter: (k: keyof FilterState, v: FilterState[keyof FilterState]) => void;\n  toggleTheme: (t: string) => void;\n  onReset: () => void;\n  stats: Stats\n}) {'),
    ('value={filters.categories}\n              onChange={(v) => setFilter("categories", v)}', 'value={filters.categories}\n              onChange={(v) => setFilter("categories", v)}\n              stats={stats}'),
    ('toggleTheme={toggleTheme}\n              onReset={reset}', 'toggleTheme={toggleTheme}\n              onReset={reset}\n              stats={stats}'),
    ('toggleTheme={toggleTheme}\n              onReset={() => {\n                reset();\n                setMobileOpen(false);\n              }}', 'toggleTheme={toggleTheme}\n              onReset={() => {\n                reset();\n                setMobileOpen(false);\n              }}\n              stats={stats}')
])

# 5. use-explorer.ts
update_file('src/hooks/use-explorer.ts', [
    ('import { problemStatements } from "@/lib/ps";', 'import { ProblemStatement, Stats } from "@/lib/ps";'),
    ('export function useExplorer(searchString: string) {', 'export function useExplorer(searchString: string, problemStatements: ProblemStatement[], stats: Stats) {')
])

# 6. ps/[id]/page.tsx
update_file('src/app/ps/[id]/page.tsx', [
    ('import { PS_BY_NUMBER, problemStatements } from "@/lib/ps";', 'import { getProblemStatements } from "@/lib/ps";'),
    ('export function generateStaticParams() {', 'export async function generateStaticParams() {\n  const problemStatements = await getProblemStatements();'),
    ('const ps = PS_BY_NUMBER.get(id);', 'const problemStatements = await getProblemStatements();\n  const ps = problemStatements.find(p => p.ps_number === id);'),
    ('export function generateMetadata({ params }: { params: { id: string } }): Metadata {', 'export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {'),
    ('export default function PsPage({ params }: { params: { id: string } }) {', 'export default async function PsPage({ params }: { params: { id: string } }) {'),
    ('const related = problemStatements', 'const related = problemStatements') # Already fetched
])

# 7. sitemap.ts
