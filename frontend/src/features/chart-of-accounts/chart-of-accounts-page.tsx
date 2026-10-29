import { Suspense } from "react";
import { ChartOfAccountsTable } from "./components/table";

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