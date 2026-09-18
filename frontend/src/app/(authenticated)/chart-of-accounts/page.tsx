import { Suspense } from "react";
import ChartOfAccountsClient from "./ChartOfAccounts";

export const metadata = {
  title: "Chart of Accounts | Aumo Finance",
  description: "Master list of financial accounts.",
};

export default function ChartOfAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading chart of accounts...
        </div>
      }
    >
      <ChartOfAccountsClient />
    </Suspense>
  );
}
