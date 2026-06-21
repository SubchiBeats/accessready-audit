"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StartScanButton({
  projectId,
  configId,
  demo = false
}: {
  projectId: string;
  configId?: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  async function startScan() {
    setPending(true);
    setMessage(undefined);
    const response = await fetch("/api/scans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, configId, demo })
    });
    const json = await response.json();
    setPending(false);
    if (!response.ok) {
      setMessage(json.error ?? "Unable to start scan.");
      return;
    }
    router.push(`/projects/${projectId}/scans/${json.scan.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" onClick={startScan} disabled={pending}>
        {pending ? <RotateCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        {pending ? "Starting..." : "Start Scan"}
      </Button>
      {message ? (
        <p className="text-sm text-red-700 dark:text-red-200" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
