import { ColumnDef } from "@tanstack/react-table";
import {
  IconLock,
  IconLockOpen,
  IconEye,
  IconEyeOff,
  IconLoader2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PeriodItem } from "./types";

interface GetPeriodColumnsProps {
  selectedPeriod: PeriodItem | null;
  selectingId: number | null;
  closingId: number | null;
  onSelectPeriod: (p: PeriodItem) => void;
  onClosePeriod: (p: PeriodItem) => void;
}

export const getPeriodColumns = ({
  selectedPeriod,
  selectingId,
  closingId,
  onSelectPeriod,
  onClosePeriod,
}: GetPeriodColumnsProps): ColumnDef<PeriodItem>[] => [
  {
    accessorKey: "periodName",
    header: () => <span className="pl-6 text-zinc-500">Period Name</span>,
    cell: ({ row }) => {
      const p = row.original;
      const isSelected = selectedPeriod?.id === p.id;
      return (
        <div className="pl-6 font-medium">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold",
                isSelected ? "text-white" : "text-zinc-200",
              )}
            >
              {p.periodName}
            </span>
            {isSelected && (
              <Badge className="h-5 bg-white text-black border-0 px-1.5 font-bold tracking-wider">
                VIEWING
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: () => <span className="text-zinc-500">Start</span>,
    cell: ({ getValue }) => {
      const val = getValue<string | undefined>();
      return (
        <span className="text-xs text-zinc-400">
          {val ? new Date(val).toLocaleDateString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: () => <span className="text-zinc-500">End</span>,
    cell: ({ getValue }) => {
      const val = getValue<string | undefined>();
      return (
        <span className="text-xs text-zinc-400">
          {val ? new Date(val).toLocaleDateString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "isClosed",
    header: () => <span className="text-zinc-500">Status</span>,
    meta: { headerClassName: "text-center", cellClassName: "text-center" },
    cell: ({ getValue }) => {
      const isClosed = getValue<boolean>();
      return isClosed ? (
        <Badge className="h-6 bg-white/10 text-zinc-400 border-white/10">
          <IconLock size={10} /> Closed
        </Badge>
      ) : (
        <Badge className="h-6 bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
          <IconLockOpen size={10} /> Active
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="text-zinc-500 pr-6">Action</span>,
    meta: {
      headerClassName: "text-center pr-6",
      cellClassName: "text-center pr-6",
    },
    cell: ({ row }) => {
      const p = row.original;
      const isSelected = selectedPeriod?.id === p.id;
      const isSelectingThis = selectingId === p.id;
      const isClosingThis = closingId === p.id;

      return (
        <div className="flex justify-center gap-1.5">
          <Button
            type="button"
            size="sm"
            className={cn(
              "h-7 gap-1.5 font-bold tracking-wide border transition-all",
              isSelected
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
                : "bg-[#1e1e22] text-zinc-400 border-white/10 hover:bg-white hover:text-black hover:border-white",
            )}
            onClick={() => onSelectPeriod(p)}
            disabled={isSelectingThis}
          >
            {isSelectingThis ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : isSelected ? (
              <IconEyeOff size={14} />
            ) : (
              <IconEye size={14} />
            )}
            {isSelected ? "VIEWING" : "VIEW"}
          </Button>

          {!p.isClosed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 px-0 bg-transparent border border-transparent text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10"
              onClick={() => onClosePeriod(p)}
              disabled={isClosingThis}
            >
              {isClosingThis ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconLock size={14} />
              )}
            </Button>
          )}
        </div>
      );
    },
  },
];
