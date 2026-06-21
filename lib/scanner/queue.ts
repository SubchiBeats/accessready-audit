import { Queue } from "bullmq";
import { updateScan } from "@/lib/store";
import type { Scan } from "@/lib/types";
import { createRedisConnectionOptions, isRedisQueueEnabled, SCAN_QUEUE_NAME } from "@/lib/scanner/redis";
import { runScanById } from "@/lib/scanner/run-scan";

type JobState = {
  scanId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  provider?: "memory" | "bullmq";
  jobId?: string;
  error?: string;
};

const globalJobs = globalThis as typeof globalThis & {
  __accessAuditJobs?: Map<string, JobState>;
};

let bullQueue: Queue | undefined;

function jobs() {
  if (!globalJobs.__accessAuditJobs) globalJobs.__accessAuditJobs = new Map();
  return globalJobs.__accessAuditJobs;
}

function getBullQueue() {
  if (!bullQueue) {
    bullQueue = new Queue(SCAN_QUEUE_NAME, {
      connection: createRedisConnectionOptions(),
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 500
      }
    });
  }
  return bullQueue;
}

export async function getJob(scanId: string): Promise<JobState | undefined> {
  if (isRedisQueueEnabled()) {
    const job = await getBullQueue().getJob(scanId);
    if (!job) return undefined;
    const state = await job.getState();
    return {
      scanId,
      jobId: job.id,
      provider: "bullmq",
      status: normalizeBullState(state),
      error: job.failedReason
    };
  }

  return jobs().get(scanId);
}

export async function enqueueScan(scan: Scan) {
  if (isRedisQueueEnabled()) {
    const job = await getBullQueue().add(
      "run-scan",
      { scanId: scan.id },
      {
        jobId: scan.id
      }
    );
    return {
      scanId: scan.id,
      status: "queued",
      provider: "bullmq",
      jobId: job.id
    } satisfies JobState;
  }

  jobs().set(scan.id, { scanId: scan.id, status: "queued", provider: "memory" });
  void run(scan);
  return jobs().get(scan.id);
}

export async function cancelScan(scanId: string) {
  if (isRedisQueueEnabled()) {
    const queue = getBullQueue();
    const job = await queue.getJob(scanId);
    const state = job ? await job.getState() : undefined;
    if (job && state !== "active") await job.remove();
    await updateScan(scanId, { status: "cancelled", completedAt: new Date().toISOString() });
    return {
      scanId,
      status: "cancelled",
      provider: "bullmq",
      jobId: job?.id
    } satisfies JobState;
  }

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

  try {
    await runScanById(scan.id);
    if (jobs().get(scan.id)?.status === "cancelled") return;
    job.status = "completed";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scanner failure.";
    job.status = "failed";
    job.error = message;
    await updateScan(scan.id, { status: "failed", failedReason: message, completedAt: new Date().toISOString() });
  }
}

function normalizeBullState(state: string): JobState["status"] {
  if (state === "completed") return "completed";
  if (state === "failed") return "failed";
  if (state === "active") return "running";
  if (state === "delayed" || state === "waiting" || state === "prioritized" || state === "waiting-children") {
    return "queued";
  }
  return "queued";
}
