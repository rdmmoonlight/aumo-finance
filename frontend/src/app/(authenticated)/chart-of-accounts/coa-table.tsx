"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useGetApiV1ChartOfAccountsQuery,
  usePostApiV1ChartOfAccountsMutation,
  usePutApiV1ChartOfAccountsByIdMutation,
  useDeleteApiV1ChartOfAccountsByIdMutation,
} from "@/lib/generatedApi";
import {
  Network,
  Plus,
  Pencil,
  BookOpen,
  Trash2,
  X,
  Search,
  Check,
} from "lucide-react";
import {
  ACCOUNT_TYPES,
  ACCOUNT_RANGES,
  ChartOfAccount,
  AccountItem,
} from "./coa-types";
import {
  addAccountSchema,
  editAccountSchema,
} from "@/lib/validations/chart-of-accounts";

// Dynamic schema types
type AddSchemaType = ReturnType<typeof addAccountSchema>;
type EditSchemaType = typeof editAccountSchema;

// ==========================================
// 1. ADD ACCOUNT DIALOG
// ==========================================
export function AddAccountDialog({
  open,
  onOpenChange,
  accounts,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: ChartOfAccount[];
  onSuccess: (msg: string) => void;
}) {
  const [createAccount, { isLoading: isCreating }] =
    usePostApiV1ChartOfAccountsMutation();

  const [apiError, setApiError] = useState<string | null>(null);

  const schema = useMemo(() => addAccountSchema(accounts), [accounts]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.input<AddSchemaType>, any, z.output<AddSchemaType>>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "",
      referenceNumber: 0,
      accountName: "",
      role: "Default",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (values: z.output<AddSchemaType>) => {
    setApiError(null);
    try {
      await createAccount({
        createAccountRequest: {
          referenceNumber: Number(values.referenceNumber),
          accountName: values.accountName,
          type: values.type,
          role: values.role ?? "Default",
        },
      }).unwrap();

      onSuccess(`Account '${values.accountName}' created`);
      onOpenChange(false);
      reset();
    } catch (err: any) {
      setApiError(
        err?.data?.message || err?.message || "Failed to create account"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Plus size={18} className="text-primary" /> Add New Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <Alert variant="destructive" className="text-xs">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Category</Label>
            <Select
              value={selectedType}
              onValueChange={(v) => {
                setValue("type", v, { shouldValidate: true });
                const startRef = ACCOUNT_RANGES[v]?.start || 0;
                setValue("referenceNumber", startRef, {
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACCOUNT_RANGES[t]?.label ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500 font-medium">
                {errors.type.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Reference Number</Label>
            <Input
              type="number"
              {...register("referenceNumber", { valueAsNumber: true })}
              disabled={!selectedType}
              className="text-sm"
            />
            {errors.referenceNumber ? (
              <p className="text-xs text-red-500 font-medium">
                {errors.referenceNumber.message as string}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {selectedType
                  ? `Valid: ${ACCOUNT_RANGES[selectedType]?.start}-${ACCOUNT_RANGES[selectedType]?.end}`
                  : "Select category first"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Account Name</Label>
            <Input {...register("accountName")} className="text-sm" />
            {errors.accountName && (
              <p className="text-xs text-red-500 font-medium">
                {errors.accountName.message as string}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className="text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="text-sm font-medium"
            >
              {isCreating ? "Saving..." : "Save Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// 2. EDIT ACCOUNT DIALOG
// ==========================================
export function EditAccountDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: ChartOfAccount;
  onSuccess: (msg: string) => void;
}) {
  const [updateAccount, { isLoading: isUpdating }] =
    usePutApiV1ChartOfAccountsByIdMutation();

  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<EditSchemaType>, any, z.output<EditSchemaType>>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      id: Number(account.id),
      accountName: account.accountName,
      referenceNumber: Number(account.referenceNumber),
      type: account.type,
      role: account.role ?? "Default",
      isActive: account.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      id: Number(account.id),
      accountName: account.accountName,
      referenceNumber: Number(account.referenceNumber),
      type: account.type,
      role: account.role ?? "Default",
      isActive: account.isActive ?? true,
    });
  }, [account, reset]);

  const onSubmit = async (values: z.output<EditSchemaType>) => {
    setApiError(null);
    try {
      await updateAccount({
        id: values.id,
        updateAccountRequest: {
          referenceNumber: Number(values.referenceNumber),
          accountName: values.accountName,
          type: values.type,
          role: values.role ?? "Default",
          isActive: values.isActive ?? true,
        },
      }).unwrap();

      onSuccess(`Account '${values.accountName}' updated`);
      onOpenChange(false);
    } catch (err: any) {
      setApiError(
        err?.data?.message || err?.message || "Failed to update account"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <Alert variant="destructive" className="text-xs">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Name</Label>
            <Input {...register("accountName")} className="text-sm" />
            {errors.accountName && (
              <p className="text-xs text-red-500 font-medium">
                {errors.accountName.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Ref Number</Label>
            <Input
              type="number"
              {...register("referenceNumber", { valueAsNumber: true })}
              className="text-sm"
            />
            {errors.referenceNumber && (
              <p className="text-xs text-red-500 font-medium">
                {errors.referenceNumber.message as string}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className="text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="text-sm font-medium"
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// 3. DELETE ACCOUNT ALERT DIALOG
// ==========================================
export function DeleteAccountAlertDialog({
  account,
  onOpenChange,
  onSuccess,
  onError,
}: {
  account: ChartOfAccount | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [deleteAccount, { isLoading: isDeleting }] =
    useDeleteApiV1ChartOfAccountsByIdMutation();

  const handleDelete = async () => {
    if (!account) return;

    try {
      await deleteAccount({ id: Number(account.id) }).unwrap();
      onSuccess(`Deleted '${account.accountName}'`);
      onOpenChange(false);
    } catch (err: any) {
      onError(err?.data?.message || err?.message || "Failed to delete account");
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={!!account} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to delete &quot;{account?.accountName}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-medium"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ==========================================
// 4. MAIN TABLE COMPONENT
// ==========================================
export function ChartOfAccountsTable() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  // Local UI Filter States & Edit Mode
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
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

  // Ekstraksi Data Aman
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
    null
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
  const columns = useMemo<ColumnDef<AccountItem>[]>(() => {
    const cols: ColumnDef<AccountItem>[] = [
      {
        accessorKey: "referenceNumber",
        header: () => (
          <span className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ref
          </span>
        ),
        meta: { headerClassName: "w-24 pl-6", cellClassName: "pl-6" },
        cell: ({ getValue }) => (
          <span className="font-mono text-primary text-sm font-medium">
            {String(getValue() ?? "")}
          </span>
        ),
      },
      {
        accessorKey: "accountName",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Name
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">
            {String(getValue() ?? "")}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </span>
        ),
        cell: ({ getValue }) => (
          <Badge variant="outline" className="text-xs">
            {String(getValue() ?? "")}
          </Badge>
        ),
      },
      {
        accessorKey: "role",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Role
          </span>
        ),
        cell: ({ getValue }) => {
          const role = getValue<string | undefined>();
          return role && role !== "Default" ? (
            <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs">
              {role}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Standard</span>
          );
        },
      },
      {
        accessorKey: "balance",
        header: () => (
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Balance
          </div>
        ),
        meta: { cellClassName: "text-right" },
        cell: ({ getValue }) => {
          const balance = Number(getValue() || 0);
          return (
            <span
              className={cn(
                "font-medium font-mono text-sm",
                balance >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {balance.toLocaleString("id-ID")}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: () => (
          <div className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </div>
        ),
        meta: { cellClassName: "text-center" },
        cell: ({ getValue }) => {
          const isActive = Boolean(getValue());
          return (
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isActive &&
                  "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
    ];

    if (isEditMode) {
      cols.push({
        id: "actions",
        header: () => (
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
      });
    }

    return cols;
  }, [isEditMode]);

  const table = useReactTable({
    data: filteredAccounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Utama */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Network className="text-primary" size={24} /> Chart of Accounts
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <Input
                className="pl-8 h-9 w-52 text-sm"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-40 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
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

            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 text-sm font-medium h-9"
            >
              <Plus size={16} /> New Account
            </Button>
            <Button
              variant={isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode((prev) => !prev)}
              className="gap-2 text-sm font-medium h-9"
            >
              {isEditMode ? <Check size={16} /> : <Pencil size={16} />}
              {isEditMode ? "Done Editing" : "Edit"}
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Master list of financial accounts</span>
          <span>•</span>
          <Badge variant="secondary" className="font-mono text-xs font-normal">
            {filteredAccounts.length} accounts
          </Badge>
          <span>•</span>
          <span className="text-xs text-muted-foreground font-medium">
            in IDR (Rp)
          </span>
        </p>
      </div>

      {(errorMessage || isError) && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center py-2"
        >
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
          <AlertDescription className="text-xs">
            {successMessage}
          </AlertDescription>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      | { headerClassName?: string }
                      | undefined;
                    return (
                      <TableHead
                        key={header.id}
                        className={meta?.headerClassName}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                        highlightId === String(acc.id) && "bg-primary/10"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          | { cellClassName?: string }
                          | undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            className={meta?.cellClassName}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
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

      {/* Modal Dialogs */}
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