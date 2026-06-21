import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuditData, writeAuditData } from "@/lib/store";

const evidenceSchema = z.object({
  projectId: z.string().min(1),
  findingId: z.string().optional(),
  manualCheckId: z.string().optional(),
  fileName: z.string().min(1).max(240),
  storagePath: z.string().min(1).max(1000),
  contentType: z.string().min(1).max(120)
});

export async function POST(request: Request) {
  const parsed = evidenceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid evidence metadata." }, { status: 400 });
  const data = await getAuditData();
  const evidence = {
    ...parsed.data,
    id: `evidence-${randomUUID()}`,
    createdAt: new Date().toISOString()
  };
  data.evidenceFiles.unshift(evidence);
  await writeAuditData(data);
  return NextResponse.json({ evidence }, { status: 201 });
}
