import { createFileRoute } from '@tanstack/react-router';

"use client";

import JournalEntryContent from "#/features/journal-entry/components/content";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function JournalEntryPage() {
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

export const Route = createFileRoute('/_authenticated/journal-entry')({
  component: JournalEntryPage,
});
