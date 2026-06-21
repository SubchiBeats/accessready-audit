import { NextResponse } from "next/server";
import { scanStartSchema } from "@/lib/api-validation";
import { createScan, getAuditData, updateScan } from "@/lib/store";
import { enqueueScan } from "@/lib/scanner/queue";
import { calculateScoreSummary } from "@/lib/scoring";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const data = await getAuditData();
  const scans = projectId ? data.scans.filter((scan) => scan.projectId === projectId) : data.scans;
  return NextResponse.json({ scans });
}

export async function POST(request: Request) {
  const parsed = scanStartSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid scan request." }, { status: 400 });
  const scan = await createScan(parsed.data.projectId, parsed.data.configId);

  if (parsed.data.demo) {
    const data = await getAuditData();
    const findings = data.findings.filter((finding) => finding.projectId === parsed.data.projectId);
    const manualChecks = data.manualChecks.filter((check) => check.projectId === parsed.data.projectId);
    const pages = data.scannedPages.filter((page) => page.projectId === parsed.data.projectId);
    const summary = calculateScoreSummary({ findings, manualChecks, pagesScanned: pages.length });
    const updated = await updateScan(scan.id, {
      status: "completed",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      pagesScanned: pages.length,
      urlsQueued: pages.length,
      summary
    });
    return NextResponse.json({ scan: updated, job: { status: "completed" } }, { status: 202 });
  }

  const job = await enqueueScan(scan);
  return NextResponse.json({ scan, job }, { status: 202 });
}
