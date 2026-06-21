import { CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Finding, RemediationTask } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SeverityChip, StatusChip } from "@/components/ui/status-chip";

export function RemediationPanel({
  findings,
  tasks
}: {
  findings: Finding[];
  tasks: RemediationTask[];
}) {
  const actionable = findings.filter((finding) => !["fixed", "false-positive"].includes(finding.status));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Remediation</p>
        <h1 className="mt-2 text-3xl font-bold">Developer fix assistant</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-700 dark:text-graphite-300">
          Each item explains the issue, affected users, implementation guidance, and tests to confirm the fix before rescanning.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4" aria-label="Remediation guidance">
          {actionable.map((finding) => (
            <Card key={finding.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityChip severity={finding.severity} />
                  <StatusChip status={finding.status} />
                </div>
                <h2 className="mt-3 text-xl font-bold">{finding.title}</h2>
                <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">
                  {finding.componentName ?? finding.selector ?? "Page-level"} | {finding.wcag.map((ref) => ref.criterion).join(", ")}
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Plain English</h3>
                  <p className="mt-2 text-sm leading-6">{finding.remediation.plainEnglish}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Accessibility impact</h3>
                  <p className="mt-2 text-sm leading-6">{finding.remediation.accessibilityImpact}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Framework-agnostic fix</h3>
                  <p className="mt-2 text-sm leading-6">{finding.remediation.fix}</p>
                </div>
                {finding.remediation.exampleCode ? (
                  <pre className="overflow-auto rounded-md bg-graphite-950 p-3 text-xs text-graphite-50">
                    <code>{finding.remediation.exampleCode}</code>
                  </pre>
                ) : null}
                <div>
                  <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Suggested tests</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {finding.remediation.tests.map((test) => (
                      <li key={test}>{test}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink href={`/findings?finding=${finding.id}`} variant="secondary">
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    Open Finding
                  </ButtonLink>
                  <ButtonLink href={`/projects/${finding.projectId}`} variant="ghost">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Schedule Re-scan
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          ))}
        </section>

        <aside className="space-y-4" aria-label="Remediation tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
                <h2 className="text-lg font-bold">Task Queue</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {tasks.map((task) => {
                const finding = findings.find((item) => item.id === task.findingId);
                return (
                  <Link
                    key={task.id}
                    href={finding ? `/findings?finding=${finding.id}` : "/findings"}
                    className="block rounded-md border border-graphite-200 p-3 hover:bg-graphite-50 dark:border-graphite-800 dark:hover:bg-graphite-800"
                  >
                    <p className="font-semibold">{task.title}</p>
                    <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">
                      {task.owner ?? "Unassigned"} | {task.status}
                    </p>
                  </Link>
                );
              })}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
