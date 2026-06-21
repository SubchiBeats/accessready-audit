# Access Audit

Access Audit is a production-minded accessibility audit assistant for WCAG, ADA, and Section 508 work. It combines automated browser scanning, axe-core, rendered-DOM crawling, keyboard exploration, visual/manual-review flags, remediation guidance, historical tracking, and exportable reports.

Automated scanning alone does not prove ADA, WCAG, or Section 508 compliance. Access Audit helps teams identify issues and organize evidence, but final legal compliance requires expert review and, ideally, testing with disabled users and assistive technology users.

## Features

- Dashboard with project scores, open critical issues, scan history, and trend charts.
- Project setup for single URL, bulk URLs, sitemap import, crawl depth, max pages, include/exclude patterns, and safe-crawling controls.
- WCAG 2.2 A/AA primary mode, WCAG 2.1 AA mode, Section 508 mode, and custom mode.
- Playwright Chromium scanner with rendered link discovery, desktop/mobile viewports, screenshots, DOM snapshots, raw axe JSON, and normalized findings.
- axe-core integration plus custom checks for headings, landmarks, skip links, media, PDFs, target size, CAPTCHA flags, and more.
- Keyboard explorer that records focus order, focus visibility risks, likely traps, and focus screenshots.
- Findings workspace with severity/status filters, WCAG mappings, selectors, snippets, reproduction steps, fix guidance, and status tracking.
- Manual POUR review workflow with notes, evidence metadata, assignees, priority, due dates, and remediation status.
- Explainable scoring: risk score, WCAG A/AA pass estimates, blockers, templates affected, manual review completion, and confidence.
- Reports: executive PDF, technical PDF, CSV, raw JSON, remediation checklist, and VPAT/ACR draft support.
- Demo data so reviewers can understand the product immediately.
- Supabase schema and RLS policies for production persistence.
- Static GitHub Pages demo in `/github-pages` so the project has a shareable mobile-friendly live link.

## Screenshots

Add screenshots after the first local run:

- `docs/assets/dashboard.png`
- `docs/assets/findings.png`
- `docs/assets/manual-review.png`
- `docs/assets/report-export.png`
- `docs/assets/mobile-demo.png`

The UI is built with demo data, so these screens are available immediately after `pnpm dev`.

## Tech Stack

- Next.js, React, TypeScript
- Tailwind CSS
- Playwright and axe-core
- Zod validation
- Supabase-ready PostgreSQL schema and Auth/RLS model
- Local JSON demo persistence
- Vitest and Playwright tests

## Run Locally

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`.

Local demo data is stored in `.access-audit/data.json` and artifacts are stored in `.access-audit/artifacts`.

## Live GitHub Pages Demo

This repo includes a mobile-friendly static demo that can be hosted directly by GitHub Pages:

```text
https://YOUR_USERNAME.github.io/access-audit/
```

To publish it:

1. Push this repository to GitHub.
2. In repository **Settings > Pages**, set **Build and deployment** to **GitHub Actions**.
3. Run the `Deploy GitHub Pages Demo` workflow or push to `main`.

The GitHub Pages demo supports dashboard review, finding filters, status changes, manual checklist updates, and CSV/JSON exports in the browser. Real Playwright scans, API routes, Supabase Auth, evidence uploads, and PDF generation require the full server deployment.

## Full Production Deployment

Deploy the Next.js app to a Node host such as Vercel, Render, Fly.io, Railway, or a container platform. Use Supabase for auth/database/storage and a durable worker queue for Playwright scans. See `docs/deployment.md`.

Recommended hands-off path:

1. Create a Supabase project.
2. Connect this GitHub repo to Railway.
3. Add a Railway Redis service.
4. Deploy one Railway service as `web` with `pnpm start:web`.
5. Deploy one Railway service as `worker` with `pnpm start:worker`.
6. Paste the Supabase env vars into both services.

The app automatically uses BullMQ when `REDIS_URL` exists and falls back to an in-process queue for local demo mode.

## Environment Variables

See `.env.example`.

Important values:

- `NEXT_PUBLIC_DEMO_MODE=true`
- `ACCESS_AUDIT_ALLOW_PRIVATE_NETWORK=false`
- `ACCESS_AUDIT_MAX_PAGES=30`
- `ACCESS_AUDIT_SCAN_CONCURRENCY=1`
- `ACCESS_AUDIT_RATE_LIMIT_MS=750`

Keep `.env` out of git.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/rls.sql`.
4. Enable Supabase Auth providers.
5. Create a private storage bucket for evidence and scan artifacts.
6. Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The current app defaults to local JSON persistence. Swap the store implementation with Supabase queries for hosted production.

## Tests

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm accessibility:self-check
```

The test suite covers scoring, WCAG mappings, SSRF URL validation, scan normalization, dashboard flows, and axe self-checks.

## Running a Scan

1. Open **New Scan**.
2. Add a project URL or bulk list.
3. Choose WCAG/ADA/Section 508 mode.
4. Configure crawl depth, page limit, rate limit, and include/exclude patterns.
5. Confirm you own or have permission to test the site.
6. Start the scan from the project page.

## Security Limitations

- Local demo mode is not a hardened multi-tenant deployment.
- Use isolated scanner workers for production.
- Store credentials in a secret manager.
- Keep private-network scanning disabled except controlled local development.
- Add quotas and audit logs before offering scans to external users.

## Roadmap

- Supabase store adapter and storage uploads.
- BullMQ/Redis worker mode.
- Authenticated crawl recipes.
- Component/template fingerprinting improvements.
- Visual focus-order map overlay.
- PDF accessibility analyzer integration.
- Screen reader test protocol templates.
- GitHub issue/Jira export.

## GitHub Upload

```bash
git init
git add .
git commit -m "Initial commit: Access Audit"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/access-audit.git
git push -u origin main
```

HTTPS alternative:

```bash
git remote add origin https://github.com/YOUR_USERNAME/access-audit.git
git push -u origin main
```

Add screenshots/GIFs, enable GitHub Actions, and use topics such as `accessibility`, `wcag`, `ada-compliance`, `section508`, `axe-core`, `playwright`, `nextjs`, and `supabase`.

## License

MIT
