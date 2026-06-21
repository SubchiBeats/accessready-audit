import { NextResponse } from "next/server";
import { manualCheckUpdateSchema } from "@/lib/api-validation";
import { getAuditData, upsertManualCheck } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const data = await getAuditData();
  return NextResponse.json({
    manualChecks: projectId ? data.manualChecks.filter((check) => check.projectId === projectId) : data.manualChecks
  });
}

export async function POST(request: Request) {
  const parsed = manualCheckUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid manual check update." }, { status: 400 });
  const manualCheck = await upsertManualCheck(parsed.data);
  if (!manualCheck) return NextResponse.json({ error: "Manual check not found." }, { status: 404 });
  return NextResponse.json({ manualCheck });
}
