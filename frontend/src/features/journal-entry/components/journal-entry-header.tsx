import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Edit } from "lucide-react";

interface HeaderProps {
  isEdit: boolean;
  displayedTxNumber: string;
}

export function JournalEntryHeader({ isEdit, displayedTxNumber }: HeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {isEdit ? (
            <Edit className="text-primary" />
          ) : (
            <BookOpen className="text-primary" />
          )}
          {isEdit ? "Edit Journal Entry" : "Create Journal Entry"}
          {isEdit && (
            <Badge variant="secondary" className="font-mono text-xs">
              {displayedTxNumber}
            </Badge>
          )}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Record double-entry transactions
        </p>
      </div>
      <Button variant="outline" size="sm" asChild className="text-sm">
        <Link to="/reports/journals/general" className="gap-1.5">
          <ArrowLeft size={14} /> Back to Journal
        </Link>
      </Button>
    </div>
  );
}
