import { appendScanResults, getAuditData, updateScan } from "@/lib/store";
import { runPlaywrightScan } from "@/lib/scanner/playwright-scanner";

export async function runScanById(scanId: string) {
  const data = await getAuditData();
  const scan = data.scans.find((item) => item.id === scanId);
  if (!scan) throw new Error(`Scan ${scanId} was not found.`);
  const config = data.scanConfigs.find((item) => item.id === scan.configId);
  if (!config) throw new Error(`Scan configuration ${scan.configId} was not found.`);

  await updateScan(scan.id, { status: "running", startedAt: new Date().toISOString() });

  try {
    const result = await runPlaywrightScan(scan, config);
    const latest = await getAuditData();
    const latestScan = latest.scans.find((item) => item.id === scanId);
    if (latestScan?.status === "cancelled") return latestScan;

    await appendScanResults({
      scan,
      findings: result.findings,
      pages: result.pages,
      instances: result.instances
    });

    return (await getAuditData()).scans.find((item) => item.id === scanId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scanner failure.";
    await updateScan(scan.id, {
      status: "failed",
      failedReason: message,
      completedAt: new Date().toISOString()
    });
    throw error;
  }
}
