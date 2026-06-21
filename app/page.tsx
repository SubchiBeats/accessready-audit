import { Dashboard } from "@/components/dashboard";
import { getAuditData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getAuditData();
  return <Dashboard data={data} />;
}
