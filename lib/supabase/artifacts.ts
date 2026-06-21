import { readFile } from "node:fs/promises";
import { createSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function persistArtifact(params: {
  localPath: string;
  scanId: string;
  artifactName: string;
  contentType: string;
}) {
  if (!isSupabaseConfigured()) return params.localPath;

  const bucket = process.env.ACCESS_AUDIT_STORAGE_BUCKET || "access-audit-artifacts";
  const storagePath = `${params.scanId}/${params.artifactName}`.replace(/\\/g, "/");
  let file: Buffer;
  try {
    file = await readFile(params.localPath);
  } catch (error) {
    console.warn(`Unable to read scan artifact ${params.localPath}:`, error);
    return params.localPath;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    contentType: params.contentType,
    upsert: true
  });

  if (error) {
    console.warn(`Unable to upload scan artifact ${storagePath}: ${error.message}`);
    return params.localPath;
  }

  return `supabase://${bucket}/${storagePath}`;
}
