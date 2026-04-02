"use client";

import StoreDashboard from "@/components/store/store_dashboard";
import { useParams } from "next/navigation";

export default function StoreAnalyticsPage() {
  const params = useParams();
  const storeId = Number(params.id);

  return <StoreDashboard storeId={storeId} />;
}
