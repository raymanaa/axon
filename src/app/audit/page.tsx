import { Suspense } from "react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { PublicAuditReport } from "@/components/public-audit-report";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <MarketingNav />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[13px] text-ink-3 font-mono">Loading…</div>
          </div>
        }
      >
        <PublicAuditReport />
      </Suspense>
      <MarketingFooter />
    </div>
  );
}
