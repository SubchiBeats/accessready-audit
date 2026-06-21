import { RemediationPanel } from "@/components/remediation-panel";
import { getAuditData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function RemediationPage() {
  const data = await getAuditData();
  return <RemediationPanel findings={data.findings} tasks={data.remediationTasks} />;
}
