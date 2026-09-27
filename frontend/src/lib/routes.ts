import { getProblemStatements } from "@/lib/ps";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getThemes() {
  const ps = await getProblemStatements();
  return [...new Set(ps.map((p) => p.theme))].sort();
}
export async function getOrgs() {
  const ps = await getProblemStatements();
  return [...new Set(ps.map((p) => p.org))].sort();
}

export async function getThemeSlugs() {
  const themes = await getThemes();
  return Object.fromEntries(themes.map((name) => [name, slugify(name)]));
}
export async function getOrgSlugs() {
  const orgs = await getOrgs();
  return Object.fromEntries(orgs.map((name) => [name, slugify(name)]));
}

export async function getThemeBySlug() {
  const themes = await getThemes();
  return Object.fromEntries(themes.map((name) => [slugify(name), name]));
}
export async function getOrgBySlug() {
  const orgs = await getOrgs();
  return Object.fromEntries(orgs.map((name) => [slugify(name), name]));
}

export async function themePs(name: string) {
  const ps = await getProblemStatements();
  return ps.filter((p) => p.theme === name);
}

export async function orgPs(name: string) {
  const ps = await getProblemStatements();
  return ps.filter((p) => p.org === name);
}
