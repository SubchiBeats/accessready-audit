import { NextResponse } from "next/server";
import { findingUpdateSchema } from "@/lib/api-validation";
import { updateFindingStatus } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ findingId: string }> }) {
  const { findingId } = await params;
  const parsed = findingUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid finding update." }, { status: 400 });
  const finding = await updateFindingStatus(findingId, parsed.data.status);
  if (!finding) return NextResponse.json({ error: "Finding not found." }, { status: 404 });
  return NextResponse.json({ finding });
}
