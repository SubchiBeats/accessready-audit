import type { AuditData, Finding } from "@/lib/types";

export function findingsToCsv(findings: Finding[]) {
  const headers = [
    "id",
    "title",
    "severity",
    "status",
    "confidence",
    "source",
    "wcag",
    "selector",
    "component",
    "template",
    "why_it_matters",
    "recommended_fix"
  ];
  const rows = findings.map((finding) => [
    finding.id,
    finding.title,
    finding.severity,
    finding.status,
    finding.confidence,
    finding.source,
    finding.wcag.map((ref) => `${ref.standard} ${ref.criterion} ${ref.name}`).join("; "),
    finding.selector ?? "",
    finding.componentName ?? "",
    finding.templateKey ?? "",
    finding.whyItMatters,
    finding.remediation.fix
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function buildRawAuditExport(data: AuditData, projectId?: string) {
  if (!projectId) return data;
  return {
    projects: data.projects.filter((project) => project.id === projectId),
    scanConfigs: data.scanConfigs.filter((config) => config.projectId === projectId),
    scans: data.scans.filter((scan) => scan.projectId === projectId),
    scannedPages: data.scannedPages.filter((page) => page.projectId === projectId),
    findings: data.findings.filter((finding) => finding.projectId === projectId),
    findingInstances: data.findingInstances.filter((instance) => instance.projectId === projectId),
    manualChecks: data.manualChecks.filter((check) => check.projectId === projectId),
    evidenceFiles: data.evidenceFiles.filter((file) => file.projectId === projectId),
    comments: data.comments.filter((comment) => comment.projectId === projectId),
    remediationTasks: data.remediationTasks.filter((task) => task.projectId === projectId),
    reports: data.reports.filter((report) => report.projectId === projectId)
  };
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
