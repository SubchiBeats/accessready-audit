import { appendScanResults, getAuditData, updateScan } from "@/lib/store";
import type { Scan } from "@/lib/types";
import { runPlaywrightScan } from "@/lib/scanner/playwright-scanner";

type JobState = {
  scanId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  error?: string;
};

const globalJobs = globalThis as typeof globalThis & {
  __accessAuditJobs?: Map<string, JobState>;
};

function jobs() {
  if (!globalJobs.__accessAuditJobs) globalJobs.__accessAuditJobs = new Map();
  return globalJobs.__accessAuditJobs;
}

export function getJob(scanId: string) {
  return jobs().get(scanId);
}

export async function enqueueScan(scan: Scan) {
  jobs().set(scan.id, { scanId: scan.id, status: "queued" });
  void run(scan);
  return getJob(scan.id);
}

export async function cancelScan(scanId: string) {
  const job = jobs().get(scanId);
  if (job && ["queued", "running"].includes(job.status)) {
    job.status = "cancelled";
    await updateScan(scanId, { status: "cancelled", completedAt: new Date().toISOString() });
  }
  return job;
}

async function run(scan: Scan) {
  const job = jobs().get(scan.id);
  if (!job) return;
  job.status = "running";
  await updateScan(scan.id, { status: "running", startedAt: new Date().toISOString() });

  try {
    const data = await getAuditData();
    const config = data.scanConfigs.find((item) => item.id === scan.configId);
    if (!config) throw new Error("Scan configuration not found.");
    const result = await runPlaywrightScan(scan, config);
    if (job.status === "cancelled") return;
    await appendScanResults({ scan, findings: result.findings, pages: result.pages, instances: result.instances });
    job.status = "completed";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scanner failure.";
    job.status = "failed";
    job.error = message;
    await updateScan(scan.id, { status: "failed", failedReason: message, completedAt: new Date().toISOString() });
  }
}
