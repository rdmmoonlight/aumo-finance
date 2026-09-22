"use client";

import { useState, useEffect } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import RTK Query auto-generated hooks
import {
  usePostApiV1ChartOfAccountsMutation,
  usePutApiV1ChartOfAccountsByIdMutation,
  useDeleteApiV1ChartOfAccountsByIdMutation,
} from "@/lib/generatedApi";

// Tipe DTO lokal untuk UI dialog (sepadan dengan respons API)
export interface ChartOfAccount {
  id: number;
  referenceNumber: number;
  accountName: string;
  type: string;
  role?: string;
  isActive?: boolean;
}

const ACCOUNT_TYPES = [
  "Assets",
  "Liabilities",
  "Equity",
  "OperatingIncome",
  "OperatingExpenses",
  "OtherIncome",
  "OtherExpenses",
];

const ACCOUNT_RANGES: Record<
  string,
  { start: number; end: number; label: string }
> = {
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

// --- ADD DIALOG ---
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

  const [error, setError] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    type: "",
    referenceNumber: 0,
    accountName: "",
    role: "Default",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const refNum = Number(newAccount.referenceNumber);
    const range = ACCOUNT_RANGES[newAccount.type];

    if (range && (refNum < range.start || refNum > range.end)) {
      setError(
        `Ref ${refNum} not valid for ${newAccount.type} (${range.start}-${range.end})`,
      );
      return;
    }

    if (accounts.some((a) => Number(a.referenceNumber) === refNum)) {
      setError(`Code ${refNum} already used`);
      return;
    }

    try {
      await createAccount({
        createAccountRequest: {
          referenceNumber: refNum,
          accountName: newAccount.accountName,
          type: newAccount.type,
          role: newAccount.role,
        },
      }).unwrap();

      onSuccess(`Account '${newAccount.accountName}' created`);
      onOpenChange(false);
      setNewAccount({
        type: "",
        referenceNumber: 0,
        accountName: "",
        role: "Default",
      });
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to create account",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPlus size={18} className="text-primary" /> Add New Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={newAccount.type}
              onValueChange={(v) =>
                setNewAccount({
                  ...newAccount,
                  type: v,
                  referenceNumber: ACCOUNT_RANGES[v]?.start || 0,
                })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACCOUNT_RANGES[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input
              type="number"
              value={newAccount.referenceNumber || ""}
              onChange={(e) =>
                setNewAccount({
                  ...newAccount,
                  referenceNumber: Number(e.target.value),
                })
              }
              disabled={!newAccount.type}
              required
            />
            <p className="text-xs text-muted-foreground">
              {newAccount.type
                ? `Valid: ${ACCOUNT_RANGES[newAccount.type].start}-${ACCOUNT_RANGES[newAccount.type].end}`
                : "Select category first"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              value={newAccount.accountName}
              onChange={(e) =>
                setNewAccount({ ...newAccount, accountName: e.target.value })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Saving..." : "Save Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- EDIT DIALOG ---
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

  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<ChartOfAccount>(account);

  // Sinkronkan state lokal jika props account berubah
  useEffect(() => {
    setEditData(account);
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateAccount({
        id: editData.id,
        updateAccountRequest: {
          referenceNumber: editData.referenceNumber,
          accountName: editData.accountName,
          type: editData.type,
          role: editData.role,
          isActive: editData.isActive,
        },
      }).unwrap();

      onSuccess(`Account '${editData.accountName}' updated`);
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to update account",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={editData.accountName}
              onChange={(e) =>
                setEditData({ ...editData, accountName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Ref Number</Label>
            <Input
              type="number"
              value={editData.referenceNumber}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  referenceNumber: Number(e.target.value),
                })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- DELETE ALERT DIALOG ---
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
      await deleteAccount({ id: account.id }).unwrap();
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
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{account?.accountName}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
