import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuditData } from "@/lib/store";

const compareSchema = z.object({
  baselineScanId: z.string().min(1),
  currentScanId: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = compareSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid scan comparison." }, { status: 400 });
  const data = await getAuditData();
  const baseline = data.findings.filter((finding) => finding.scanId === parsed.data.baselineScanId);
  const current = data.findings.filter((finding) => finding.scanId === parsed.data.currentScanId);
  const baselineKeys = new Set(baseline.map((finding) => finding.issueKey + finding.selector));
  const currentKeys = new Set(current.map((finding) => finding.issueKey + finding.selector));
  return NextResponse.json({
    newIssues: current.filter((finding) => !baselineKeys.has(finding.issueKey + finding.selector)),
    resolvedIssues: baseline.filter((finding) => !currentKeys.has(finding.issueKey + finding.selector)),
    recurringIssues: current.filter((finding) => baselineKeys.has(finding.issueKey + finding.selector))
  });
}
