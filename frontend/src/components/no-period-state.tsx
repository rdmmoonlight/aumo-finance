import { Link } from '@tanstack/react-router';
"use client";

import { EyeOff } from "lucide-react";


export function NoPeriodState() {
  return (
    <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
      <EyeOff className="h-7 w-7" />
      <p className="text-sm font-medium">No Period Selected</p>
      <p className="text-xs">
        Go to{" "}
        <Link
          to="/periods"
          className="text-primary underline underline-offset-4"
        >
          Periods
        </Link>{" "}
        to select a period.
      </p>
    </div>
  );
}
