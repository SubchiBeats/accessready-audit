import { NextResponse } from "next/server";
import { projectCreateSchema } from "@/lib/api-validation";
import { getAuditData, createProject } from "@/lib/store";
import { validateScanUrl } from "@/lib/security/url-validation";

export async function GET() {
  const data = await getAuditData();
  return NextResponse.json({ projects: data.projects });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project input.", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.responsibleUseAccepted) {
    return NextResponse.json({ error: "Responsible-use acknowledgement is required." }, { status: 400 });
  }

  const allowPrivateNetwork = process.env.ACCESS_AUDIT_ALLOW_PRIVATE_NETWORK === "true";
  const primary = validateScanUrl(parsed.data.primaryUrl, { allowPrivateNetwork });
  if (!primary.ok) return NextResponse.json({ error: primary.reason }, { status: 400 });

  const allowedDomains = [primary.hostname];
  const urls = [];
  for (const url of parsed.data.urls) {
    const validation = validateScanUrl(url, {
      allowPrivateNetwork,
      allowedDomains: parsed.data.sameDomainOnly ? allowedDomains : undefined
    });
    if (!validation.ok) {
      return NextResponse.json({ error: `${url}: ${validation.reason}` }, { status: 400 });
    }
    urls.push(validation.url);
  }

  if (parsed.data.sitemapUrl) {
    const sitemap = validateScanUrl(parsed.data.sitemapUrl, {
      allowPrivateNetwork,
      allowedDomains: parsed.data.sameDomainOnly ? allowedDomains : undefined
    });
    if (!sitemap.ok) return NextResponse.json({ error: `Sitemap URL: ${sitemap.reason}` }, { status: 400 });
  }

  const { project, config } = await createProject({
    name: parsed.data.name,
    primaryUrl: primary.url,
    complianceMode: parsed.data.complianceMode,
    urls,
    crawlDepth: parsed.data.crawlDepth,
    maxPages: parsed.data.maxPages,
    includePatterns: parsed.data.includePatterns,
    excludePatterns: parsed.data.excludePatterns,
    sitemapUrl: parsed.data.sitemapUrl || undefined,
    sameDomainOnly: parsed.data.sameDomainOnly,
    rateLimitMs: parsed.data.rateLimitMs,
    auth: parsed.data.auth
      ? {
          loginUrl: parsed.data.auth.loginUrl || undefined,
          username: parsed.data.auth.username,
          hasStoredSecret: Boolean(parsed.data.auth.passwordProvided),
          cookieImportLabel: parsed.data.auth.cookieImportLabel
        }
      : undefined
  });

  return NextResponse.json({ project, config }, { status: 201 });
}
