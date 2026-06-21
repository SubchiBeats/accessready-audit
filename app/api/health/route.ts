import { NextResponse } from "next/server";
import { isRedisQueueEnabled } from "@/lib/scanner/redis";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Access Audit",
    queue: isRedisQueueEnabled() ? "bullmq" : "memory",
    time: new Date().toISOString()
  });
}
