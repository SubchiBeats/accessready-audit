"use client";

import { useState } from "react";
import { CalendarDays, ClipboardCheck, Upload } from "lucide-react";
import type { ManualCheck, ManualStatus, WcagPrinciple } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/forms";

const principles: WcagPrinciple[] = ["perceivable", "operable", "understandable", "robust"];
const statuses: ManualStatus[] = ["not-started", "pass", "fail", "not-applicable"];

export function ManualReviewBoard({ checks }: { checks: ManualCheck[] }) {
  const [items, setItems] = useState(checks);

  async function update(id: string, patch: Partial<ManualCheck>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item)));
    await fetch("/api/manual-checks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...patch })
    });
  }

  const completion = items.length ? Math.round((items.filter((item) => item.status !== "not-started").length / items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Manual review</p>
          <h1 className="mt-2 text-3xl font-bold">POUR checklist</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-700 dark:text-graphite-300">
            Track the checks that need human judgment, assistive technology review, or user-flow completion.
          </p>
        </div>
        <div className="min-w-64 rounded-lg border border-graphite-200 bg-white p-4 dark:border-graphite-800 dark:bg-graphite-900">
          <div className="flex items-center justify-between text-sm">
            <span>Completion</span>
            <span className="font-bold">{completion}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-graphite-200 dark:bg-graphite-800">
            <div className="h-3 rounded-full bg-teal-700 dark:bg-teal-400" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {principles.map((principle) => {
          const group = items.filter((item) => item.principle === principle);
          return (
            <Card key={principle}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
                  <h2 className="text-lg font-bold capitalize">{principle}</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {group.map((check) => (
                  <article key={check.id} className="rounded-md border border-graphite-200 p-4 dark:border-graphite-800">
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                      <div>
                        <h3 className="font-bold">{check.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-graphite-700 dark:text-graphite-300">{check.description}</p>
                        <p className="mt-2 text-xs font-semibold uppercase text-graphite-600 dark:text-graphite-400">
                          {check.wcag.map((ref) => `${ref.criterion} ${ref.name}`).join("; ")}
                        </p>
                      </div>
                      <span className="rounded-full border border-graphite-300 px-2 py-0.5 text-xs font-semibold capitalize dark:border-graphite-700">
                        {check.priority}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`${check.id}-status`}>Status</Label>
                        <Select
                          id={`${check.id}-status`}
                          value={check.status}
                          onChange={(event) => update(check.id, { status: event.target.value as ManualStatus })}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("-", " ")}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`${check.id}-assignee`}>Assignee</Label>
                        <Input
                          id={`${check.id}-assignee`}
                          value={check.assignee ?? ""}
                          onChange={(event) => update(check.id, { assignee: event.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${check.id}-due`}>Due date</Label>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-graphite-500" aria-hidden="true" />
                          <Input
                            id={`${check.id}-due`}
                            type="date"
                            className="pl-9"
                            value={check.dueDate ?? ""}
                            onChange={(event) => update(check.id, { dueDate: event.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`${check.id}-remediation`}>Remediation status</Label>
                        <Select
                          id={`${check.id}-remediation`}
                          value={check.remediationStatus}
                          onChange={(event) => update(check.id, { remediationStatus: event.target.value as ManualCheck["remediationStatus"] })}
                        >
                          {["open", "in-progress", "needs-review", "fixed", "accepted-risk", "false-positive"].map((status) => (
                            <option key={status} value={status}>
                              {status.replace("-", " ")}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`${check.id}-notes`}>Notes</Label>
                        <Textarea
                          id={`${check.id}-notes`}
                          value={check.notes ?? ""}
                          onChange={(event) => update(check.id, { notes: event.target.value })}
                          placeholder="Evidence, assistive technology observations, affected flows, or exception rationale"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button type="button" variant="secondary" onClick={() => update(check.id, { notes: `${check.notes ?? ""}\nEvidence placeholder added ${new Date().toLocaleDateString()}`.trim() })}>
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Attach Evidence Note
                      </Button>
                    </div>
                  </article>
                ))}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
