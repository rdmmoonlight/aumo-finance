"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import JournalEntryContent from "./components/content";

export default function JournalEntryPage() {
    return (
        <Suspense
            fallback={
                <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Loading...
                </div>
            }
        >
            <JournalEntryContent />
        </Suspense>
    );
}