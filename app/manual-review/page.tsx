import { ManualReviewBoard } from "@/components/manual-review-board";
import { getAuditData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ManualReviewPage() {
  const data = await getAuditData();
  return <ManualReviewBoard checks={data.manualChecks} />;
}
