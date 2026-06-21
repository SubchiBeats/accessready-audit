import { NextResponse } from "next/server";
import { getAuditData } from "@/lib/store";
import { buildReportHtml } from "@/lib/reports/report-builder";

export async function GET(_: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const data = await getAuditData();
  const report = data.reports.find((item) => item.id === reportId);
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  const project = data.projects.find((item) => item.id === report.projectId);
  const scan = data.scans.find((item) => item.id === report.scanId);
  if (!project || !scan) return NextResponse.json({ error: "Report project or scan is missing." }, { status: 404 });

  const html = buildReportHtml({
    data,
    project,
    scan,
    kind: report.kind === "technical-pdf" ? "technical" : report.kind === "vpat-draft" ? "vpat-draft" : "executive"
  });

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0.5in", bottom: "0.5in", left: "0.45in", right: "0.45in" }
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${report.id}.pdf"`
      }
    });
  } finally {
    await browser.close();
  }
}
