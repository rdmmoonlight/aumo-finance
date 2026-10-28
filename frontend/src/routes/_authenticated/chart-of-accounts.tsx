import { createFileRoute } from '@tanstack/react-router';

import { ChartOfAccountsTable } from "@/features/chart-of-accounts/components/table";
import { Suspense } from "react";

function ChartOfAccountsPage() {
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

export const Route = createFileRoute('/_authenticated/chart-of-accounts')({
  component: ChartOfAccountsPage,
});
