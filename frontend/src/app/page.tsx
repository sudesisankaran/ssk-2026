import type { Metadata } from "next";
import { Box, CodeBracket, Globe, Router } from "@/components/icons/geist";
import { Suspense } from "react";

import { Explorer } from "@/components/explorer";
import { JsonLd } from "@/components/json-ld";
import { SearchBar } from "@/components/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StatsSection } from "@/components/stats-section";
import { getStats, getProblemStatements } from "@/lib/ps";
import messages from "../../messages/en.json";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ssk2026.vuce.in";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

function t(key: string, params?: Record<string, string | number>): string {
  const raw = getNestedValue(messages as Record<string, unknown>, key);
  return params ? interpolate(raw, params) : raw;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: SITE_URL,
    },
  };
}

export default async function HomePage() {
  const stats = await getStats();
  const problemStatements = await getProblemStatements();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "SSK 2026 Problem Statements",
          description:
            `All ${stats?.total} ssk Innovathon 2026 problem statements with titles, descriptions, organizations, themes and deadlines.`,
          url: "https://ssk2026.vuce.in",
          creator: {
            "@type": "Organization",
            name: "ssk Innovathon",
            url: "https://ssk.gov.in",
          },
          license: "https://creativecommons.org/licenses/by/4.0/",
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl:
                "https://github.com/vedantchalke36/ssk-2026-problem-statements/blob/main/data/ssk2026_ps.json",
            },
            {
              "@type": "DataDownload",
              encodingFormat: "text/csv",
              contentUrl:
                "https://github.com/vedantchalke36/ssk-2026-problem-statements/blob/main/data/ssk2026_ps.csv",
            },
          ],
          variableMeasured: [
            "ps_number",
            "title",
            "description",
            "organization",
            "category",
            "theme",
            "deadline",
          ],
        }}
      />

      <section className="relative overflow-hidden border-b border-border/60 bg-radial-glow py-16 sm:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-label-12 font-medium text-muted-foreground shadow-2xs backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-green-600" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">
              {t("hero.badgeLive")}
            </span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">{t("hero.badgeAll")}</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-heading-32 sm:text-heading-56 text-balance bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              {t("hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-copy-18 text-muted-foreground">
              {t("hero.subtitle", {
                total: stats.total,
                software: stats.software,
                hardware: stats.hardware,
              })}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-12 w-full max-w-2xl items-center justify-center rounded-xl border border-border/80 bg-muted/40">
                <Spinner className="size-4 text-muted-foreground" />
              </div>
            }
          >
            <SearchBar problemStatements={problemStatements} stats={stats} />
          </Suspense>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-label-12 font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground backdrop-blur-xs shadow-2xs">
              <Box className="size-3.5 text-gray-700 dark:text-gray-500" />
              <strong className="font-bold text-foreground">{stats.total}</strong>{" "}
              {t("hero.pillTotal")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground backdrop-blur-xs shadow-2xs">
              <CodeBracket className="size-3.5 text-blue-700 dark:text-blue-600" />
              <strong className="font-bold text-foreground">{stats.software}</strong>{" "}
              {t("hero.pillSoftware")}
            </span>

          </div>
        </div>
      </section>



      <Suspense
        fallback={
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl border border-border" />
            ))}
          </div>
        }
      >
        <Explorer problemStatements={problemStatements} stats={stats} />
      </Suspense>

      <StatsSection stats={stats} />
    </>
  );
}
