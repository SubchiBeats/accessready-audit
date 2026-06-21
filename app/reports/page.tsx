import { ReportsWorkspace } from "@/components/reports-workspace";
import { getAuditData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const data = await getAuditData();
  return <ReportsWorkspace projects={data.projects} scans={data.scans} reports={data.reports} />;
}
