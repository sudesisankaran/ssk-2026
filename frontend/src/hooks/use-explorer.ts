"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  activeFilterCount,
  applyFilters,
  filtersToParams,
  paramsToFilters,
  type FilterState,
} from "@/lib/filters";
import type { ProblemStatement, Stats } from "@/lib/ps";

const PAGE_SIZE = 18;

export { PAGE_SIZE };

export interface ExplorerState {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void;
  toggleTheme: (theme: string) => void;
  reset: () => void;
  results: ProblemStatement[];
  total: number;
  pageCount: number;
  pageItems: ProblemStatement[];
  activeCount: number;
  urlFor: (patch: Partial<FilterState>) => string;
}

export function useExplorer(urlSearch: string, problemStatements: ProblemStatement[], stats: Stats): ExplorerState {
  const router = useRouter();
  const filters = useMemo(() => paramsToFilters(urlSearch), [urlSearch]);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...filters, ...patch };
      if (
        "q" in patch ||
        "categories" in patch ||
        "themes" in patch ||
        "org" in patch ||
        "hasDataset" in patch ||
        "sort" in patch
      ) {
        next.page = 1;
      }
      const params = filtersToParams(next);
      const url = params
        ? `${window.location.pathname}?${params}`
        : window.location.pathname;
      router.push(url, { scroll: false });
    },
    [filters, router],
  );

  const setFilter = useCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      update({ [key]: value } as Partial<FilterState>);
    },
    [update],
  );

  const toggleTheme = useCallback(
    (theme: string) => {
      const has = filters.themes.includes(theme);
      update({
        themes: has
          ? filters.themes.filter((t) => t !== theme)
          : [...filters.themes, theme],
      });
    },
    [filters.themes, update],
  );

  const reset = useCallback(() => {
    const params = filtersToParams({
      ...filters,
      q: "",
      categories: [],
      themes: [],
      org: "",
      hasDataset: false,
      sort: "sno",
      page: 1,
    });
    const url = params
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    router.push(url, { scroll: false });
  }, [filters, router]);

  const urlFor = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...filters, ...patch };
      if (
        "q" in patch ||
        "categories" in patch ||
        "themes" in patch ||
        "org" in patch ||
        "hasDataset" in patch ||
        "sort" in patch
      ) {
        next.page = 1;
      }
      const params = filtersToParams(next);
      return params ? `/?${params}` : "/";
    },
    [filters],
  );

  const results = useMemo(() => applyFilters(filters, problemStatements), [filters, problemStatements]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const pageItems = useMemo(
    () => results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [results, page],
  );

  const activeCount = useMemo(() => activeFilterCount(filters), [filters]);

  return {
    filters,
    setFilter,
    toggleTheme,
    reset,
    results,
    total: results.length,
    pageCount,
    pageItems,
    activeCount,
    urlFor,
  };
}
