"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useGetApiV1ChartOfAccountsQuery } from "@/lib/generatedApi";
import {
  AddAccountDialog,
  EditAccountDialog,
  DeleteAccountAlertDialog,
} from "./_components/coa-dialogs";
import { Network, Plus, Pencil, BookOpen, Trash2, X, Search } from "lucide-react";

// Tipe presisi yang cocok dengan ekspektasi ChartOfAccount pada coa-dialogs.tsx
type AccountItem = {
  id: number;
  referenceNumber: number | string;
  accountName: string;
  type: string;
  role?: string;
  balance?: number | string;
  isActive: boolean;
  [key: string]: any;
};

interface AccountRangeInfo {
  start: number;
  end: number;
  label: string;
}

const ACCOUNT_TYPES = [
  "Assets",
  "Liabilities",
  "Equity",
  "OperatingIncome",
  "OperatingExpenses",
  "OtherIncome",
  "OtherExpenses",
] as const;

type AccountType = (typeof ACCOUNT_TYPES)[number];

const ACCOUNT_RANGES: Record<AccountType, AccountRangeInfo> = {
  Assets: { start: 100, end: 199, label: "Assets (100-199)" },
  Liabilities: { start: 200, end: 299, label: "Liabilities (200-299)" },
  Equity: { start: 300, end: 399, label: "Equity (300-399)" },
  OperatingIncome: {
    start: 400,
    end: 499,
    label: "Operating Income (400-499)",
  },
  OperatingExpenses: {
    start: 500,
    end: 599,
    label: "Operating Expenses (500-599)",
  },
  OtherIncome: { start: 600, end: 799, label: "Other Income (600-799)" },
  OtherExpenses: { start: 800, end: 999, label: "Other Expenses (800-999)" },
};

function ChartOfAccountsContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  // Local UI Filter States
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query Hook
  const {
    data: rawAccountsData,
    isLoading,
    isError,
  } = useGetApiV1ChartOfAccountsQuery({
    search: searchText || undefined,
    category: categoryFilter || undefined,
  });

  // Ekstraksi Data Aman (Menangani { accounts: [...] }, { data: [...] }, dan Array)
  const rawAccounts = useMemo<AccountItem[]>(() => {
    if (!rawAccountsData) return [];

    let list: any[] = [];

    if (typeof rawAccountsData === "object") {
      const res = rawAccountsData as any;
      if (Array.isArray(res.accounts)) {
        list = res.accounts;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(rawAccountsData)) {
        list = rawAccountsData;
      }
    }

    return list.map((item) => ({
      ...item,
      id: Number(item.id || 0),
      referenceNumber: item.referenceNumber ?? "",
      accountName: item.accountName ?? "",
      type: item.type ?? "",
      role: item.role ?? "Default",
      balance: item.balance ?? 0,
      isActive: Boolean(item.isActive),
    })) as AccountItem[];
  }, [rawAccountsData]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountItem | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<AccountItem | null>(
    null,
  );

  // Client-side fallback filter
  const filteredAccounts = useMemo(() => {
    if (!Array.isArray(rawAccounts)) return [];
    return rawAccounts.filter((acc) => {
      const matchSearch =
        !searchText ||
        acc.accountName?.toLowerCase().includes(searchText.toLowerCase()) ||
        acc.referenceNumber?.toString().includes(searchText);
      const matchCat = !categoryFilter || acc.type === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [rawAccounts, searchText, categoryFilter]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<AccountItem>[]>(
    () => [
      {
        accessorKey: "referenceNumber",
        header: () => (
          /* Label kecil (11px) */
          <span className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ref
          </span>
        ),
        meta: { headerClassName: "w-24 pl-6", cellClassName: "pl-6" },
        cell: ({ getValue }) => (
          /* UI (14px) */
          <span className="font-mono text-primary text-sm font-medium">
            {String(getValue() ?? "")}
          </span>
        ),
      },
      {
        accessorKey: "accountName",
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Name
          </span>
        ),
        cell: ({ getValue }) => (
          /* UI (14px) */
          <span className="text-sm font-medium">{String(getValue() ?? "")}</span>
        ),
      },
      {
        accessorKey: "type",
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </span>
        ),
        cell: ({ getValue }) => (
          /* Caption (12px) */
          <Badge variant="outline" className="text-xs">
            {String(getValue() ?? "")}
          </Badge>
        ),
      },
      {
        accessorKey: "role",
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Role
          </span>
        ),
        cell: ({ getValue }) => {
          const role = getValue<string | undefined>();
          return role && role !== "Default" ? (
            /* Caption (12px) */
            <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs">
              {role}
            </Badge>
          ) : (
            /* Caption (12px) */
            <span className="text-xs text-muted-foreground">Standard</span>
          );
        },
      },
      {
        accessorKey: "balance",
        header: () => (
          /* Label kecil (11px) */
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Balance
          </div>
        ),
        meta: { cellClassName: "text-right" },
        cell: ({ getValue }) => {
          const balance = Number(getValue() || 0);
          return (
            /* UI (14px) */
            <span
              className={cn(
                "font-medium font-mono text-sm",
                balance >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              Rp {balance.toLocaleString("en-US")}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: () => (
          /* Label kecil (11px) */
          <div className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </div>
        ),
        meta: { cellClassName: "text-center" },
        cell: ({ getValue }) => {
          const isActive = Boolean(getValue());
          return (
            /* Caption (12px) */
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isActive &&
                  "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          /* Label kecil (11px) */
          <div className="text-center pr-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Action
          </div>
        ),
        meta: { cellClassName: "pr-6" },
        cell: ({ row }) => {
          const acc = row.original;
          return (
            <div className="flex justify-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setEditAccount({ ...acc });
                  setIsEditModalOpen(true);
                }}
              >
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link
                  href={`/reports/general-ledger/permanent#account-${acc.id}`}
                >
                  <BookOpen size={14} />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => setAccountToDelete(acc)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredAccounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* H2 (24px) */}
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Network className="text-primary" size={24} /> Chart of Accounts
          </h1>
          {/* UI (14px) */}
          <p className="text-sm text-muted-foreground mt-1">
            Master list of financial accounts • {filteredAccounts.length}{" "}
            accounts
          </p>
        </div>
        {/* UI (14px) */}
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 text-sm font-medium">
          <Plus size={16} /> New Account
        </Button>
      </div>

      {(errorMessage || isError) && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center py-2"
        >
          {/* Caption (12px) */}
          <AlertDescription className="text-xs">
            {errorMessage ||
              "Gagal mengambil data Chart of Accounts dari server."}
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive-foreground hover:bg-destructive/20"
            onClick={() => setErrorMessage(null)}
          >
            <X size={14} />
          </Button>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex justify-between items-center py-2">
          {/* Caption (12px) */}
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-emerald-500/20"
            onClick={() => setSuccessMessage(null)}
          >
            <X size={14} />
          </Button>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 py-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              {/* UI (14px) */}
              <Input
                className="pl-8 h-9 w-60 text-sm"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              {/* UI (14px) */}
              <SelectTrigger className="h-9 w-44 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              {/* UI (14px) */}
              <SelectContent className="text-sm">
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACCOUNT_RANGES[t]?.label ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoryFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoryFilter("")}
                className="h-9 px-2"
              >
                <X size={14} />
              </Button>
            )}
          </div>
          {/* Caption (12px) */}
          <Badge variant="secondary" className="font-mono text-xs">
            {filteredAccounts.length} total
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      { headerClassName?: string } | undefined;
                    return (
                      <TableHead
                        key={header.id}
                        className={meta?.headerClassName}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  {/* Caption (12px) */}
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-10 text-xs text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const acc = row.original;
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        highlightId === String(acc.id) && "bg-primary/10",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          { cellClassName?: string } | undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            className={meta?.cellClassName}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  {/* Caption (12px) */}
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12 text-xs text-muted-foreground"
                  >
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sub-components Modal Dialogs */}
      <AddAccountDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        accounts={rawAccounts as any}
        onSuccess={(msg) => setSuccessMessage(msg)}
      />

      {editAccount && (
        <EditAccountDialog
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          account={editAccount as any}
          onSuccess={(msg) => setSuccessMessage(msg)}
        />
      )}

      <DeleteAccountAlertDialog
        account={accountToDelete as any}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
        onSuccess={(msg) => setSuccessMessage(msg)}
        onError={(msg) => setErrorMessage(msg)}
      />
    </div>
  );
}

export default function ChartOfAccountsPage() {
  return (
    <Suspense
      fallback={
        /* UI (14px) */
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading chart of accounts...
        </div>
      }
    >
      <ChartOfAccountsContent />
    </Suspense>
  );
}
