import type { FindingStatus, Severity } from "@/lib/types";
import { severityLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

const severityStyles: Record<Severity, string> = {
  critical: "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  serious: "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200",
  moderate: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  minor: "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-100",
  "needs-review": "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100"
};

const statusLabels: Record<FindingStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  "needs-review": "Needs Review",
  fixed: "Fixed",
  "accepted-risk": "Accepted Risk",
  "false-positive": "False Positive"
};

export function SeverityChip({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", severityStyles[severity], className)}>
      {severityLabels[severity]}
    </span>
  );
}

export function StatusChip({ status, className }: { status: FindingStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-graphite-300 bg-graphite-50 px-2 py-0.5 text-xs font-semibold text-graphite-700 dark:border-graphite-700 dark:bg-graphite-800 dark:text-graphite-200", className)}>
      {statusLabels[status]}
    </span>
  );
}
