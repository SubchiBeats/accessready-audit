# GitHub Upload

Suggested repository name: `access-audit`

```bash
git init
git add .
git commit -m "Initial commit: Access Audit"
```

Create a GitHub repo named `access-audit`, then use SSH:

```bash
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/access-audit.git
git push -u origin main
```

HTTPS alternative:

```bash
git remote add origin https://github.com/YOUR_USERNAME/access-audit.git
git push -u origin main
```

Before pushing:

- Keep `.env.example` committed.
- Never commit `.env`.
- Add screenshots or GIFs of dashboard, findings, manual review, and reports.
- Enable GitHub Actions.
- Use topics: `accessibility`, `wcag`, `ada-compliance`, `section508`, `axe-core`, `playwright`, `nextjs`, `supabase`.
- Suggested description: `Explainable WCAG/ADA/Section 508 accessibility audit assistant with Playwright, axe-core, manual review workflows, and exportable reports.`

## Live GitHub Pages Link

This repository includes a static mobile-friendly demo under `/github-pages` and a deployment workflow at `.github/workflows/pages.yml`.

After pushing:

1. Go to repository **Settings**.
2. Open **Pages**.
3. Set **Build and deployment** to **GitHub Actions**.
4. Run or wait for the `Deploy GitHub Pages Demo` workflow.
5. Share:

```text
https://YOUR_USERNAME.github.io/access-audit/
```

GitHub Pages hosts the demo workflow and export UI. The real Playwright scanner requires a Node deployment such as Vercel, Render, Fly.io, Railway, or a container host.
