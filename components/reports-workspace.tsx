"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, FileJson, FileText, Plus } from "lucide-react";
import type { Project, Report, Scan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/forms";
import { formatDateTime } from "@/lib/utils";

export function ReportsWorkspace({
  projects,
  scans,
  reports
}: {
  projects: Project[];
  scans: Scan[];
  reports: Report[];
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const projectScans = scans.filter((scan) => scan.projectId === projectId);
  const [scanId, setScanId] = useState(projectScans[0]?.id ?? scans[0]?.id ?? "");
  const [kind, setKind] = useState<Report["kind"]>("executive-pdf");
  const selectedProject = projects.find((project) => project.id === projectId);

  async function generate() {
    if (!projectId || !scanId || !selectedProject) return;
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        projectId,
        scanId,
        kind,
        title: `${selectedProject.name} ${kind.replace("-", " ")}`
      })
    });
    if (response.ok) router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Reports</p>
        <h1 className="mt-2 text-3xl font-bold">Export audit evidence</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-700 dark:text-graphite-300">
          Generate executive summaries, technical reports, raw audit JSON, CSV exports, remediation checklists, and VPAT/ACR draft support.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Generate Report</h2>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <Label htmlFor="report-project">Project</Label>
            <Select
              id="report-project"
              value={projectId}
              onChange={(event) => {
                const nextProject = event.target.value;
                setProjectId(nextProject);
                setScanId(scans.find((scan) => scan.projectId === nextProject)?.id ?? "");
              }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="report-scan">Scan</Label>
            <Select id="report-scan" value={scanId} onChange={(event) => setScanId(event.target.value)}>
              {projectScans.map((scan) => (
                <option key={scan.id} value={scan.id}>
                  {scan.id} | {scan.status}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="report-kind">Report type</Label>
            <Select id="report-kind" value={kind} onChange={(event) => setKind(event.target.value as Report["kind"])}>
              <option value="executive-pdf">PDF executive summary</option>
              <option value="technical-pdf">Full technical PDF</option>
              <option value="developer-checklist">Developer remediation checklist</option>
              <option value="vpat-draft">VPAT/ACR preparation helper</option>
              <option value="csv">CSV findings export</option>
              <option value="json">JSON raw audit export</option>
            </Select>
          </div>
          <Button type="button" onClick={generate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Generate
          </Button>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Saved Reports</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col justify-between gap-3 rounded-md border border-graphite-200 p-3 dark:border-graphite-800 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">{report.title}</p>
                  <p className="text-sm text-graphite-600 dark:text-graphite-400">{report.kind.replace("-", " ")} | {formatDateTime(report.generatedAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.kind.includes("pdf") || report.kind === "vpat-draft" ? (
                    <ButtonLink href={`/api/reports/${report.id}/pdf`} variant="secondary">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      PDF
                    </ButtonLink>
                  ) : null}
                  <ButtonLink href={`/api/exports/json?projectId=${report.projectId}`} variant="ghost">
                    <FileJson className="h-4 w-4" aria-hidden="true" />
                    JSON
                  </ButtonLink>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">Quick Exports</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <ButtonLink href={`/api/exports/csv?projectId=${projectId}`} variant="secondary" className="w-full justify-start">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Download findings CSV
            </ButtonLink>
            <ButtonLink href={`/api/exports/json?projectId=${projectId}`} variant="secondary" className="w-full justify-start">
              <FileJson className="h-4 w-4" aria-hidden="true" />
              Download raw audit JSON
            </ButtonLink>
            <p className="text-sm leading-6 text-graphite-600 dark:text-graphite-400">
              VPAT/ACR output is preparation support only. A qualified accessibility professional must review final conformance claims.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
