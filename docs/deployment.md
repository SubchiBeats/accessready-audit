# Deployment

Access Audit has two deployment targets.

## GitHub Pages Live Demo

GitHub Pages can host the static demo in `/github-pages`. This is the link you can share from your GitHub repository and open on mobile:

```text
https://YOUR_USERNAME.github.io/access-audit/
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
- Shared production state in Supabase through the `audit_state` table.

## Recommended Beginner Setup: Railway

Railway is the easiest path because the web service, worker service, and Redis service can live in one project.

### What You Create

- `access-audit-web`: the public Next.js dashboard/API.
- `access-audit-worker`: the private Playwright scanner worker.
- `access-audit-redis`: the queue that passes scan jobs from web to worker.
- Supabase: accounts, database, and storage.

### Railway Click Path

1. Open Railway and create a new project.
2. Choose **Deploy from GitHub repo**.
3. Select `SubchiBeats/access-audit`.
4. Railway will use the `Dockerfile`.
5. Name the first service `access-audit-web`.
6. Set its start command to:

```bash
pnpm start:web
```

7. Add a Redis service in the same Railway project.
8. Create a second service from the same GitHub repo.
9. Name it `access-audit-worker`.
10. Set its start command to:

```bash
pnpm start:worker
```

11. Add the environment variables below to both the web and worker services.

### Required Railway Variables

Railway Redis should provide `REDIS_URL`. Add or confirm:

```bash
REDIS_URL=${{Redis.REDIS_URL}}
NEXT_PUBLIC_APP_URL=https://your-railway-web-url.up.railway.app
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ACCESS_AUDIT_STORAGE_BUCKET=access-audit-artifacts
ACCESS_AUDIT_ALLOW_PRIVATE_NETWORK=false
ACCESS_AUDIT_MAX_PAGES=30
ACCESS_AUDIT_SCAN_CONCURRENCY=1
ACCESS_AUDIT_RATE_LIMIT_MS=750
```

### How It Works

When a user starts a scan, the web app creates a scan record and places a job in Redis. The worker picks up that job, opens Chromium with Playwright, runs axe/custom/keyboard checks, and stores the normalized findings.

If `REDIS_URL` is missing, Access Audit runs scans in-process. That is fine for local development but not recommended for production.

## Render Alternative

This repo includes `render.yaml`. In Render, create a Blueprint from the GitHub repo. It defines:

- a Docker web service,
- a Docker worker service,
- a Redis instance.

You still need to add Supabase credentials as environment variables.

Recommended environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ACCESS_AUDIT_ALLOW_PRIVATE_NETWORK=false
ACCESS_AUDIT_MAX_PAGES=30
ACCESS_AUDIT_SCAN_CONCURRENCY=1
ACCESS_AUDIT_RATE_LIMIT_MS=750
```

Keep real scanning behind authentication, quotas, rate limits, and responsible-use terms.
