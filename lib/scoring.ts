import type { Finding, ManualCheck, ScoreSummary, Severity } from "@/lib/types";
import { clamp } from "@/lib/utils";

const severityWeights: Record<Severity, number> = {
  critical: 18,
  serious: 10,
  moderate: 4,
  minor: 1,
  "needs-review": 2
};

export function calculateScoreSummary(params: {
  findings: Finding[];
  manualChecks: ManualCheck[];
  pagesScanned: number;
}): ScoreSummary {
  const { findings, manualChecks, pagesScanned } = params;
  const openFindings = findings.filter((finding) => !["fixed", "false-positive"].includes(finding.status));
  const grouped = new Map<string, Finding>();

  for (const finding of openFindings) {
    grouped.set(finding.issueKey + "::" + (finding.templateKey ?? finding.selector ?? finding.title), finding);
  }

  const groupedFindings = Array.from(grouped.values());
  const counts = countBySeverity(openFindings);
  const groupedCounts = countBySeverity(groupedFindings);
  const templatesAffected = new Set(openFindings.map((finding) => finding.templateKey).filter(Boolean)).size;
  const weightedRisk =
    groupedCounts.critical * severityWeights.critical +
    groupedCounts.serious * severityWeights.serious +
    groupedCounts.moderate * severityWeights.moderate +
    groupedCounts.minor * severityWeights.minor +
    groupedCounts["needs-review"] * severityWeights["needs-review"];
  const siteWideImpactPenalty = Math.min(16, Math.max(0, openFindings.length - groupedFindings.length) * 0.7);
  const riskScore = Math.round(clamp(100 - weightedRisk - siteWideImpactPenalty));
  const manualReviewCompletion = manualChecks.length
    ? Math.round(
        (manualChecks.filter((check) => check.status !== "not-started").length / manualChecks.length) * 100
      )
    : 0;

  const wcagAPassEstimate = Math.round(
    clamp(100 - counts.critical * 22 - counts.serious * 9 - counts.moderate * 3)
  );
  const wcagAAPassEstimate = Math.round(
    clamp(wcagAPassEstimate - counts["needs-review"] * 2 - Math.max(0, 80 - manualReviewCompletion) * 0.15)
  );

  const confidence = deriveConfidence({ pagesScanned, manualReviewCompletion, needsReview: counts["needs-review"] });
  const label = deriveLabel(counts, riskScore, manualReviewCompletion);
  const explanation = [
    "Critical findings are weighted most heavily because they often block core tasks for keyboard, screen reader, or low-vision users.",
    "Repeated component/template issues are grouped for scoring, while the summary still preserves site-wide impact.",
    "Incomplete manual review lowers confidence instead of pretending automation can prove legal compliance."
  ];

  return {
    riskScore,
    wcagAPassEstimate,
    wcagAAPassEstimate,
    criticalBlockers: counts.critical,
    seriousIssues: counts.serious,
    moderateIssues: counts.moderate,
    minorIssues: counts.minor,
    needsReview: counts["needs-review"],
    pagesScanned,
    templatesAffected,
    manualReviewCompletion,
    confidence,
    label,
    explanation
  };
}

function countBySeverity(findings: Finding[]) {
  return findings.reduce<Record<Severity, number>>(
    (accumulator, finding) => {
      accumulator[finding.severity] += 1;
      return accumulator;
    },
    { critical: 0, serious: 0, moderate: 0, minor: 0, "needs-review": 0 }
  );
}

function deriveConfidence(params: { pagesScanned: number; manualReviewCompletion: number; needsReview: number }) {
  if (params.pagesScanned >= 5 && params.manualReviewCompletion >= 80 && params.needsReview <= 3) return "high";
  if (params.pagesScanned >= 2 && params.manualReviewCompletion >= 40) return "medium";
  return "low";
}

function deriveLabel(
  counts: Record<Severity, number>,
  riskScore: number,
  manualReviewCompletion: number
) {
  if (counts.critical > 0) return "Likely WCAG AA blockers found";
  if (counts.serious > 0 || riskScore < 75) return "High risk";
  if (manualReviewCompletion < 80) return "Manual review required";
  if (riskScore >= 90) return "Ready for expert review";
  return "No automated blockers found";
}
