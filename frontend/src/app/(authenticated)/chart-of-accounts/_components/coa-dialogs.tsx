"use client";

import { useState } from "react";
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
import { useChartOfAccounts, ChartOfAccount } from "@/hooks/use-coa";

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
  const { createAccount } = useChartOfAccounts();
  const [error, setError] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    type: "",
    referenceNumber: 0,
    accountName: "",
    role: "Default",
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    if (accounts.some((a) => a.referenceNumber === refNum)) {
      setError(`Code ${refNum} already used`);
      return;
    }

    createAccount.mutate(
      {
        referenceNumber: refNum,
        accountName: newAccount.accountName,
        type: newAccount.type,
        role: newAccount.role,
      },
      {
        onSuccess: () => {
          onSuccess(`Account '${newAccount.accountName}' created`);
          onOpenChange(false);
          setNewAccount({
            type: "",
            referenceNumber: 0,
            accountName: "",
            role: "Default",
          });
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || "Failed to create account");
        },
      },
    );
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
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending ? "Saving..." : "Save Account"}
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
  const { updateAccount } = useChartOfAccounts();
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<ChartOfAccount>(account);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    updateAccount.mutate(editData, {
      onSuccess: () => {
        onSuccess(`Account '${editData.accountName}' updated`);
        onOpenChange(false);
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || "Failed to update account");
      },
    });
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
            <Button type="submit" disabled={updateAccount.isPending}>
              {updateAccount.isPending ? "Updating..." : "Update"}
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
  const { deleteAccount } = useChartOfAccounts();

  const handleDelete = () => {
    if (!account) return;

    deleteAccount.mutate(account.id, {
      onSuccess: () => {
        onSuccess(`Deleted '${account.accountName}'`);
        onOpenChange(false);
      },
      onError: (err: any) => {
        onError(err?.response?.data?.message || "Failed to delete account");
        onOpenChange(false);
      },
    });
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
          <AlertDialogCancel disabled={deleteAccount.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteAccount.isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {deleteAccount.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
