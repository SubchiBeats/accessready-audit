import { NextResponse } from "next/server";
import { getAuditData } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const scanId = searchParams.get("scanId");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.toLowerCase();
  const data = await getAuditData();
  let findings = data.findings;
  if (projectId) findings = findings.filter((finding) => finding.projectId === projectId);
  if (scanId) findings = findings.filter((finding) => finding.scanId === scanId);
  if (severity) findings = findings.filter((finding) => finding.severity === severity);
  if (status) findings = findings.filter((finding) => finding.status === status);
  if (query) {
    findings = findings.filter((finding) =>
      [finding.title, finding.issueKey, finding.selector, finding.description, ...finding.wcag.map((ref) => ref.criterion)]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  }
  return NextResponse.json({ findings, instances: data.findingInstances });
}
