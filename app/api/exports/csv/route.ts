import { findingsToCsv } from "@/lib/exports";
import { getAuditData } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const data = await getAuditData();
  const findings = projectId ? data.findings.filter((finding) => finding.projectId === projectId) : data.findings;
  const csv = findingsToCsv(findings);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=\"accessaudit-findings.csv\""
    }
  });
}
