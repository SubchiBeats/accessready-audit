# Deployment

AccessAudit has two deployment targets.

## GitHub Pages Live Demo

GitHub Pages can host the static demo in `/github-pages`. This is the link you can share from your GitHub repository and open on mobile:

```text
https://YOUR_USERNAME.github.io/accessready-audit/
```

The static demo supports:

- Mobile dashboard.
- Demo score trend.
- Finding filters and status changes saved in browser storage.
- Manual review checklist status changes.
- CSV and JSON export.
- Responsible-use and compliance limitations.

It does not run real Playwright scans, API routes, Supabase auth, evidence uploads, or PDF rendering. GitHub Pages cannot run Node server code or background browser workers.

### Enable Pages

1. Push the repository to GitHub.
2. Open the repository settings.
3. Go to **Pages**.
4. Set **Build and deployment** to **GitHub Actions**.
5. Push to `main` or run the `Deploy GitHub Pages Demo` workflow manually.
6. Open the URL from the workflow summary.

## Full Production Scanner

Deploy the full Next.js app to a Node host such as Vercel, Render, Fly.io, Railway, or a container platform.

Production services:

- Next.js web app and API routes.
- Supabase Auth, Postgres, RLS, and Storage.
- A scanner worker that can run Playwright Chromium.
- Redis/BullMQ or another durable queue for long-running scans.
- Artifact storage for screenshots, DOM snapshots, raw axe JSON, and reports.

Recommended environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ACCESSAUDIT_ALLOW_PRIVATE_NETWORK=false
ACCESSAUDIT_MAX_PAGES=30
ACCESSAUDIT_SCAN_CONCURRENCY=1
ACCESSAUDIT_RATE_LIMIT_MS=750
```

Keep real scanning behind authentication, quotas, rate limits, and responsible-use terms.
