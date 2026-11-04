"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

export function PeriodsAlerts({
  errorMessage,
  isGetPeriodsError,
  successMessage,
  onClearError,
  onClearSuccess,
}: {
  errorMessage: string | null;
  isGetPeriodsError: boolean;
  successMessage: string | null;
  onClearError: () => void;
  onClearSuccess: () => void;
}) {
  return (
    <>
      {(errorMessage || isGetPeriodsError) && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center py-2 bg-red-950/50 border-red-900/50 text-red-200"
        >
          <AlertDescription className="flex items-center gap-2 text-xs">
            <AlertTriangle size={16} />
            {errorMessage || "Gagal memuat data periode dari server."}
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-200 hover:bg-red-900/30"
            onClick={onClearError}
          >
            <X size={14} />
          </Button>
        </Alert>
      )}
      {successMessage && (
        <Alert className="bg-white/[0.06] border-white/10 text-white flex justify-between items-center py-2">
          <AlertDescription className="text-xs">
            {successMessage}
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/10 text-white"
            onClick={onClearSuccess}
          >
            <X size={14} />
          </Button>
        </Alert>
      )}
    </>
  );
}
