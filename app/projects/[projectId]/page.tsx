import { notFound } from "next/navigation";
import { ProjectOverview } from "@/components/project-overview";
import { getProjectBundle } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const bundle = await getProjectBundle(projectId);
  if (!bundle) notFound();

  return (
    <ProjectOverview
      project={bundle.project}
      config={bundle.config}
      scans={bundle.scans}
      findings={bundle.findings}
      manualChecks={bundle.manualChecks}
    />
  );
}
