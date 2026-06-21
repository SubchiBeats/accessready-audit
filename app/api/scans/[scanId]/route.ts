import { NextResponse } from "next/server";
import { getAuditData } from "@/lib/store";
import { cancelScan, getJob } from "@/lib/scanner/queue";

export async function GET(_: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const data = await getAuditData();
  const scan = data.scans.find((item) => item.id === scanId);
  if (!scan) return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  return NextResponse.json({ scan, job: getJob(scanId) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const job = await cancelScan(scanId);
  return NextResponse.json({ job });
}
