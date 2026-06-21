import type { ComplianceMode, Severity } from "@/lib/types";

export const APP_NAME = "Access Audit";
export const TOOL_VERSION = "0.1.0";

export const complianceModeLabels: Record<ComplianceMode, string> = {
  "wcag22-aa": "WCAG 2.2 A/AA",
  "wcag21-aa": "WCAG 2.1 A/AA",
  section508: "Section 508",
  custom: "Custom"
};

export const severityLabels: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
  "needs-review": "Needs Review"
};

export const severityOrder: Severity[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
  "needs-review"
];

export const responsibleUseNotice =
  "Only scan websites and applications that you own or have explicit permission to test. Access Audit rate-limits crawls, restricts to same-domain by default, and blocks private network targets unless local development explicitly allows them.";

export const complianceDisclaimer =
  "Access Audit helps identify accessibility risks and prepare remediation evidence. Automated scanning alone does not prove ADA, WCAG, or Section 508 compliance. Final compliance decisions require expert review and, ideally, testing with disabled users and assistive technologies.";
