# Architecture

AccessAudit uses a local-first architecture for demos and a Supabase-ready data model for production.

## Application

- Next.js App Router with TypeScript.
- React server components for data-backed pages.
- Client components for filters, status updates, theme switching, manual review, and report generation.
- Tailwind CSS for accessible, high-contrast UI.
- A separate `/github-pages` static demo provides a shareable mobile-friendly GitHub Pages link without requiring a server.

## Scanner

- Playwright opens Chromium pages.
- axe-core is injected into each rendered page.
- Custom checks run in the browser context.
- Keyboard explorer records focus order and focus screenshots.
- Raw artifacts are saved under `.accessaudit/artifacts`.

## Persistence

- Local demo/dev mode persists JSON in `.accessaudit/data.json`.
- Supabase schema and RLS policies are provided in `/supabase`.
- Storage paths are modeled for screenshots, DOM snapshots, axe JSON, reports, and uploaded evidence.

## Background Jobs

The current implementation includes an in-process queue for local development. Production deployments should use BullMQ with Redis, a durable worker, or a managed job runner.

## Deployment Split

- GitHub Pages: static demo, status tracking in browser storage, CSV/JSON export, mobile portfolio link.
- Node production host: real scans, API routes, PDF generation, Supabase persistence, evidence uploads, Playwright workers.
