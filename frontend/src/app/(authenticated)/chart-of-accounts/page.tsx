import { ChartOfAccountsTable } from "@/features/chart-of-accounts/components/table";
import { Suspense } from "react";

export default function ChartOfAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading chart of accounts...
        </div>
      }
    >
      <ChartOfAccountsTable />
    </Suspense>
  );
}
