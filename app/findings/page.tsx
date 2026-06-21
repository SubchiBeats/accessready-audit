import { FindingsWorkspace } from "@/components/findings-table";
import { getAuditData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function FindingsPage({
  searchParams
}: {
  searchParams: Promise<{ finding?: string }>;
}) {
  const params = await searchParams;
  const data = await getAuditData();
  return (
    <FindingsWorkspace
      findings={data.findings}
      instances={data.findingInstances}
      projects={data.projects}
      initialFindingId={params.finding}
    />
  );
}
