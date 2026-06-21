import { NextResponse } from "next/server";
import { getProjectBundle, updateProject } from "@/lib/store";
import { complianceModeSchema } from "@/lib/api-validation";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  complianceMode: complianceModeSchema.optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional()
});

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const bundle = await getProjectBundle(projectId);
  if (!bundle) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json(bundle);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid project update." }, { status: 400 });
  const project = await updateProject(projectId, parsed.data);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ project });
}
