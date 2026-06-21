import { NextResponse } from "next/server";
import { buildRawAuditExport } from "@/lib/exports";
import { getAuditData } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const data = await getAuditData();
  return NextResponse.json(buildRawAuditExport(data, projectId));
}
