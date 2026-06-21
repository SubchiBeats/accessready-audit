"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { AlertTriangle, Lock, Play, Upload } from "lucide-react";
import { complianceModeLabels, responsibleUseNotice } from "@/lib/constants";
import { toArrayFromText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/forms";

export function ScanConfigForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(undefined);
    const form = new FormData(event.currentTarget);
    const primaryUrl = String(form.get("primaryUrl") ?? "").trim();
    const urls = toArrayFromText(String(form.get("urls") ?? primaryUrl));
    const payload = {
      name: String(form.get("name") ?? ""),
      primaryUrl,
      urls: urls.length ? urls : [primaryUrl],
      complianceMode: form.get("complianceMode"),
      crawlDepth: Number(form.get("crawlDepth") ?? 2),
      maxPages: Number(form.get("maxPages") ?? 25),
      includePatterns: toArrayFromText(String(form.get("includePatterns") ?? "")),
      excludePatterns: toArrayFromText(String(form.get("excludePatterns") ?? "")),
      sitemapUrl: String(form.get("sitemapUrl") ?? "").trim(),
      sameDomainOnly: form.get("sameDomainOnly") === "on",
      rateLimitMs: Number(form.get("rateLimitMs") ?? 750),
      responsibleUseAccepted: form.get("responsibleUseAccepted") === "on",
      auth: {
        loginUrl: String(form.get("loginUrl") ?? "").trim(),
        username: String(form.get("username") ?? "").trim(),
        passwordProvided: Boolean(String(form.get("password") ?? "").trim()),
        cookieImportLabel: String(form.get("cookieImportLabel") ?? "").trim()
      }
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setMessage(json.error ?? "Project creation failed.");
      return;
    }

    router.push(`/projects/${json.project.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Project</h2>
          <p className="text-sm text-graphite-600 dark:text-graphite-400">Define the site scope and target standard.</p>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="name">Project name</Label>
            <Input id="name" name="name" required placeholder="Acme public website" />
          </div>
          <div>
            <Label htmlFor="primaryUrl">Primary URL</Label>
            <Input id="primaryUrl" name="primaryUrl" required type="url" placeholder="https://www.example.com" />
          </div>
          <div>
            <Label htmlFor="complianceMode">Compliance mode</Label>
            <Select id="complianceMode" name="complianceMode" defaultValue="wcag22-aa">
              {Object.entries(complianceModeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sitemapUrl">Sitemap URL</Label>
            <Input id="sitemapUrl" name="sitemapUrl" type="url" placeholder="https://www.example.com/sitemap.xml" />
            <FieldHint>Optional. Sitemap URLs are still filtered through the project allow-list.</FieldHint>
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="urls">Start URLs or bulk URL list</Label>
            <Textarea id="urls" name="urls" placeholder="https://www.example.com&#10;https://www.example.com/pricing" />
            <FieldHint>One URL per line or comma-separated. The primary URL is used if this is empty.</FieldHint>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Crawl Safety</h2>
          <p className="text-sm text-graphite-600 dark:text-graphite-400">Use conservative crawling settings by default.</p>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-4">
          <div>
            <Label htmlFor="crawlDepth">Crawl depth</Label>
            <Input id="crawlDepth" name="crawlDepth" type="number" min={0} max={5} defaultValue={2} />
          </div>
          <div>
            <Label htmlFor="maxPages">Max pages</Label>
            <Input id="maxPages" name="maxPages" type="number" min={1} max={500} defaultValue={25} />
          </div>
          <div>
            <Label htmlFor="rateLimitMs">Rate limit</Label>
            <Input id="rateLimitMs" name="rateLimitMs" type="number" min={250} step={50} defaultValue={750} />
            <FieldHint>Milliseconds between page visits.</FieldHint>
          </div>
          <div className="flex items-end">
            <label className="flex min-h-10 items-center gap-2 rounded-md border border-graphite-300 px-3 text-sm font-semibold dark:border-graphite-700">
              <input name="sameDomainOnly" type="checkbox" defaultChecked className="h-4 w-4" />
              Same-domain only
            </label>
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="includePatterns">Include URL patterns</Label>
            <Textarea id="includePatterns" name="includePatterns" placeholder="/docs&#10;/products" />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="excludePatterns">Exclude URL patterns</Label>
            <Textarea id="excludePatterns" name="excludePatterns" placeholder="/logout&#10;/account/delete&#10;/admin/destructive" />
          </div>
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100 lg:col-span-4">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{responsibleUseNotice}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-teal-700 dark:text-teal-200" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold">Private Site Access</h2>
              <p className="text-sm text-graphite-600 dark:text-graphite-400">Optional authentication metadata. Password values are not logged or stored by demo mode.</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="loginUrl">Login URL</Label>
            <Input id="loginUrl" name="loginUrl" type="url" placeholder="https://www.example.com/login" />
          </div>
          <div>
            <Label htmlFor="username">Test account username</Label>
            <Input id="username" name="username" autoComplete="username" />
          </div>
          <div>
            <Label htmlFor="password">Test account password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" />
            <FieldHint>For production use, store secrets in Supabase Vault or another secret manager.</FieldHint>
          </div>
          <div>
            <Label htmlFor="cookieImportLabel">Cookie/session import label</Label>
            <Input id="cookieImportLabel" name="cookieImportLabel" placeholder="staging-session-june" />
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 rounded-lg border border-graphite-200 bg-white p-4 dark:border-graphite-800 dark:bg-graphite-900 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-start gap-2 text-sm">
          <input name="responsibleUseAccepted" required type="checkbox" className="mt-1 h-4 w-4" />
          <span>I confirm I own this site or have explicit permission to test it.</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import CSV
          </Button>
          <Button type="submit" disabled={submitting}>
            <Play className="h-4 w-4" aria-hidden="true" />
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>

      {message ? (
        <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
