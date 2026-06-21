import { ArrowRight, Clock, FileWarning, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { AuditData, Project } from "@/lib/types";
import { complianceDisclaimer, complianceModeLabels } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SeverityChip } from "@/components/ui/status-chip";
import { ScoreCards } from "@/components/score-card";
import { TrendChart } from "@/components/trend-chart";

export function Dashboard({ data }: { data: AuditData }) {
  const latestProject = data.projects[0];
  const latestScan = latestProject
    ? data.scans.find((scan) => scan.projectId === latestProject.id && scan.status === "completed") ?? data.scans[0]
    : undefined;
  const openCritical = data.findings.filter((finding) => finding.severity === "critical" && finding.status !== "fixed");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Audit command center</p>
          <h1 className="mt-2 text-3xl font-bold text-graphite-950 dark:text-white">Accessibility risk dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-700 dark:text-graphite-300">{complianceDisclaimer}</p>
        </div>
        <ButtonLink href="/projects/new">
          New Scan
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </div>

      {latestScan ? <ScoreCards summary={latestScan.summary} /> : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Projects</h2>
                <p className="text-sm text-graphite-600 dark:text-graphite-400">Current coverage, latest scan status, and selected standard.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-graphite-200 text-xs uppercase text-graphite-600 dark:border-graphite-800 dark:text-graphite-400">
                  <th className="py-2 pr-3">Project</th>
                  <th className="px-3 py-2">Standard</th>
                  <th className="px-3 py-2">Latest score</th>
                  <th className="px-3 py-2">Open critical</th>
                  <th className="px-3 py-2">Last scan</th>
                  <th className="py-2 pl-3">Open</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map((project) => (
                  <ProjectRow key={project.id} project={project} data={data} />
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Score Trend</h2>
            <p className="text-sm text-graphite-600 dark:text-graphite-400">Risk score history across completed scans.</p>
          </CardHeader>
          <CardBody>
            <TrendChart scans={data.scans.filter((scan) => scan.status === "completed")} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-risk-critical" aria-hidden="true" />
              <h2 className="text-lg font-bold">Open Critical Issues</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {openCritical.length ? (
              openCritical.map((finding) => (
                <Link
                  href={`/findings?finding=${finding.id}`}
                  key={finding.id}
                  className="block rounded-md border border-graphite-200 p-3 hover:bg-graphite-50 dark:border-graphite-800 dark:hover:bg-graphite-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{finding.title}</p>
                      <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">{finding.componentName ?? finding.selector}</p>
                    </div>
                    <SeverityChip severity={finding.severity} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-graphite-600 dark:text-graphite-400">No open critical blockers in demo data.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
              <h2 className="text-lg font-bold">Recent Scan History</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {data.scans.slice(0, 5).map((scan) => {
              const project = data.projects.find((item) => item.id === scan.projectId);
              return (
                <Link
                  href={`/projects/${scan.projectId}/scans/${scan.id}`}
                  key={scan.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-graphite-200 p-3 hover:bg-graphite-50 dark:border-graphite-800 dark:hover:bg-graphite-800"
                >
                  <span>
                    <span className="block font-semibold">{project?.name ?? "Unknown project"}</span>
                    <span className="block text-sm text-graphite-600 dark:text-graphite-400">{formatDateTime(scan.completedAt ?? scan.createdAt)}</span>
                  </span>
                  <span className="text-right text-sm font-semibold">{scan.summary.riskScore}</span>
                </Link>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ProjectRow({ project, data }: { project: Project; data: AuditData }) {
  const scans = data.scans.filter((scan) => scan.projectId === project.id);
  const latest = scans[0];
  const critical = data.findings.filter((finding) => finding.projectId === project.id && finding.severity === "critical" && finding.status !== "fixed").length;
  return (
    <tr className="border-b border-graphite-100 dark:border-graphite-800">
      <td className="py-3 pr-3">
        <span className="block font-semibold">{project.name}</span>
        <span className="block text-xs text-graphite-600 dark:text-graphite-400">{project.primaryUrl}</span>
      </td>
      <td className="px-3 py-3">{complianceModeLabels[project.complianceMode]}</td>
      <td className="px-3 py-3 font-semibold">{latest?.summary.riskScore ?? "No scans"}</td>
      <td className="px-3 py-3">{critical}</td>
      <td className="px-3 py-3">{latest ? formatDateTime(latest.completedAt ?? latest.createdAt) : "Never"}</td>
      <td className="py-3 pl-3">
        <Link className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-200" href={`/projects/${project.id}`}>
          Open
        </Link>
      </td>
    </tr>
  );
}
