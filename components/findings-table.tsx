"use client";

import { useMemo, useState } from "react";
import { Code2, ExternalLink, Search } from "lucide-react";
import type { Finding, FindingInstance, FindingStatus, Project } from "@/lib/types";
import { severityOrder } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/forms";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SeverityChip, StatusChip } from "@/components/ui/status-chip";

const statuses: FindingStatus[] = ["open", "in-progress", "needs-review", "fixed", "accepted-risk", "false-positive"];

export function FindingsWorkspace({
  findings,
  instances,
  projects,
  initialFindingId
}: {
  findings: Finding[];
  instances: FindingInstance[];
  projects: Project[];
  initialFindingId?: string;
}) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [selectedId, setSelectedId] = useState(initialFindingId ?? findings[0]?.id);
  const [localFindings, setLocalFindings] = useState(findings);

  const filtered = useMemo(() => {
    return localFindings.filter((finding) => {
      const haystack = [
        finding.title,
        finding.description,
        finding.issueKey,
        finding.selector,
        finding.componentName,
        finding.templateKey,
        ...finding.wcag.map((ref) => `${ref.criterion} ${ref.name} ${ref.standard}`)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!query || haystack.includes(query.toLowerCase())) &&
        (severity === "all" || finding.severity === severity) &&
        (status === "all" || finding.status === status) &&
        (projectId === "all" || finding.projectId === projectId)
      );
    });
  }, [localFindings, projectId, query, severity, status]);

  const selected = localFindings.find((finding) => finding.id === selectedId) ?? filtered[0];
  const selectedInstances = selected ? instances.filter((instance) => instance.findingId === selected.id) : [];

  async function updateStatus(findingId: string, nextStatus: FindingStatus) {
    setLocalFindings((items) => items.map((item) => (item.id === findingId ? { ...item, status: nextStatus } : item)));
    await fetch(`/api/findings/${findingId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-4 xl:grid-cols-[1.35fr_0.85fr]">
      <section className="space-y-4" aria-labelledby="findings-heading">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Findings</p>
          <h1 id="findings-heading" className="mt-2 text-3xl font-bold">Audit findings</h1>
          <p className="mt-2 text-sm leading-6 text-graphite-700 dark:text-graphite-300">
            Filter by severity, project, WCAG criterion, selector, source, or remediation status.
          </p>
        </div>

        <Card>
          <CardBody>
            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr]">
              <div>
                <Label htmlFor="finding-search">Search findings</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-graphite-500" aria-hidden="true" />
                  <Input
                    id="finding-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder="selector, issue, URL, criterion"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="severity-filter">Severity</Label>
                <Select id="severity-filter" value={severity} onChange={(event) => setSeverity(event.target.value)}>
                  <option value="all">All severities</option>
                  {severityOrder.map((item) => (
                    <option key={item} value={item}>
                      {item.replace("-", " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">All statuses</option>
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item.replace("-", " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="project-filter">Project</Label>
                <Select id="project-filter" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                  <option value="all">All projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-graphite-200 bg-graphite-50 text-xs uppercase text-graphite-600 dark:border-graphite-800 dark:bg-graphite-900 dark:text-graphite-400">
                  <th className="p-3">Issue</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">WCAG</th>
                  <th className="p-3">Component</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((finding) => (
                  <tr
                    key={finding.id}
                    className={`cursor-pointer border-b border-graphite-100 hover:bg-graphite-50 dark:border-graphite-800 dark:hover:bg-graphite-800 ${selected?.id === finding.id ? "bg-teal-50 dark:bg-graphite-800" : ""}`}
                    onClick={() => setSelectedId(finding.id)}
                  >
                    <td className="p-3">
                      <button type="button" className="text-left font-semibold underline-offset-4 hover:underline" onClick={() => setSelectedId(finding.id)}>
                        {finding.title}
                      </button>
                      <p className="mt-1 max-w-xl truncate text-xs text-graphite-600 dark:text-graphite-400">{finding.selector ?? finding.issueKey}</p>
                    </td>
                    <td className="p-3"><SeverityChip severity={finding.severity} /></td>
                    <td className="p-3">{finding.wcag.map((ref) => ref.criterion).join(", ")}</td>
                    <td className="p-3">{finding.componentName ?? finding.templateKey ?? "Page"}</td>
                    <td className="p-3"><StatusChip status={finding.status} /></td>
                    <td className="p-3 capitalize">{finding.source.replace("-", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length ? (
              <p className="p-4 text-sm text-graphite-600 dark:text-graphite-400">No findings match the current filters.</p>
            ) : null}
          </CardBody>
        </Card>
      </section>

      <aside className="xl:sticky xl:top-24 xl:self-start" aria-label="Finding detail">
        {selected ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityChip severity={selected.severity} />
                <StatusChip status={selected.status} />
              </div>
              <h2 className="mt-3 text-xl font-bold">{selected.title}</h2>
              <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">{selected.description}</p>
            </CardHeader>
            <CardBody className="space-y-5">
              <section>
                <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Why it matters</h3>
                <p className="mt-2 text-sm leading-6">{selected.whyItMatters}</p>
                <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">Affects: {selected.whoItAffects.join(", ")}</p>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Standards mapping</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {selected.wcag.map((ref) => (
                    <li key={`${ref.standard}-${ref.criterion}`}>
                      <a className="inline-flex items-center gap-1 font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-200" href={ref.url}>
                        {ref.standard} {ref.criterion} {ref.name}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Affected evidence</h3>
                <dl className="mt-2 space-y-2 text-sm">
                  <div>
                    <dt className="font-semibold">Selector</dt>
                    <dd className="break-all font-mono text-xs">{selected.selector ?? "Page-level"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Confidence</dt>
                    <dd className="capitalize">{selected.confidence}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Instances</dt>
                    <dd>{selectedInstances.length}</dd>
                  </div>
                </dl>
                {selected.htmlSnippet ? (
                  <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-graphite-950 p-3 text-xs text-graphite-50">
                    <code>{selected.htmlSnippet}</code>
                  </pre>
                ) : null}
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Steps to reproduce</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                  {selected.stepsToReproduce.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Recommended fix</h3>
                <p className="mt-2 text-sm leading-6">{selected.remediation.fix}</p>
                {selected.remediation.exampleCode ? (
                  <pre className="mt-3 max-h-52 overflow-auto rounded-md bg-graphite-950 p-3 text-xs text-graphite-50">
                    <code>{selected.remediation.exampleCode}</code>
                  </pre>
                ) : null}
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase text-graphite-600 dark:text-graphite-400">Confirm the fix</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {selected.remediation.tests.map((test) => (
                    <li key={test}>{test}</li>
                  ))}
                </ul>
              </section>

              <section>
                <Label htmlFor="status-update">Update status</Label>
                <div className="mt-2 flex gap-2">
                  <Select
                    id="status-update"
                    value={selected.status}
                    onChange={(event) => updateStatus(selected.id, event.target.value as FindingStatus)}
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item.replace("-", " ")}
                      </option>
                    ))}
                  </Select>
                  <Button type="button" variant="secondary" onClick={() => updateStatus(selected.id, "fixed")}>
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                    Fixed
                  </Button>
                </div>
              </section>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <p className="text-sm text-graphite-600 dark:text-graphite-400">Select a finding to view details.</p>
            </CardBody>
          </Card>
        )}
      </aside>
    </div>
  );
}
