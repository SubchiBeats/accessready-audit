# Railway Setup Checklist

This is the shortest path to a real hosted Access Audit scanner.

## You Do Once

1. Create a Supabase project.
2. In Supabase SQL Editor, paste the contents of `outputs/access-audit-supabase-setup.txt`.
3. Click **Run** and confirm it says success.
4. In Supabase Storage, create a private bucket named `access-audit-artifacts`.
5. Copy these values:
   - Supabase project URL.
   - Supabase anon key.
   - Supabase service role key.

## Railway Setup

1. Create a Railway project.
2. Add service from GitHub repo: `SubchiBeats/access-audit`.
3. Name it `access-audit-web`.
4. Add Redis service.
5. Add a second service from the same GitHub repo.
6. Name it `access-audit-worker`.

## Web Service

Start command:

```bash
npm run start:web
```

Environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://YOUR-WEB-SERVICE.up.railway.app
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
ACCESS_AUDIT_STORAGE_BUCKET=access-audit-artifacts
REDIS_URL=${{access-audit-redis.REDIS_URL}}
ACCESS_AUDIT_ALLOW_PRIVATE_NETWORK=false
ACCESS_AUDIT_MAX_PAGES=30
ACCESS_AUDIT_SCAN_CONCURRENCY=1
ACCESS_AUDIT_RATE_LIMIT_MS=750
```

## Worker Service

Start command:

```bash
npm run start:worker
```

Use the same environment variables as the web service.

## Plain English

The web service is the front desk. It takes user requests and puts scan jobs into Redis. The worker service is the back room. It picks up those jobs and runs the browser scanner. Supabase is the filing cabinet for users, projects, findings, reports, and evidence.
