import { NextResponse } from "next/server";
import { getAuditData, writeAuditData } from "@/lib/store";
import { projectCreateSchema } from "@/lib/api-validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = projectCreateSchema.partial({ name: true, primaryUrl: true, responsibleUseAccepted: true }).safeParse(body);
  if (!parsed.success || !body.projectId) {
    return NextResponse.json({ error: "Invalid scan configuration." }, { status: 400 });
  }

  const data = await getAuditData();
  const config = data.scanConfigs.find((item) => item.projectId === body.projectId);
  if (!config) return NextResponse.json({ error: "Scan configuration not found." }, { status: 404 });
  Object.assign(config, {
    urls: parsed.data.urls ?? config.urls,
    crawlDepth: parsed.data.crawlDepth ?? config.crawlDepth,
    maxPages: parsed.data.maxPages ?? config.maxPages,
    scanMode: parsed.data.complianceMode ?? config.scanMode,
    includePatterns: parsed.data.includePatterns ?? config.includePatterns,
    excludePatterns: parsed.data.excludePatterns ?? config.excludePatterns,
    sitemapUrl: parsed.data.sitemapUrl || config.sitemapUrl,
    sameDomainOnly: parsed.data.sameDomainOnly ?? config.sameDomainOnly,
    rateLimitMs: parsed.data.rateLimitMs ?? config.rateLimitMs,
    updatedAt: new Date().toISOString()
  });
  await writeAuditData(data);
  return NextResponse.json({ config });
}
