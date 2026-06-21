import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createDemoData } from "@/lib/demo-data";
import { calculateScoreSummary } from "@/lib/scoring";
import type {
  AuditData,
  Finding,
  FindingStatus,
  ManualCheck,
  ManualStatus,
  Project,
  Report,
  Scan,
  ScanConfig
} from "@/lib/types";
import { TOOL_VERSION } from "@/lib/constants";

const dataDir = path.join(process.cwd(), ".accessaudit");
const dataPath = path.join(dataDir, "data.json");

let memoryCache: AuditData | undefined;

export async function getAuditData(): Promise<AuditData> {
  if (memoryCache) return structuredClone(memoryCache);
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(dataPath, "utf8");
    memoryCache = JSON.parse(raw) as AuditData;
  } catch {
    memoryCache = createDemoData();
    await writeAuditData(memoryCache);
  }
  return structuredClone(memoryCache);
}

export async function writeAuditData(data: AuditData) {
  memoryCache = structuredClone(data);
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");
}

export async function createProject(input: {
  name: string;
  primaryUrl: string;
  complianceMode: Project["complianceMode"];
  urls: string[];
  crawlDepth: number;
  maxPages: number;
  includePatterns: string[];
  excludePatterns: string[];
  sitemapUrl?: string;
  sameDomainOnly: boolean;
  rateLimitMs: number;
  auth?: ScanConfig["auth"];
}) {
  const data = await getAuditData();
  const now = new Date().toISOString();
  const primaryHost = new URL(input.primaryUrl).hostname;
  const project: Project = {
    id: `project-${randomUUID()}`,
    organizationId: data.organizations[0]?.id ?? "org-demo",
    name: input.name,
    primaryUrl: input.primaryUrl,
    complianceMode: input.complianceMode,
    allowedDomains: [primaryHost],
    tags: [],
    createdAt: now,
    updatedAt: now,
    responsibleUseAcceptedAt: now
  };
  const config: ScanConfig = {
    id: `config-${randomUUID()}`,
    projectId: project.id,
    urls: input.urls.length ? input.urls : [input.primaryUrl],
    crawlDepth: input.crawlDepth,
    maxPages: input.maxPages,
    scanMode: input.complianceMode,
    includePatterns: input.includePatterns,
    excludePatterns: input.excludePatterns,
    sitemapUrl: input.sitemapUrl,
    sameDomainOnly: input.sameDomainOnly,
    desktopViewport: { width: 1440, height: 1000 },
    mobileViewport: { width: 390, height: 844 },
    responsiveWidths: [320, 390, 768, 1024, 1440],
    rateLimitMs: input.rateLimitMs,
    auth: input.auth,
    createdAt: now,
    updatedAt: now
  };

  data.projects.unshift(project);
  data.scanConfigs.unshift(config);
  await writeAuditData(data);
  return { project, config };
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  const data = await getAuditData();
  const index = data.projects.findIndex((project) => project.id === projectId);
  if (index === -1) return undefined;
  data.projects[index] = { ...data.projects[index], ...updates, updatedAt: new Date().toISOString() };
  await writeAuditData(data);
  return data.projects[index];
}

export async function createScan(projectId: string, configId?: string) {
  const data = await getAuditData();
  const config = data.scanConfigs.find((item) => item.id === configId || item.projectId === projectId);
  if (!config) throw new Error("Scan configuration not found.");
  const now = new Date().toISOString();
  const scan: Scan = {
    id: `scan-${randomUUID()}`,
    projectId,
    configId: config.id,
    status: "queued",
    pagesScanned: 0,
    urlsQueued: config.urls.length,
    toolVersion: TOOL_VERSION,
    summary: calculateScoreSummary({ findings: [], manualChecks: [], pagesScanned: 0 }),
    createdAt: now
  };
  data.scans.unshift(scan);
  await writeAuditData(data);
  return scan;
}

export async function updateScan(scanId: string, updates: Partial<Scan>) {
  const data = await getAuditData();
  const index = data.scans.findIndex((scan) => scan.id === scanId);
  if (index === -1) return undefined;
  data.scans[index] = { ...data.scans[index], ...updates };
  await writeAuditData(data);
  return data.scans[index];
}

export async function updateFindingStatus(findingId: string, status: FindingStatus) {
  const data = await getAuditData();
  const finding = data.findings.find((item) => item.id === findingId);
  if (!finding) return undefined;
  finding.status = status;
  finding.lastSeenAt = new Date().toISOString();
  await recomputeProjectScans(data, finding.projectId);
  await writeAuditData(data);
  return finding;
}

export async function upsertManualCheck(input: {
  id: string;
  status?: ManualStatus;
  notes?: string;
  assignee?: string;
  priority?: ManualCheck["priority"];
  dueDate?: string;
  remediationStatus?: ManualCheck["remediationStatus"];
}) {
  const data = await getAuditData();
  const check = data.manualChecks.find((item) => item.id === input.id);
  if (!check) return undefined;
  Object.assign(check, {
    status: input.status ?? check.status,
    notes: input.notes ?? check.notes,
    assignee: input.assignee ?? check.assignee,
    priority: input.priority ?? check.priority,
    dueDate: input.dueDate ?? check.dueDate,
    remediationStatus: input.remediationStatus ?? check.remediationStatus,
    updatedAt: new Date().toISOString()
  });
  await recomputeProjectScans(data, check.projectId);
  await writeAuditData(data);
  return check;
}

export async function addReport(input: Omit<Report, "id" | "generatedAt">) {
  const data = await getAuditData();
  const report: Report = {
    ...input,
    id: `report-${randomUUID()}`,
    generatedAt: new Date().toISOString()
  };
  data.reports.unshift(report);
  await writeAuditData(data);
  return report;
}

export async function appendScanResults(params: {
  scan: Scan;
  findings: Finding[];
  manualChecks?: ManualCheck[];
  pages: AuditData["scannedPages"];
  instances: AuditData["findingInstances"];
}) {
  const data = await getAuditData();
  data.scannedPages.unshift(...params.pages);
  data.findingInstances.unshift(...params.instances);
  data.findings.unshift(...mergeNewFindings(data.findings, params.findings));
  if (params.manualChecks?.length) data.manualChecks.unshift(...params.manualChecks);
  const scanIndex = data.scans.findIndex((scan) => scan.id === params.scan.id);
  const summary = calculateScoreSummary({
    findings: data.findings.filter((finding) => finding.scanId === params.scan.id),
    manualChecks: data.manualChecks.filter((check) => check.scanId === params.scan.id || check.projectId === params.scan.projectId),
    pagesScanned: params.pages.length
  });
  if (scanIndex >= 0) {
    data.scans[scanIndex] = {
      ...data.scans[scanIndex],
      status: "completed",
      completedAt: new Date().toISOString(),
      pagesScanned: params.pages.length,
      summary
    };
  }
  await writeAuditData(data);
}

export async function getProjectBundle(projectId: string) {
  const data = await getAuditData();
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) return undefined;
  return {
    data,
    project,
    config: data.scanConfigs.find((item) => item.projectId === projectId),
    scans: data.scans.filter((item) => item.projectId === projectId),
    findings: data.findings.filter((item) => item.projectId === projectId),
    instances: data.findingInstances.filter((item) => item.projectId === projectId),
    manualChecks: data.manualChecks.filter((item) => item.projectId === projectId),
    reports: data.reports.filter((item) => item.projectId === projectId)
  };
}

async function recomputeProjectScans(data: AuditData, projectId: string) {
  for (const scan of data.scans.filter((item) => item.projectId === projectId)) {
    scan.summary = calculateScoreSummary({
      findings: data.findings.filter((finding) => finding.scanId === scan.id || finding.projectId === projectId),
      manualChecks: data.manualChecks.filter((check) => check.scanId === scan.id || check.projectId === projectId),
      pagesScanned: scan.pagesScanned
    });
  }
}

function mergeNewFindings(existing: Finding[], incoming: Finding[]) {
  const existingKeys = new Set(existing.map((finding) => `${finding.projectId}:${finding.issueKey}:${finding.selector ?? ""}`));
  return incoming.filter((finding) => !existingKeys.has(`${finding.projectId}:${finding.issueKey}:${finding.selector ?? ""}`));
}
