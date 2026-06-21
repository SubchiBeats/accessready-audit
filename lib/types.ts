export type ComplianceMode = "wcag22-aa" | "wcag21-aa" | "section508" | "custom";
export type Severity = "critical" | "serious" | "moderate" | "minor" | "needs-review";
export type Confidence = "high" | "medium" | "low";
export type FindingStatus =
  | "open"
  | "in-progress"
  | "needs-review"
  | "fixed"
  | "accepted-risk"
  | "false-positive";
export type ScanStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type ManualStatus = "pass" | "fail" | "not-applicable" | "not-started";
export type SourceType = "automated" | "keyboard" | "visual" | "manual" | "needs-review";
export type WcagPrinciple = "perceivable" | "operable" | "understandable" | "robust";

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  primaryUrl: string;
  complianceMode: ComplianceMode;
  allowedDomains: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  responsibleUseAcceptedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "owner" | "auditor" | "developer" | "viewer";
}

export interface AuthConfig {
  loginUrl?: string;
  username?: string;
  hasStoredSecret?: boolean;
  cookieImportLabel?: string;
}

export interface ScanConfig {
  id: string;
  projectId: string;
  urls: string[];
  crawlDepth: number;
  maxPages: number;
  scanMode: ComplianceMode;
  includePatterns: string[];
  excludePatterns: string[];
  sitemapUrl?: string;
  sameDomainOnly: boolean;
  desktopViewport: ViewportSize;
  mobileViewport: ViewportSize;
  responsiveWidths: number[];
  rateLimitMs: number;
  auth?: AuthConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface Scan {
  id: string;
  projectId: string;
  configId: string;
  status: ScanStatus;
  startedAt?: string;
  completedAt?: string;
  failedReason?: string;
  pagesScanned: number;
  urlsQueued: number;
  toolVersion: string;
  summary: ScoreSummary;
  createdAt: string;
}

export interface ScannedPage {
  id: string;
  scanId: string;
  projectId: string;
  url: string;
  canonicalUrl?: string;
  title?: string;
  httpStatus?: number;
  viewport: "desktop" | "mobile" | "responsive";
  screenshotPath?: string;
  domSnapshotPath?: string;
  rawAxePath?: string;
  discoveredLinks: string[];
  createdAt: string;
}

export interface WcagReference {
  standard: "WCAG 2.2" | "WCAG 2.1" | "WCAG 2.0" | "Section 508" | "ADA Title II";
  criterion: string;
  level: "A" | "AA" | "AAA" | "Advisory";
  name: string;
  url: string;
}

export interface Finding {
  id: string;
  projectId: string;
  scanId: string;
  title: string;
  issueKey: string;
  description: string;
  whyItMatters: string;
  whoItAffects: string[];
  severity: Severity;
  confidence: Confidence;
  source: SourceType;
  wcag: WcagReference[];
  adaMapping?: string;
  section508Mapping?: string;
  selector?: string;
  htmlSnippet?: string;
  status: FindingStatus;
  remediation: RemediationGuidance;
  stepsToReproduce: string[];
  templateKey?: string;
  componentName?: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface FindingInstance {
  id: string;
  findingId: string;
  scanId: string;
  pageId: string;
  projectId: string;
  url: string;
  selector?: string;
  htmlSnippet?: string;
  screenshotPath?: string;
  viewport: "desktop" | "mobile" | "responsive";
  impact: Severity;
  createdAt: string;
}

export interface RemediationGuidance {
  plainEnglish: string;
  accessibilityImpact: string;
  fix: string;
  exampleCode?: string;
  tests: string[];
}

export interface ManualCheck {
  id: string;
  projectId: string;
  scanId?: string;
  principle: WcagPrinciple;
  title: string;
  description: string;
  wcag: WcagReference[];
  status: ManualStatus;
  notes?: string;
  assignee?: string;
  priority: "critical" | "high" | "medium" | "low";
  dueDate?: string;
  remediationStatus: FindingStatus;
  evidenceFileIds: string[];
  updatedAt: string;
}

export interface EvidenceFile {
  id: string;
  projectId: string;
  findingId?: string;
  manualCheckId?: string;
  fileName: string;
  storagePath: string;
  contentType: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  findingId?: string;
  manualCheckId?: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface RemediationTask {
  id: string;
  projectId: string;
  findingId: string;
  title: string;
  owner?: string;
  dueDate?: string;
  status: "todo" | "doing" | "blocked" | "done";
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  projectId: string;
  scanId: string;
  kind: "executive-pdf" | "technical-pdf" | "csv" | "json" | "developer-checklist" | "vpat-draft";
  title: string;
  generatedAt: string;
  artifactPath?: string;
}

export interface ScoreSummary {
  riskScore: number;
  wcagAPassEstimate: number;
  wcagAAPassEstimate: number;
  criticalBlockers: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  needsReview: number;
  pagesScanned: number;
  templatesAffected: number;
  manualReviewCompletion: number;
  confidence: Confidence;
  label: string;
  explanation: string[];
}

export interface AuditData {
  users: UserProfile[];
  organizations: Organization[];
  projects: Project[];
  projectMembers: ProjectMember[];
  scanConfigs: ScanConfig[];
  scans: Scan[];
  scannedPages: ScannedPage[];
  findings: Finding[];
  findingInstances: FindingInstance[];
  manualChecks: ManualCheck[];
  evidenceFiles: EvidenceFile[];
  comments: Comment[];
  remediationTasks: RemediationTask[];
  reports: Report[];
}

export interface NormalizedFindingInput {
  scanId: string;
  projectId: string;
  pageId: string;
  url: string;
  viewport: "desktop" | "mobile" | "responsive";
  title: string;
  issueKey: string;
  description: string;
  selector?: string;
  htmlSnippet?: string;
  severity: Severity;
  confidence: Confidence;
  source: SourceType;
  wcag: WcagReference[];
  screenshotPath?: string;
  templateKey?: string;
  componentName?: string;
  remediation: RemediationGuidance;
  stepsToReproduce: string[];
}
