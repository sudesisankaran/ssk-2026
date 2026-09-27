# Contributing

Thanks for helping make this archive more useful! This project is split into a
**dataset** (the problem statements) and a **web app** (Next.js).

## Dataset contributions

- **Data corrections** - if a field is wrong, outdated, or missing, open a PR
  editing `data/ssk2026_ps.json` (and regenerate markdown via
  `python3 scripts/scrape_ssk.py --cache <html>` if you have fresh HTML).
- **Annotations** - add value in `ps_2026/<PS>.md` notes or a
  `docs/annotations/<PS>.md` file: relevant datasets, papers, past solutions,
  official notices.
- **New editions** - SSK 2027+ can be added as `ps_2027/` + a `data/ssk2027_ps.json`;
  the web app reads the latest edition by default, keep editions in their own
  data files.

## Web app contributions

```bash
cd web
pnpm install
pnpm dev
```

- Follow existing shadcn/ui component usage - **default components only**.
- Run `pnpm lint` and `pnpm build` before opening a PR.
- Keep the app fully static and client-side (no backend, no auth).

## Rules

- Do not change official text content (titles/descriptions) - it is a verbatim
  archive. Fixes to encoding/formatting only, with the original as reference.
- Keep attribution footers intact.
- Run `python3 scripts/scrape_ssk.py --validate` for dataset changes.

## PR checklist

1. `pnpm lint` + `pnpm build` pass (for web changes)
2. `scrape_ssk.py --validate` passes (for data changes)
3. Explain the change and its value in the PR description
