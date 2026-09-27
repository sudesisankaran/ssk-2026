import { fuzzySearch } from "@/lib/search";
import { type ProblemStatement } from "@/lib/ps";

export type CategoryFilter = "all" | "Software" | "Hardware";
export type SortKey = "sno" | "title" | "org" | "theme" | "deadline";
export type ViewMode = "grid" | "list";

export interface FilterState {
  q: string;
  categories: CategoryFilter[];
  themes: string[];
  org: string;
  hasDataset: boolean;
  sort: SortKey;
  view: ViewMode;
  page: number;
}

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  categories: [],
  themes: [],
  org: "",
  hasDataset: false,
  sort: "sno",
  view: "grid",
  page: 1,
};

export const PAGE_SIZE = 18;

export function applyFilters(
  filters: FilterState,
  all: ProblemStatement[],
): ProblemStatement[] {
  let items = all;

  if (filters.categories.length > 0) {
    items = items.filter((ps) => filters.categories.includes(ps.category));
  }
  if (filters.themes.length > 0) {
    items = items.filter((ps) => filters.themes.includes(ps.theme));
  }
  if (filters.org) {
    items = items.filter((ps) => ps.org === filters.org);
  }
  if (filters.hasDataset) {
    items = items.filter((ps) => ps.dataset_link.trim().length > 0);
  }
  let searchOrder: Map<string, number> | undefined;
  if (filters.q.trim()) {
    const fuzzy = fuzzySearch(filters.q, all);
    searchOrder = new Map(fuzzy.map((ps, index) => [ps.ps_number, index]));
    const fuzzySet = new Set(fuzzy.map((ps) => ps.ps_number));
    items = items.filter((ps) => fuzzySet.has(ps.ps_number));
  }

  if (searchOrder && filters.sort === "sno") {
    return [...items].sort(
      (a, b) =>
        (searchOrder.get(a.ps_number) ?? Number.MAX_SAFE_INTEGER) -
          (searchOrder.get(b.ps_number) ?? Number.MAX_SAFE_INTEGER),
    );
  }

  return sortItems(items, filters.sort);
}

export function sortItems(
  items: ProblemStatement[],
  sort: SortKey,
): ProblemStatement[] {
  const copy = [...items];
  switch (sort) {
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "org":
      return copy.sort((a, b) => a.org.localeCompare(b.org) || a.sno - b.sno);
    case "theme":
      return copy.sort((a, b) => a.theme.localeCompare(b.theme) || a.sno - b.sno);
    case "deadline":
      return copy.sort((a, b) =>
        (a.deadline_date ?? "").localeCompare(b.deadline_date ?? ""),
      );
    default:
      return copy.sort((a, b) => a.sno - b.sno);
  }
}

const FILTER_KEYS: (keyof FilterState)[] = [
  "q",
  "categories",
  "themes",
  "org",
  "hasDataset",
  "sort",
  "view",
  "page",
];

export function filtersToParams(f: FilterState): string {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.categories.length === 1) params.set("cat", f.categories[0]);
  // Repeat the param. Theme names contain commas, so join/split would break them.
  for (const theme of f.themes) {
    params.append("theme", theme);
  }
  if (f.org) params.set("org", f.org);
  if (f.hasDataset) params.set("dataset", "1");
  if (f.sort !== "sno") params.set("sort", f.sort);
  if (f.view !== "grid") params.set("view", f.view);
  if (f.page > 1) params.set("page", String(f.page));
  return params.toString();
}

export function paramsToFilters(search: string): FilterState {
  const params = new URLSearchParams(search);
  const categories = (["Software", "Hardware"] as const).filter((c) =>
    params.getAll("cat").includes(c),
  );
  return {
    q: params.get("q") ?? "",
    categories,
    themes: params.getAll("theme").filter(Boolean),
    org: params.get("org") ?? "",
    hasDataset: params.get("dataset") === "1",
    sort: (params.get("sort") as SortKey) || "sno",
    view: params.get("view") === "list" ? "list" : "grid",
    page: Math.max(1, Number(params.get("page")) || 1),
  };
}

export function activeFilterCount(f: FilterState): number {
  return (
    (f.categories.length > 0 ? 1 : 0) +
    f.themes.length +
    (f.org ? 1 : 0) +
    (f.hasDataset ? 1 : 0) +
    (f.q ? 1 : 0)
  );
}

export function filterSignature(f: FilterState): string {
  return FILTER_KEYS.map((k) => String(f[k])).join("|");
}
