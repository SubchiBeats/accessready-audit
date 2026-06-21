import { AlertTriangle, CheckCircle2, FileSearch, ShieldAlert } from "lucide-react";
import type { ScoreSummary } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

export function ScoreCards({ summary }: { summary: ScoreSummary }) {
  const items = [
    { label: "Risk score", value: summary.riskScore, icon: ShieldAlert, tone: "text-navy-800 dark:text-teal-200" },
    { label: "Critical blockers", value: summary.criticalBlockers, icon: AlertTriangle, tone: "text-risk-critical" },
    { label: "Manual review", value: formatPercent(summary.manualReviewCompletion), icon: FileSearch, tone: "text-teal-700 dark:text-teal-200" },
    { label: "Confidence", value: summary.confidence, icon: CheckCircle2, tone: "text-green-700 dark:text-green-200" }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardBody className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-graphite-600 dark:text-graphite-400">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-graphite-950 dark:text-white">{item.value}</p>
              </div>
              <Icon className={`h-6 w-6 ${item.tone}`} aria-hidden="true" />
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
