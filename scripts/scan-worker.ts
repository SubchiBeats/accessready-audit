import { Worker } from "bullmq";
import { createRedisConnectionOptions, SCAN_QUEUE_NAME } from "../lib/scanner/redis";
import { runScanById } from "../lib/scanner/run-scan";

const connection = createRedisConnectionOptions();
const concurrency = Number(process.env.ACCESS_AUDIT_SCAN_CONCURRENCY ?? 1);

const worker = new Worker(
  SCAN_QUEUE_NAME,
  async (job) => {
    const scanId = String(job.data.scanId ?? "");
    if (!scanId) throw new Error("Scan job is missing scanId.");
    await runScanById(scanId);
  },
  {
    connection,
    concurrency
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] completed scan ${job.data.scanId}`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker] failed scan ${job?.data.scanId ?? "unknown"}:`, error);
});

async function shutdown() {
  console.log("[worker] shutting down");
  await worker.close();
}

process.on("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.on("SIGTERM", () => void shutdown().then(() => process.exit(0)));

console.log(`[worker] listening on ${SCAN_QUEUE_NAME} with concurrency ${concurrency}`);
