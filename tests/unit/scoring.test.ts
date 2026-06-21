import { describe, expect, it } from "vitest";
import { calculateScoreSummary } from "@/lib/scoring";
import type { Finding, ManualCheck } from "@/lib/types";
import { wcagReferences } from "@/lib/wcag";

const baseFinding: Finding = {
  id: "finding-1",
  projectId: "project-1",
  scanId: "scan-1",
  title: "Missing label",
  issueKey: "label",
  description: "Input is missing a label.",
  whyItMatters: "Users need labels.",
  whoItAffects: ["Screen reader users"],
  severity: "serious",
  confidence: "high",
  source: "automated",
  wcag: [wcagReferences["3.3.2"]],
  status: "open",
  remediation: {
    plainEnglish: "Add label.",
    accessibilityImpact: "The field can be understood.",
    fix: "Use label for/id.",
    tests: ["Run axe."]
  },
  stepsToReproduce: ["Open page."],
  firstSeenAt: "2026-06-21T00:00:00.000Z",
  lastSeenAt: "2026-06-21T00:00:00.000Z"
};

const manualCheck: ManualCheck = {
  id: "manual-1",
  projectId: "project-1",
  principle: "operable",
  title: "Keyboard flow",
  description: "Complete flow with keyboard.",
  wcag: [wcagReferences["2.1.1"]],
  status: "pass",
  priority: "high",
  remediationStatus: "fixed",
  evidenceFileIds: [],
  updatedAt: "2026-06-21T00:00:00.000Z"
};

describe("calculateScoreSummary", () => {
  it("heavily penalizes critical blockers", () => {
    const summary = calculateScoreSummary({
      findings: [{ ...baseFinding, severity: "critical" }],
      manualChecks: [manualCheck],
      pagesScanned: 4
    });

    expect(summary.criticalBlockers).toBe(1);
    expect(summary.riskScore).toBeLessThan(90);
    expect(summary.label).toBe("Likely WCAG AA blockers found");
  });

  it("lowers confidence when manual review is incomplete without forcing the score down", () => {
    const summary = calculateScoreSummary({
      findings: [],
      manualChecks: [{ ...manualCheck, status: "not-started" }],
      pagesScanned: 3
    });

    expect(summary.riskScore).toBe(100);
    expect(summary.confidence).not.toBe("high");
    expect(summary.label).toBe("Manual review required");
  });

  it("ignores false positives and fixed issues in risk counts", () => {
    const summary = calculateScoreSummary({
      findings: [
        { ...baseFinding, status: "fixed" },
        { ...baseFinding, id: "finding-2", status: "false-positive" }
      ],
      manualChecks: [manualCheck],
      pagesScanned: 5
    });

    expect(summary.seriousIssues).toBe(0);
    expect(summary.riskScore).toBe(100);
  });
});
