import { NextResponse } from "next/server";
import { reportCreateSchema } from "@/lib/api-validation";
import { addReport } from "@/lib/store";

export async function POST(request: Request) {
  const parsed = reportCreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid report request." }, { status: 400 });
  const report = await addReport(parsed.data);
  return NextResponse.json({ report }, { status: 201 });
}
