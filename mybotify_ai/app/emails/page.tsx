import { Suspense } from "react";
import EmailsDashboard from "@/components/domain/emails/emails_dashboard";

export default function EmailsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full bg-[#F1F5F2] flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-[#CAF389] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EmailsDashboard />
    </Suspense>
  );
}
