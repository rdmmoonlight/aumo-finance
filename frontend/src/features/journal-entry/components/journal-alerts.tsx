"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Lock } from "lucide-react";

interface Props {
  errors: any;
  apiError: string | null;
  isLocked?: boolean;
  txNumber?: string;
}

export function JournalAlerts({ errors, apiError, isLocked, txNumber }: Props) {
  // 1. Kalau ke-lock, ini prioritas
  if (isLocked) {
    return (
      <Alert>
        <Lock size={16} />
        <AlertDescription className="text-xs">
          Journal {txNumber} is in closed period.{" "}
          <Link
            to="/reports/journals/general"
            className="underline font-medium"
          >
            Back to list
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // 2. Kalau ada error validasi Zod / API
  const rootMessage = errors?.lines?.root?.message || errors?.lines?.message;
  const hasError = Boolean(rootMessage || apiError);

  if (!hasError) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle size={16} />
      <AlertDescription className="text-xs">
        <ul className="list-disc ml-4 space-y-1">
          {rootMessage && <li>{rootMessage}</li>}
          {apiError && <li>{apiError}</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
