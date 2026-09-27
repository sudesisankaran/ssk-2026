# SSK 2026 Problem Statements

[![Data refresh](https://github.com/vedantchalke36/ssk-2026-problem-statements/actions/workflows/refresh-data.yml/badge.svg)](https://github.com/vedantchalke36/ssk-2026-problem-statements/actions/workflows/refresh-data.yml)
[![CI](https://github.com/vedantchalke36/ssk-2026-problem-statements/actions/workflows/ci.yml/badge.svg)](https://github.com/vedantchalke36/ssk-2026-problem-statements/actions/workflows/ci.yml)

All **229 problem statements** from [ssk Innovathon 2026](https://www.ssk.gov.in/ssk2026PS) in one searchable place - clean markdown, JSON and CSV, plus a fast bilingual web app to browse, filter and shortlist them.

## Contents

| Path | What it is |
|---|---|
| [`ps_2026/`](ps_2026/) | 229 markdown files (`SSK26001.md` ... `SSK26229.md`) + index |
| [`data/ssk2026_ps.json`](data/ssk2026_ps.json) | Full structured export (all fields incl. descriptions) |
| [`data/ssk2026_ps.csv`](data/ssk2026_ps.csv) | Same data, spreadsheet-friendly |
| [`data/changelog/`](data/changelog/) | Field-level diffs of every daily data update |
| [`CHANGELOG.md`](CHANGELOG.md) | Rolling record of what changed in the dataset |
| [`scripts/scrape_ssk.py`](scripts/scrape_ssk.py) | Reproducible scraper + validator |
| [`web/`](web/) | Next.js + shadcn/ui web app (search, filters, shortlist) |

## Web app

A fast, fully static, SEO-optimized browsing experience in **English and Hindi**:

- **Fuzzy search** across title, description, organization, theme and PS number
  (⌘K / Ctrl+K command palette, `/` focuses search)
- **Filters** by theme, category (Software/Hardware), organization, dataset availability
- **Detail pages** with deadline countdowns, similar statements, share on
  WhatsApp, copy as Markdown, open-in-chat and private notes
- **Shortlist** (stored in your browser) with CSV/Markdown export and WhatsApp sharing
- Branded OG cards for every statement when shared on social media
- Dark mode, keyboard navigation, mobile-first, fully accessible

### Local development

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build      # fully static, 461 prerendered pages
npm run lint
```

## Dataset stats

| Metric | Value |
|---|---|
| Total problem statements | 229 |
| Software | 175 |
| Hardware | 54 |
| Themes | 17 |
| Organizations | 30 |
| Source | [ssk.gov.in/ssk2026PS](https://ssk.gov.in/ssk2026PS) |

## Automated daily refresh

A [GitHub Actions workflow](.github/workflows/refresh-data.yml) re-scrapes
ssk.gov.in **every 24 hours** (04:00 IST) and automatically:

1. Updates the markdown, JSON and CSV exports with the latest deadlines,
   submitted-idea counts, dataset links and any new/changed statements
2. Writes a field-level diff of what changed to `data/changelog/<date>.md` and
   prepends it to [CHANGELOG.md](CHANGELOG.md) (added/removed/updated statements
   with old -> new values per field)
3. Validates the result (record count sanity check + field validation) - if the
   scrape looks incomplete, nothing is committed
4. Commits and pushes only when the data actually changed, so there are no
   noisy commits

Every PR and push is also checked by the [CI workflow](.github/workflows/ci.yml)
(dataset validation + lint + typecheck + build).

## Regenerating the data yourself

```bash
python3 scripts/scrape_ssk.py             # fetch live + regenerate everything
python3 scripts/scrape_ssk.py --validate  # validate existing artifacts
python3 scripts/scrape_ssk.py --cache FILE.html  # parse a cached copy offline
```

Requires `beautifulsoup4` + `lxml`.

## License & attribution

- **Dataset** (problem statement content): [CC BY 4.0](LICENSE) - content is
  published by ssk Innovathon / Innovation Cell, Government of India.
  Attribution: "Source: ssk Innovathon, ssk.gov.in".
- **Code** (scraper, web app): [MIT](LICENSE-CODE).

> **Note:** Deadlines and submitted-idea counts are point-in-time snapshots and
> may change on ssk.gov.in. Always verify on the official portal before
> submitting.

## Contributing

Found incorrect data or have an idea? See [CONTRIBUTING.md](CONTRIBUTING.md)
and the [issue templates](.github/ISSUE_TEMPLATE/).

## Disclaimer

This is an unofficial, community-maintained archive. It is not affiliated with,
endorsed by, or sponsored by ssk Innovathon or the Government of India.
