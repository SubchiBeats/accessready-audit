import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuditData } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SeverityChip, StatusChip } from "@/components/ui/status-chip";
import { ScoreCards } from "@/components/score-card";

export const dynamic = "force-dynamic";

export default async function ScanDetailPage({
  params
}: {
  params: Promise<{ projectId: string; scanId: string }>;
}) {
  const { projectId, scanId } = await params;
  const data = await getAuditData();
  const project = data.projects.find((item) => item.id === projectId);
  const scan = data.scans.find((item) => item.id === scanId);
  if (!project || !scan) notFound();
  const pages = data.scannedPages.filter((page) => page.scanId === scan.id);
  const findings = data.findings.filter((finding) => finding.scanId === scan.id || finding.projectId === project.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Scan detail</p>
        <h1 className="mt-2 text-3xl font-bold">{project.name}</h1>
        <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">
          {scan.status} | Started {formatDateTime(scan.startedAt ?? scan.createdAt)} | Completed {formatDateTime(scan.completedAt)}
        </p>
      </div>
      <ScoreCards summary={scan.summary} />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Pages Scanned</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {pages.length ? (
              pages.map((page) => (
                <div key={page.id} className="rounded-md border border-graphite-200 p-3 text-sm dark:border-graphite-800">
                  <p className="font-semibold">{page.title || page.url}</p>
                  <p className="break-all text-graphite-600 dark:text-graphite-400">{page.url}</p>
                  <p className="mt-1 text-xs uppercase text-graphite-600 dark:text-graphite-400">{page.viewport} | HTTP {page.httpStatus ?? "unknown"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-graphite-600 dark:text-graphite-400">No page records yet. Running scans update here as they complete.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Findings in Scope</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {findings.slice(0, 10).map((finding) => (
              <Link
                key={finding.id}
                href={`/findings?finding=${finding.id}`}
                className="block rounded-md border border-graphite-200 p-3 hover:bg-graphite-50 dark:border-graphite-800 dark:hover:bg-graphite-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityChip severity={finding.severity} />
                  <StatusChip status={finding.status} />
                </div>
                <p className="mt-2 font-semibold">{finding.title}</p>
                <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">{finding.selector ?? finding.componentName}</p>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
