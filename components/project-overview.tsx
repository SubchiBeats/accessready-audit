import { ExternalLink, FileSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Finding, ManualCheck, Project, Scan, ScanConfig } from "@/lib/types";
import { complianceModeLabels } from "@/lib/constants";
import { formatDateTime, formatPercent } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SeverityChip } from "@/components/ui/status-chip";
import { ScoreCards } from "@/components/score-card";
import { StartScanButton } from "@/components/start-scan-button";

export function ProjectOverview({
  project,
  config,
  scans,
  findings,
  manualChecks
}: {
  project: Project;
  config?: ScanConfig;
  scans: Scan[];
  findings: Finding[];
  manualChecks: ManualCheck[];
}) {
  const latest = scans[0];
  const open = findings.filter((finding) => !["fixed", "false-positive"].includes(finding.status));
  const completion = manualChecks.length
    ? Math.round((manualChecks.filter((check) => check.status !== "not-started").length / manualChecks.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Project</p>
          <h1 className="mt-2 text-3xl font-bold">{project.name}</h1>
          <a
            href={project.primaryUrl}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-200"
          >
            {project.primaryUrl}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        {config ? <StartScanButton projectId={project.id} configId={config.id} demo={project.id === "project-demo"} /> : null}
      </div>

      {latest ? <ScoreCards summary={latest.summary} /> : null}

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Scan Configuration</h2>
            <p className="text-sm text-graphite-600 dark:text-graphite-400">Current scope and crawling guardrails.</p>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            {config ? (
              <>
                <Info label="Mode" value={complianceModeLabels[config.scanMode]} />
                <Info label="Start URLs" value={String(config.urls.length)} />
                <Info label="Crawl depth" value={String(config.crawlDepth)} />
                <Info label="Max pages" value={String(config.maxPages)} />
                <Info label="Rate limit" value={`${config.rateLimitMs}ms`} />
                <Info label="Same-domain restriction" value={config.sameDomainOnly ? "Enabled" : "Disabled"} />
                <Info label="Sitemap" value={config.sitemapUrl ?? "Not configured"} />
              </>
            ) : (
              <p>No scan configuration found.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
              <h2 className="text-lg font-bold">Open Findings by Severity</h2>
            </div>
          </CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-5">
            {(["critical", "serious", "moderate", "minor", "needs-review"] as const).map((severity) => (
              <div key={severity} className="rounded-md border border-graphite-200 p-3 dark:border-graphite-800">
                <SeverityChip severity={severity} />
                <p className="mt-3 text-2xl font-bold">{open.filter((finding) => finding.severity === severity).length}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Scan History</h2>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-graphite-200 text-xs uppercase text-graphite-600 dark:border-graphite-800 dark:text-graphite-400">
                  <th className="py-2 pr-3">Scan</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Pages</th>
                  <th className="px-3 py-2">Completed</th>
                  <th className="py-2 pl-3">Open</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id} className="border-b border-graphite-100 dark:border-graphite-800">
                    <td className="py-3 pr-3 font-mono text-xs">{scan.id}</td>
                    <td className="px-3 py-3 capitalize">{scan.status}</td>
                    <td className="px-3 py-3 font-semibold">{scan.summary.riskScore}</td>
                    <td className="px-3 py-3">{scan.pagesScanned}</td>
                    <td className="px-3 py-3">{formatDateTime(scan.completedAt)}</td>
                    <td className="py-3 pl-3">
                      <Link href={`/projects/${project.id}/scans/${scan.id}`} className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-200">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
              <h2 className="text-lg font-bold">Manual Review</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Checklist completion</span>
                <span className="font-semibold">{formatPercent(completion)}</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-graphite-200 dark:bg-graphite-800">
                <div className="h-3 rounded-full bg-teal-700 dark:bg-teal-400" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {manualChecks.slice(0, 5).map((check) => (
                <li key={check.id} className="flex items-center justify-between gap-3 rounded-md border border-graphite-200 p-2 dark:border-graphite-800">
                  <span>{check.title}</span>
                  <span className="capitalize text-graphite-600 dark:text-graphite-400">{check.status.replace("-", " ")}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href="/manual-review" variant="secondary" className="w-full">
              Open Manual Review
            </ButtonLink>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-graphite-100 pb-2 dark:border-graphite-800">
      <dt className="font-semibold text-graphite-600 dark:text-graphite-400">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
