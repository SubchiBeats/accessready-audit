import type { Scan } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function TrendChart({ scans }: { scans: Scan[] }) {
  const ordered = [...scans].reverse().slice(-8);
  const max = 100;
  return (
    <div className="space-y-3" role="img" aria-label="Accessibility risk score trend over time">
      {ordered.map((scan) => (
        <div key={scan.id} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
          <span className="truncate text-graphite-600 dark:text-graphite-400">{formatDateTime(scan.completedAt ?? scan.createdAt)}</span>
          <div className="h-3 rounded-full bg-graphite-200 dark:bg-graphite-800">
            <div
              className="h-3 rounded-full bg-teal-700 dark:bg-teal-400"
              style={{ width: `${Math.max(4, (scan.summary.riskScore / max) * 100)}%` }}
            />
          </div>
          <span className="text-right font-semibold">{scan.summary.riskScore}</span>
        </div>
      ))}
    </div>
  );
}
